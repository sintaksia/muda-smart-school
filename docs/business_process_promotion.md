# Kenaikan Kelas — Rancangan Implementasi

Proses tahunan yang memindahkan seluruh siswa aktif dari satu tahun ajaran ke
tahun ajaran berikutnya dalam satu operasi, menggantikan pengeditan `classId`
satu per satu lewat form siswa.

**Status: terimplementasi.** Kode, tes dan migrasi sudah ada di repo; kedua
file migrasi belum diterapkan ke database (lihat §9).

---

## 1. Aturan bisnis

| Kondisi | Hasil |
| --- | --- |
| Siswa `ACTIVE` di kelas tingkat 10 | naik ke kelas tingkat 11 di TA baru |
| Siswa `ACTIVE` di kelas tingkat 11 | naik ke kelas tingkat 12 di TA baru |
| Siswa `ACTIVE` di kelas tingkat 12 | status → `GRADUATED`, `classId` → `null` |
| Tinggal kelas | tetap di tingkat yang sama, dipindah ke kelas TA baru dengan tingkat sama |
| Keluar / pindah sekolah | status → `TRANSFERRED` atau `DROPPED_OUT`, `classId` → `null` |
| Siswa tanpa kelas (`classId = null`) | tidak ikut proses, dilaporkan sebagai "belum ditempatkan" |
| Siswa berstatus non-`ACTIVE` | tidak ikut proses |

Asumsi yang dipakai sampai dikoreksi:

- **Tinggal kelas mungkin terjadi**, jadi aksi per siswa bisa di-override.
- **Pindah jurusan tidak otomatis.** Saran kelas tujuan selalu sejurusan;
  admin boleh memilih kelas tujuan mana pun secara manual, termasuk lintas
  jurusan, tapi sistem tidak pernah menyarankannya.
- **Kenaikan dijalankan per tahun ajaran, sekali**, bukan per kelas. Satu
  batch mencakup seluruh sekolah supaya tidak ada siswa yang tertinggal
  setengah jalan.

### Empat aksi

Aksi disimpan sebagai Prisma enum `PromotionAction` supaya riwayat bisa
diaudit dan dibatalkan:

| Aksi | Efek pada `Student` | Butuh `targetClassId` |
| --- | --- | --- |
| `PROMOTE` | `classId` = kelas tujuan, status tetap `ACTIVE` | ya |
| `RETAIN` | `classId` = kelas tujuan (tingkat sama), status tetap `ACTIVE` | ya |
| `GRADUATE` | `classId` = `null`, status → `GRADUATED` | tidak |
| `EXIT` | `classId` = `null`, status → `TRANSFERRED` / `DROPPED_OUT` | tidak |

`RETAIN` secara teknis identik dengan `PROMOTE`, dipisah supaya laporan dan
riwayat bisa membedakan siswa yang tinggal kelas — informasi yang hilang kalau
keduanya digabung.

---

## 2. Model data

Dua model baru. `Student` tidak dapat kolom baru — tahun ajaran siswa saat ini
tetap diturunkan dari `schoolClass.academicYear`.

### 2.1 `StudentClassHistory`

Satu baris per (siswa, tahun ajaran). Inilah yang membuat rekap per-TA tetap
benar setelah `classId` bergeser.

```prisma
model StudentClassHistory {
  id           String          @id @default(cuid())
  studentId    String          @map("student_id")
  classId      String?         @map("class_id")
  academicYear String          @map("academic_year")
  status       StudentStatus   @default(ACTIVE)
  /// Aksi yang menghasilkan baris ini. Null untuk baris hasil backfill.
  action       PromotionAction?
  batchId      String?         @map("batch_id")
  createdAt    DateTime        @default(now()) @map("created_at")
  updatedAt    DateTime        @updatedAt @map("updated_at")

  student     Student         @relation(fields: [studentId], references: [id], onDelete: Cascade)
  schoolClass SchoolClass?    @relation(fields: [classId], references: [id])
  batch       PromotionBatch? @relation(fields: [batchId], references: [id])

  @@unique([studentId, academicYear])
  @@index([academicYear, classId])
  @@map("student_class_histories")
}
```

### 2.2 `PromotionBatch`

Catatan audit satu kali jalan, sekaligus pegangan untuk pembatalan.

