import { redirect } from "next/navigation";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { PortalHeader } from "@/src/features/auth/components/PortalHeader";

export default async function SiswaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  if (user.role !== "STUDENT") {
    redirect(user.role === "TEACHER" ? "/guru" : "/admin");
  }

  return (
    <div className="bg-muted min-h-screen">
      <PortalHeader
        homeHref="/siswa"
        title="Portal Siswa"
        userName={user.name}
        containerClassName="max-w-2xl"
      />
      <main className="mx-auto max-w-2xl px-4 py-6">{children}</main>
    </div>
  );
}
