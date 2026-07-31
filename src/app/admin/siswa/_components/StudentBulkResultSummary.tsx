"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import type { StudentCredential } from "@/src/features/master/types";

export interface BulkFailureRow {
  id: string;
  label: string;
  error: string;
}

interface StudentBulkResultSummaryProps {
  created: number;
  credentials: StudentCredential[];
  failures: BulkFailureRow[];
}

/**
 * Report for any bulk student creation (Excel import, registration sync):
 * created accounts with their password, plus the rows that failed and why.
 */
export function StudentBulkResultSummary({
  created,
  credentials,
  failures,
}: StudentBulkResultSummaryProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 text-sm font-semibold">
        <span className="text-green-700 flex items-center gap-1.5">
          <CheckCircle2 className="h-4 w-4" />
          {created} berhasil
        </span>
        <span className="text-destructive flex items-center gap-1.5">
          <XCircle className="h-4 w-4" />
          {failures.length} gagal
        </span>
      </div>

      {credentials.length > 0 && (
        <section className="border-border rounded-md border">
          <p className="border-border text-foreground border-b px-4 py-2 text-xs font-semibold">
            Akun yang dibuat — bagikan password ini ke siswa
          </p>
          <div className="max-h-56 overflow-y-auto">
            <table className="w-full text-xs">
              <tbody>
                {credentials.map((credential) => (
                  <tr
                    key={credential.nis}
                    className="border-border border-b last:border-b-0"
                  >
                    <td className="text-foreground px-4 py-2 font-medium">
                      {credential.name}
                    </td>
                    <td className="text-neutral-600 px-4 py-2 tabular-nums">
                      {credential.nis}
                    </td>
                    <td className="text-neutral-600 px-4 py-2">
                      {credential.email}
                    </td>
                    <td className="text-foreground px-4 py-2 font-mono">
                      {credential.password}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {failures.length > 0 && (
        <section className="border-border rounded-md border">
          <p className="border-border text-foreground border-b px-4 py-2 text-xs font-semibold">
            Data yang gagal
          </p>
          <div className="max-h-56 overflow-y-auto">
            <table className="w-full text-xs">
              <tbody>
                {failures.map((failure) => (
                  <tr
                    key={failure.id}
                    className="border-border border-b last:border-b-0"
                  >
                    <td className="text-foreground px-4 py-2">
                      {failure.label}
                    </td>
                    <td className="text-destructive px-4 py-2">
                      {failure.error}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