```prisma
model PromotionBatch {
  id               String    @id @default(cuid())
  fromAcademicYear String    @map("from_academic_year")
  toAcademicYear   String    @map("to_academic_year")
  promotedCount    Int       @default(0) @map("promoted_count")
  retainedCount    Int       @default(0) @map("retained_count")
  graduatedCount   Int       @default(0) @map("graduated_count")
  exitedCount      Int       @default(0) @map("exited_count")
  executedById     String?   @map("executed_by_id")
  revertedAt       DateTime? @map("reverted_at")
  createdAt        DateTime  @default(now()) @map("created_at")

  executedBy User?                 @relation("PromotionExecutor", fields: [executedById], references: [id])
  histories  StudentClassHistory[]

  @@map("promotion_batches")
}
```

### 2.3 Enum

```prisma
enum PromotionAction {
  PROMOTE
  RETAIN
  GRADUATE
  EXIT
}
```

### 2.4 Relasi balik

- `Student` → `classHistories StudentClassHistory[]`
- `SchoolClass` → `studentHistories StudentClassHistory[]`
- `User` → `promotionBatches PromotionBatch[] @relation("PromotionExecutor")`

### 2.5 Kenapa cukup dua model

Pembatalan tidak butuh tabel "entry" terpisah. Baris riwayat TA lama sudah
menyimpan `classId` dan `status` siswa sebelum kenaikan; membatalkan batch
berarti mengembalikan setiap siswa dari baris TA sebelumnya lalu menghapus
baris yang dibuat batch itu.

---

## 3. Tahun ajaran aktif

Belum ada konsep "TA yang sedang berjalan" di sistem — `academicYear` hanya
menempel di `SchoolClass` dan `Schedule` (nullable). Kenaikan kelas butuh
patokan ini, dan absensi juga akan butuh nanti.

Ikuti pola `ATTENDANCE_SETTING_DEFINITIONS`:

**`src/features/master/constants.ts`**

```ts
export const ACADEMIC_SETTINGS_GROUP = "academic";

export const ACADEMIC_SETTING_DEFINITIONS = [
  {
    key: "ACTIVE_ACADEMIC_YEAR",
    label: "Tahun Ajaran Aktif",
    type: "TEXT",
    value: "",
  },
] as const;

/** Bulan (1–12) saat tahun ajaran baru dimulai. */
export const ACADEMIC_YEAR_START_MONTH = 7;
```

**`src/features/master/services/academicYear.ts`**

```ts
getActiveAcademicYear(): Promise<string>   // fallback: diturunkan dari tanggal hari ini
setActiveAcademicYear(value: string): Promise<void>
```

Fallback dihitung dari `ACADEMIC_YEAR_START_MONTH`: sebelum Juli → `2025/2026`,
Juli ke atas → `2026/2027`. Jadi sistem tetap jalan sebelum admin menyimpan
setting pertama kali.

---

## 4. Konstanta bersama

**`src/lib/constants.ts`** — mengikuti aturan Enum Single Source of Truth:

```ts
export const promotionActionOptions = [
  { value: "PROMOTE", label: "Naik Kelas", badge: "success" as const },
  { value: "RETAIN", label: "Tinggal Kelas", badge: "warning" as const },
  { value: "GRADUATE", label: "Lulus", badge: "info" as const },
  { value: "EXIT", label: "Keluar", badge: "destructive" as const },
] as const;

export const PROMOTION_ACTION_VALUES = promotionActionOptions.map((o) => o.value);
export const PROMOTION_ACTION_LABELS: Record<string, string> = Object.fromEntries(
  promotionActionOptions.map((o) => [o.value, o.label]),
);
export const PROMOTION_ACTION_BADGES: Record<
  string,
  "success" | "warning" | "info" | "destructive"
> = Object.fromEntries(promotionActionOptions.map((o) => [o.value, o.badge]));

/** Status akhir yang boleh dipilih untuk aksi EXIT. */
export const promotionExitStatusOptions = studentStatusOptions.filter(
  (option) => option.value === "TRANSFERRED" || option.value === "DROPPED_OUT",
);
```

`gradeLevelOptions` yang sudah ada dipakai ulang untuk label tingkat — jangan
deklarasikan lagi.

---

## 5. Utils murni

**`src/features/master/utils/promotion.ts`** — tanpa Prisma, gampang dites.

