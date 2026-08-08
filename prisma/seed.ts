import { config } from "dotenv";
import { resolve } from "path";

// Load .env from project root
config({ path: resolve(process.cwd(), ".env") });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { createClient } from "@supabase/supabase-js";
// Relative import: this script runs outside Next's path aliases.
import { ATTENDANCE_SETTING_DEFINITIONS } from "../src/features/attendance/constants";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Create Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY");
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const CREDIT_CATEGORIES: {
  ownerType: "STUDENT" | "TEACHER";
  type: "ACHIEVEMENT" | "VIOLATION";
  name: string;
}[] = [
  { ownerType: "STUDENT", type: "VIOLATION", name: "Kedisiplinan" },
  { ownerType: "STUDENT", type: "VIOLATION", name: "Akademik" },
  { ownerType: "STUDENT", type: "VIOLATION", name: "Etika/Perilaku" },
  { ownerType: "STUDENT", type: "VIOLATION", name: "Seragam/Atribut" },
  { ownerType: "STUDENT", type: "ACHIEVEMENT", name: "Akademik" },
  { ownerType: "STUDENT", type: "ACHIEVEMENT", name: "Non-akademik/Lomba" },
  { ownerType: "STUDENT", type: "ACHIEVEMENT", name: "Ekstrakurikuler" },
  { ownerType: "STUDENT", type: "ACHIEVEMENT", name: "Kepemimpinan" },
  { ownerType: "TEACHER", type: "VIOLATION", name: "Kedisiplinan" },
  {
    ownerType: "TEACHER",
    type: "VIOLATION",
    name: "Administrasi (jurnal/RPP)",
  },
  { ownerType: "TEACHER", type: "VIOLATION", name: "Komplain" },
  { ownerType: "TEACHER", type: "ACHIEVEMENT", name: "Kehadiran Sempurna" },
  {
    ownerType: "TEACHER",
    type: "ACHIEVEMENT",
    name: "Pembinaan Siswa Berprestasi",
  },
  { ownerType: "TEACHER", type: "ACHIEVEMENT", name: "Sertifikasi/Pelatihan" },
  { ownerType: "TEACHER", type: "ACHIEVEMENT", name: "Inovasi Pengajaran" },
];

async function seedAttendanceSettings() {
  for (const [index, setting] of ATTENDANCE_SETTING_DEFINITIONS.entries()) {
    await prisma.schoolSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: {
        key: setting.key,
        value: setting.value,
        label: setting.label,
        type: setting.type,
        group: "attendance",
        order: index,
      },
    });
  }
  console.log(
    `Attendance settings seeded (${ATTENDANCE_SETTING_DEFINITIONS.length})`,
  );
}

async function seedCreditCategories() {
  for (const [index, category] of CREDIT_CATEGORIES.entries()) {
    await prisma.creditCategory.upsert({
      where: {
        ownerType_type_name: {
          ownerType: category.ownerType,
          type: category.type,
          name: category.name,
        },
      },
      update: {},
      create: { ...category, order: index },
    });
  }
  console.log(`Credit categories seeded (${CREDIT_CATEGORIES.length})`);
}

async function main() {
  console.log("Starting seed...");

  await seedAttendanceSettings();
  await seedCreditCategories();

  // Check if super admin already exists
  const existingAdmin = await prisma.user.findFirst({
    where: { role: "SUPER_ADMIN" },
  });

  if (existingAdmin) {
    console.log("Super admin already exists:", existingAdmin.email);
    return;
  }

  // Create super admin in Supabase Auth
  const adminEmail = "admin@muda.sch.id";
  const adminPassword = "Admin@Muda2026"; // Change this after first login!

  console.log("Creating super admin in Supabase Auth...");

  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
    });

  if (authError) {
    // If user already exists in Supabase but not in our DB, get the user
    if (authError.message.includes("already been registered")) {
      console.log("User already exists in Supabase Auth, fetching...");

      const { data: users } = await supabaseAdmin.auth.admin.listUsers();
      const existingAuthUser = users?.users?.find(
        (u) => u.email === adminEmail,
      );

      if (existingAuthUser) {
        // Create in Prisma
        const dbUser = await prisma.user.create({
          data: {
            id: existingAuthUser.id,
            email: adminEmail,
            name: "Super Admin",
            role: "SUPER_ADMIN",
            status: "ACTIVE",
          },
        });

        console.log("Super admin created in database:", dbUser.email);
        return;
      }
    }

    throw new Error(`Failed to create auth user: ${authError.message}`);
  }

  if (!authData.user) {
    throw new Error("No user returned from Supabase");
  }

  console.log("Creating super admin in database...");

  // Create user in Prisma
  const dbUser = await prisma.user.create({
    data: {
      id: authData.user.id,
      email: adminEmail,
      name: "Super Admin",
      role: "SUPER_ADMIN",
      status: "ACTIVE",
    },
  });

  console.log("Super admin created successfully!");
  console.log("Email:", dbUser.email);
  console.log("Password:", adminPassword);
  console.log("\n⚠️  IMPORTANT: Change the password after first login!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Seed error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
