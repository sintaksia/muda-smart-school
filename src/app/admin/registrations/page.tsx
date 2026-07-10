import Link from "next/link";
import { Download, Filter, Users } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { PageHeader } from "@/src/app/admin/_components/PageHeader";
import { RegistrationTable } from "./_components/RegistrationTable";
import { StatsCards } from "./_components/StatsCards";
import {
  getAllRegistrations,
  getRegistrationStats,
} from "@/src/features/registration/services";

export default async function RegistrationsPage() {
  // Fetch data parallel untuk performa lebih baik
  const [registrations, stats] = await Promise.all([
    getAllRegistrations(),
    getRegistrationStats(),
  ]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Pendaftaran Siswa"
        description="Kelola dan validasi data pendaftaran siswa baru"
        action={
          <div className="flex flex-col gap-2 sm:flex-row">
            {/* Export All Button */}
            <Button variant="outline" size="sm" asChild>
              <Link href="/api/registrations/export?type=all">
                <Download className="mr-2 h-4 w-4" />
                Export Semua
              </Link>
            </Button>
          </div>
        }
      />

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Main Content */}
      <div className="rounded-lg border bg-card p-6">
        {/* Table Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Daftar Pendaftaran</h3>
              <span className="rounded-full bg-muted px-2 py-1 text-xs">
                {registrations.length} data
              </span>
            </div>

            {/* Quick Status Filter */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span>Filter cepat:</span>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/registrations?status=PENDING">
                  Menunggu ({stats.pending})
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/registrations?status=DITERIMA">
                  Diterima ({stats.diterima})
                </Link>
              </Button>
            </div>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Klik nama atau tombol action untuk melihat detail dan validasi data
          </p>
        </div>

        {/* Table */}
        <RegistrationTable data={registrations} />

        {/* Info Footer */}
        <div className="mt-6 rounded-lg bg-muted/50 p-4 text-sm">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-primary/10 p-1">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h4 className="font-medium">Informasi Penting</h4>
              <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
                <li>Hanya admin yang bisa mengubah status pendaftaran</li>
                <li>Pastikan validasi data sebelum menerima pendaftaran</li>
                <li>Export data tersedia dalam format Excel</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