```ts
/** "2025/2026" → "2026/2027". Melempar bila format tidak valid. */
export function nextAcademicYear(academicYear: string): string;

/** 10 → 11, 11 → 12, 12 → null (lulus). */
export function nextGradeLevel(gradeLevel: number): number | null;

/** "X PPLG 1" → 1; "XI TKR" → null. Dipakai untuk mencocokkan rombel. */
export function classGroupIndex(name: string): number | null;

/**
 * Kelas tujuan yang disarankan: jurusan sama, tingkat sesuai, dan nomor
 * rombel sama bila ada. Mengembalikan null bila tidak ada yang cocok.
 */
export function suggestTargetClass(
  source: PromotionClassRef,
  gradeLevel: number,
  candidates: PromotionClassRef[],
): string | null;

/** Aksi default untuk satu siswa sebelum admin mengubahnya. */
export function defaultPromotionAction(gradeLevel: number): PromotionAction;
```

`suggestTargetClass` sengaja mencocokkan nomor rombel supaya "X PPLG 1" jatuh
ke "XI PPLG 1", bukan ke "XI PPLG 2" yang kebetulan lebih dulu terurut.

---

## 6. Service

**`src/features/master/services/classPromotion.ts`**

```ts
getPromotionPreview(fromAcademicYear: string, toAcademicYear: string):
  Promise<PromotionPreview>

executePromotion(input: PromotionInput, executedById: string):
  Promise<PromotionResult>

revertPromotion(batchId: string): Promise<{ ok: boolean; error: string | null }>

getPromotionBatches(): Promise<PromotionBatchRow[]>
```

### 6.1 Preview

1. Ambil kelas TA asal (dengan siswa `ACTIVE`) dan kelas TA tujuan.
2. Untuk tiap kelas asal, hitung `nextGradeLevel` lalu `suggestTargetClass`.
3. Kembalikan struktur bergrup: kelas asal → daftar siswa → aksi default +
   kelas tujuan yang disarankan, ditambah daftar kelas TA tujuan sebagai opsi
   dropdown dan daftar siswa aktif tanpa kelas sebagai peringatan.

Preview tidak menulis apa pun.

### 6.2 Eksekusi

Semua di dalam satu `prisma.$transaction(..., { timeout: 30_000 })`:

1. **Validasi ulang di server.** Jangan percaya rencana dari klien: pastikan
   tiap `studentId` benar ada, berstatus `ACTIVE`, dan tiap `targetClassId`
   memang milik TA tujuan. Rencana yang tidak lolos ditolak seluruhnya, bukan
   sebagian — kenaikan setengah jalan lebih buruk daripada gagal total.
2. **Buat `PromotionBatch`.**
3. **Snapshot TA lama** — `createMany` baris `StudentClassHistory` untuk
   (siswa, `fromAcademicYear`) dengan `classId`/`status` yang berlaku
   sekarang, `skipDuplicates: true` supaya backfill yang sudah ada tidak
   ditimpa.
4. **Update siswa secara bergrup**, bukan satu per satu. Kelompokkan entri
   berdasarkan `(status, classId)` tujuan lalu jalankan satu `updateMany` per
   kelompok. Untuk 500 siswa dan 20 kelas ini jadi ~22 statement, bukan 500.
5. **Buat baris riwayat TA baru** dengan `batchId` dan `action`.
6. **Perbarui `ACTIVE_ACADEMIC_YEAR`** ke TA tujuan.

Hasil yang dikembalikan: jumlah per aksi + `batchId`.

### 6.3 Pembatalan

`revertPromotion(batchId)`, dalam satu transaksi:

1. Tolak bila batch sudah `revertedAt`, atau bila ada batch lain yang lebih
   baru dan belum dibatalkan.
2. Untuk tiap baris riwayat milik batch, kembalikan `Student.classId` dan
   `Student.status` dari baris riwayat `fromAcademicYear` milik siswa itu.
3. Hapus baris riwayat milik batch, isi `revertedAt`, kembalikan
   `ACTIVE_ACADEMIC_YEAR` ke `fromAcademicYear`.

Batasan yang perlu disampaikan ke admin di UI: pembatalan tidak mengembalikan
data yang dibuat *setelah* kenaikan — jadwal baru, sesi, absensi yang sudah
terlanjur tercatat di kelas tujuan tetap ada. Karena itu pembatalan diposisikan
sebagai "urungkan kalau salah pencet", bukan fitur rutin.

### 6.4 Menyiapkan kelas TA tujuan

Kelas tujuan harus sudah ada sebelum preview berguna. Tambahkan di
`src/features/master/services/schoolClass.ts`:

```ts
cloneClassesToAcademicYear(from: string, to: string):
  Promise<{ created: number; skipped: number }>
```

