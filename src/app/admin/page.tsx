import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Badge } from "@/src/app/admin/_components/Badge";
import { Users, FileText, GraduationCap, Calendar } from "lucide-react";
import {
  getAllRegistrations,
  getRegistrationStats,
} from "@/src/features/registration/services/registration.service";
import {
  STATUS_PENDAFTARAN_LABELS,
  STATUS_PENDAFTARAN_BADGES,
} from "@/src/lib/constants";

export default async function AdminPage() {
  const [stats, registrations] = await Promise.all([
    getRegistrationStats(),
    getAllRegistrations(),
  ]);

  const recentRegistrations = registrations.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Selamat datang di panel administrasi Muda Smart School.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Pendaftaran
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Seluruh calon siswa</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pendaftaran Baru
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Menunggu verifikasi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Diterima</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.diterima}</div>
            <p className="text-xs text-muted-foreground">
              Calon siswa diterima
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ditolak</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ditolak}</div>
            <p className="text-xs text-muted-foreground">Calon siswa ditolak</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pendaftaran Terbaru</CardTitle>
            <CardDescription>
              Daftar calon siswa yang baru mendaftar
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentRegistrations.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Belum ada pendaftaran.
              </p>
            ) : (
              <div className="space-y-4">
                {recentRegistrations.map((registration) => (
                  <div
                    key={registration.id}
                    className="flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {registration.namaLengkap}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {registration.nomorPendaftaran} &middot;{" "}
                        {registration.programKeahlian}
                      </p>
                    </div>
                    <Badge
                      variant={STATUS_PENDAFTARAN_BADGES[registration.status]}
                    >
                      {STATUS_PENDAFTARAN_LABELS[registration.status]}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aktivitas Terbaru</CardTitle>
            <CardDescription>Log aktivitas sistem terkini</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Aktivitas sistem akan ditampilkan di sini.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
