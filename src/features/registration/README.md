# Registration Feature (PPDB / SPMB)

Pendaftaran siswa baru: form publik untuk calon siswa dan manajemen pendaftaran untuk admin.

## Alur

### Publik (tanpa login)

1. Calon siswa mengisi form di `/registrasi` (`src/app/registrasi/_components/RegistrasiForm.tsx`).
2. Form divalidasi dengan `registrasiSchema` (Zod) lalu dikirim ke `POST /api/registrasi`.
3. Service `createRegistration` menolak NISN/NIK duplikat (respon 409) dan meng-generate nomor pendaftaran `SPMB-<tahun>-<urutan 3 digit>`. Record dibuat dengan status `PENDING`.

### Admin (wajib login, role minimal ADMIN)

Halaman di `src/app/admin/registrations/`:

- **List** (`page.tsx`) — tabel semua pendaftaran + kartu statistik; mendukung filter `?status=` via query string.
- **Detail** (`[id]/page.tsx`) — tab data diri/orang tua/sekolah/status + aksi ubah status.
- **Edit** (`[id]/edit/page.tsx`) — form edit penuh (`RegistrationEditForm`, section di `_components/edit-form/`).
- Aksi baris: terima/tolak/verifikasi (PATCH), hapus (DELETE), cetak, buat akun siswa (`POST /api/students`).

## Siklus status

```
PENDING → DIVERIFIKASI → DITERIMA | DITOLAK
        └───────────────↗
```

Nilai, label, dan varian badge status didefinisikan sekali di `src/lib/constants.ts` (`statusPendaftaranOptions`) — jangan hardcode di komponen.

## API

| Endpoint                              | Method | Auth   | Keterangan                                |
| ------------------------------------- | ------ | ------ | ----------------------------------------- |
| `/api/registrasi`                     | GET    | Admin  | List semua / filter `?status=`            |
| `/api/registrasi`                     | POST   | Publik | Buat pendaftaran (form publik)            |
| `/api/registrasi/[id]`                | GET    | Admin  | Detail satu pendaftaran                   |
| `/api/registrasi/[id]`                | PATCH  | Admin  | Update status (divalidasi Zod)            |
| `/api/registrasi/[id]`                | PUT    | Admin  | Edit penuh (payload = `registrasiSchema`) |
| `/api/registrasi/[id]`                | DELETE | Admin  | Hapus permanen                            |
| `/api/registrations/export`           | POST   | —      | Export Excel                              |
| `/api/admin/registrations/[id]/print` | GET    | —      | Cetak formulir                            |

Auth memakai `getCurrentUser` + `canAccessAdmin`; semua endpoint kecuali POST publik mengembalikan 401/403 tanpa sesi admin (data berisi PII).

## Struktur file

```
src/features/registration/services/
├── registration.service.ts   # CRUD + konversi form→Prisma (create & partial update)
├── registration.schema.ts    # registrasiSchema (Zod) + requiredFields
├── registration.utils.ts     # format tanggal/telepon, registrationToFormDefaults
└── index.ts                  # re-export semua + tipe Prisma
```

Catatan konversi: field opsional yang dikosongkan pada edit disimpan sebagai `null` (bukan `undefined`) supaya nilai lama benar-benar terhapus di Prisma.

## Test

Setiap file service/util/route punya `.test.ts` berdampingan (mock Prisma per-file dengan `vi.mock`, lihat pola di `src/features/attendance/`). Jalankan `pnpm test:run`.