Menyalin tiap kelas tingkat 10/11 menjadi kelas tingkat berikutnya di TA
tujuan (angka romawi di nama diganti, jurusan dan wali kelas ikut terbawa),
melewati yang namanya sudah ada karena `@@unique([name, academicYear])`. Kelas
tingkat 10 untuk siswa baru **tidak** dibuat di sini — itu urusan alur
penerimaan pendaftaran.

---

## 7. API

Semua route memeriksa `getCurrentUser()` + `canAccessAdmin()` lebih dulu,
memvalidasi body dengan Zod, dan tidak pernah membocorkan error Prisma.

| Method | Route | Fungsi |
| --- | --- | --- |
| `GET` | `/api/master/students/class-promotion?from=&to=` | preview |
| `POST` | `/api/master/students/class-promotion` | jalankan |
| `POST` | `/api/master/students/class-promotion/revert` | batalkan batch |
| `POST` | `/api/master/classes/clone` | siapkan kelas TA tujuan |
| `GET`/`PUT` | `/api/master/academic-year` | baca/simpan TA aktif |

**`src/app/api/master/students/class-promotion/ClassPromotionSchema.ts`**

```ts
import { z } from "zod";
import { PROMOTION_ACTION_VALUES } from "@/src/lib/constants";

const academicYearSchema = z
  .string()
  .regex(/^\d{4}\/\d{4}$/, { message: "Format tahun ajaran: 2026/2027" });

const entrySchema = z.object({
  studentId: z.string({ message: "Siswa wajib dipilih" }).min(1),
  action: z.enum(PROMOTION_ACTION_VALUES as [string, ...string[]], {
    message: "Aksi kenaikan tidak dikenal",
  }),
  targetClassId: z.string().nullable().optional(),
  exitStatus: z.enum(["TRANSFERRED", "DROPPED_OUT"], {
    message: "Status keluar tidak dikenal",
  }).nullable().optional(),
});

export const classPromotionSchema = z
  .object({
    fromAcademicYear: academicYearSchema,
    toAcademicYear: academicYearSchema,
    entries: z.array(entrySchema).min(1, { message: "Tidak ada siswa diproses" }),
  })
  .superRefine((data, ctx) => {
    if (data.fromAcademicYear === data.toAcademicYear) {
      ctx.addIssue({
        code: "custom",
        path: ["toAcademicYear"],
        message: "Tahun ajaran tujuan harus berbeda",
      });
    }
    data.entries.forEach((entry, index) => {
      const needsClass = entry.action === "PROMOTE" || entry.action === "RETAIN";
      if (needsClass && !entry.targetClassId) {
        ctx.addIssue({
          code: "custom",
          path: ["entries", index, "targetClassId"],
          message: "Kelas tujuan wajib dipilih",
        });
      }
      if (entry.action === "EXIT" && !entry.exitStatus) {
        ctx.addIssue({
          code: "custom",
          path: ["entries", index, "exitStatus"],
          message: "Status keluar wajib dipilih",
        });
      }
    });
  });

export type ClassPromotionInput = z.infer<typeof classPromotionSchema>;
```

Zod v4: pakai `message`, bukan `required_error`.

---

## 8. UI

Route: `/admin/siswa/kenaikan-kelas` (segmen Indonesia, konsisten dengan
`/admin/siswa/kartu`). Menu sidebar baru di `managementMenuItems` dengan ikon
`ArrowUpNarrowWide`, judul `Kenaikan Kelas`.

```
src/app/admin/siswa/kenaikan-kelas/
├── page.tsx                    server component; Promise.all: TA aktif, daftar kelas, batch
├── loading.tsx                 <AdminLoadingState />
├── error.tsx                   <AdminErrorState />
└── _components/
    ├── PromotionManager.tsx        orkestrator klien
    ├── PromotionSetupBar.tsx       pilih TA asal → tujuan, cek kesiapan kelas
    ├── PromotionClassGroup.tsx     satu kelas asal + kontrol massal sekelas
    ├── PromotionStudentRow.tsx     select aksi + select kelas tujuan per siswa
    ├── PromotionSummaryBar.tsx     hitungan per aksi + tombol jalankan (sticky)
    ├── PromotionConfirmDialog.tsx  konfirmasi akhir
    ├── PromotionResultSummary.tsx  hasil + kegagalan
    └── PromotionHistoryTable.tsx   daftar batch + tombol batalkan
```

State rencana tinggal di hook `src/features/master/hooks/usePromotionPlan.ts`
supaya `PromotionManager` tetap di bawah 150 baris:

```ts
usePromotionPlan(preview: PromotionPreview | null): {
  entries: Map<string, PromotionPlanEntry>;
  counts: Record<PromotionAction, number>;
  isComplete: boolean;              // tidak ada entri yang kurang kelas tujuan
  setStudentAction(studentId, action): void;
  setStudentTarget(studentId, classId): void;
  applyToClass(sourceClassId, action, targetClassId): void;
  toPayload(): ClassPromotionInput["entries"];
}
```

### Alur di layar

1. **Siapkan** — pilih TA asal dan tujuan. Kalau kelas TA tujuan belum ada,
   tampilkan peringatan dengan tombol "Siapkan Kelas TA Baru" yang memanggil
   `cloneClassesToAcademicYear`.
2. **Tinjau** — daftar bergrup per kelas asal. Tiap grup punya satu dropdown
   kelas tujuan yang menerapkan ke seluruh kelas sekaligus; baris siswa hanya
   disentuh untuk pengecualian. Inilah yang mengubah 200 kali edit jadi ~20
   kali pilih.
3. **Konfirmasi** — dialog berisi ringkasan (`X naik, Y tinggal, Z lulus,
   W keluar`) dan peringatan bahwa `GRADUATED` mencabut kelas siswa.
4. **Hasil** — ringkasan + tombol menuju riwayat batch.

Empat state async wajib ada di tiap tahap: memuat, kosong ("Belum ada siswa
aktif di TA ini"), error inline, dan sukses. Tombol jalankan nonaktif selama
request berjalan.

Semua kontrol form lewat `SelectField` / `FormSelect`, ukuran dari
`formClasses.ts`, badge dari `src/app/admin/_components/Badge.tsx`.

---

## 9. Migrasi & backfill

### 9.1 Migrasi — **belum diterapkan**

Dua file migrasi sudah ditulis dan menunggu dijalankan:

| File | Isi |
| --- | --- |
| `20260821103000_rename_student_status_to_english` | empat `ALTER TYPE ... RENAME VALUE` |
| `20260821104500_add_student_class_history_and_promotion` | enum `PromotionAction` + dua tabel + indeks + foreign key |


Ikuti alur `diff` → `execute` → `resolve` yang sudah dipakai di proyek ini
(`prisma migrate dev` ingin melakukan reset destruktif), dengan session pooler
port 5432. Nama migrasi: `add_student_class_history_and_promotion`.

Semua perubahan bersifat aditif — dua tabel, satu enum, tiga relasi balik.
Tidak ada kolom yang dihapus atau diubah tipenya, jadi tidak ada risiko
kehilangan data.

### 9.2 Backfill

`prisma/seed.ts` sudah ada; tambahkan skrip sekali jalan
`scripts/backfill-class-history.ts` (dijalankan dengan
`bun --env-file=.env scripts/backfill-class-history.ts`):

Untuk tiap siswa yang punya `classId`, buat baris riwayat
`{ studentId, classId, academicYear: schoolClass.academicYear, status, action: null }`
dengan `skipDuplicates`. Tanpa ini, kenaikan pertama tidak punya baris "TA
sebelumnya" untuk dipulihkan saat dibatalkan.

---

## 10. Tes

Wajib per file baru di `features/` dan `api/`, minimal satu happy path dan
satu error case.

| File | Fokus utama |
| --- | --- |
| `utils/promotion.test.ts` | `nextAcademicYear` format salah; `nextGradeLevel(12) === null`; `suggestTargetClass` cocok nomor rombel dan mengembalikan null saat jurusan tidak ada |
| `services/academicYear.test.ts` | fallback saat setting kosong; upsert saat menyimpan |
| `services/classPromotion.test.ts` | preview mengelompokkan per kelas; eksekusi menulis batch + riwayat + `updateMany` bergrup; rencana dengan `targetClassId` milik TA lain ditolak seluruhnya; revert memulihkan `classId` dan menolak batch yang sudah dibatalkan |
| `services/schoolClass.test.ts` | tambahan kasus `cloneClassesToAcademicYear` melewati nama yang sudah ada |
| `api/master/students/class-promotion/route.test.ts` | 403 tanpa auth; 400 body tidak valid; 200 happy path |
| `api/master/students/class-promotion/revert/route.test.ts` | 403; 400 batch tidak ditemukan; 200 |
| `api/master/academic-year/route.test.ts` | 403; 400 format TA salah; 200 |
| `hooks/usePromotionPlan.test.ts` | `applyToClass` menimpa seluruh kelas; `isComplete` false saat ada kelas tujuan kosong |

Mock `prisma` dengan `vi.mock`, hook diuji dengan `renderHook`.

---

## 11. Perbaikan yang ikut terbawa

Tiga hal yang akan salah begitu `classId` mulai bergeser tiap tahun, dan
sebaiknya diperbaiki dalam pekerjaan yang sama:

1. **Rekap kehadiran memfilter lewat siswa, bukan lewat jadwal.**
   `src/app/admin/absensi/siswa/page.tsx:46` memakai `student: { classId }`.
   Setelah kenaikan, memfilter tanggal TA lama per kelas akan memakai kelas
   siswa yang *sekarang* dan hasilnya salah. Ganti ke `schedule: { classId }` —
   absensi memang terikat ke jadwal, dan jadwal terikat ke kelas, jadi ini
   sekaligus lebih benar secara semantik dan tidak butuh tabel riwayat.

2. **`/admin/kelas` belum punya filter tahun ajaran.** Kelas TA lama tidak bisa
   dihapus selama masih punya siswa atau jadwal (`deleteClass`), jadi daftarnya
   akan bertambah tiap tahun. Tambahkan `SelectField` tahun ajaran yang
   default-nya TA aktif.

3. **Dua konsep "promote" bertabrakan.** `promoteAcceptedRegistrations`
   (`src/features/master/services/studentPromotion.ts`) dan route
   `/api/master/students/promote` sebenarnya bicara soal *penerimaan pendaftar
   jadi siswa*, bukan kenaikan kelas. Sebelum menambah `classPromotion.ts`,
   ganti nama supaya tidak ada dua "promote" dengan arti berbeda:

   | Sekarang | Jadi |
   | --- | --- |
   | `services/studentPromotion.ts` | `services/registrationIntake.ts` |
   | `promoteAcceptedRegistrations()` | `intakeAcceptedRegistrations()` |
   | `getPendingPromotionCount()` | `getPendingIntakeCount()` |
   | `StudentPromotionResult` | `StudentIntakeResult` |
   | `/api/master/students/promote` | `/api/master/students/intake` |
   | `PromoteRegistrationsDialog.tsx` | `RegistrationIntakeDialog.tsx` |

   Rename murni, tidak ada perubahan perilaku. Route API internal dan wajib
   berbahasa Inggris, jadi aman diganti. **Sudah dikerjakan.**

4. **Nilai enum `StudentStatus` masih berbahasa Indonesia.** `AKTIF`,
   `LULUS`, `PINDAH`, `DROPOUT` melanggar aturan English-for-code, dan
   rancangan ini sempat ikut memakainya. Sudah diganti jadi `ACTIVE`,
   `GRADUATED`, `TRANSFERRED`, `DROPPED_OUT` lewat
   `ALTER TYPE ... RENAME VALUE`, mengikuti preseden migrasi
   `20260724191431_rename_cms_enum_values_to_english`. Label tampilan di
   `studentStatusOptions` tetap Indonesia. `docs/openapi.yaml` ikut
   diperbarui — kontrak enum untuk klien mobile berubah, jadi ini breaking
   change bagi konsumen API mana pun yang sudah ada. **Sudah dikerjakan.**

---

## 12. Urutan pengerjaan

Tiap langkah berdiri sendiri dan bisa di-commit terpisah.

| # | Langkah | Status |
| --- | --- | --- |
| 1 | Rename intake (§11.3) | selesai |
| 1b | `StudentStatus` ke bahasa Inggris (§11.4) | selesai — migrasi belum diterapkan |
| 2 | Schema + migrasi + backfill (§2, §9) | selesai — migrasi belum diterapkan |
| 3 | TA aktif: konstanta, service, API (§3) | selesai |
| 4 | Utils murni + tesnya (§5) | selesai |
| 5 | `cloneClassesToAcademicYear` + API (§6.4) | selesai |
| 6 | Service preview + API `GET` (§6.1) | selesai |
| 7 | UI preview & rencana (§8 tahap 1–2) | selesai |
| 8 | Service eksekusi + API `POST` (§6.2) | selesai |
| 9 | UI konfirmasi + hasil (§8 tahap 3–4) | selesai |
| 10 | Revert + riwayat batch (§6.3) | selesai |
| 11 | Perbaikan rekap & filter TA (§11.1–11.2) | selesai |

Yang tersisa hanya penerapan dua migrasi dan backfill ke database — lihat §9.

