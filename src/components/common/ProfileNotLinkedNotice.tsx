import { UserX } from "lucide-react";

interface ProfileNotLinkedNoticeProps {
  /** Display noun of the missing profile, e.g. ENTITY_LABELS.TEACHER */
  entityLabel: string;
  /** Email of the signed-in account, so the admin can be told which one */
  email: string;
}

/**
 * Shown when an authenticated user's role has no matching profile record
 * (Teacher/Student). Without this the portal pages bounced back to /login,
 * which looked like a failed login.
 */
export function ProfileNotLinkedNotice({
  entityLabel,
  email,
}: ProfileNotLinkedNoticeProps) {
  return (
    <div className="border-border bg-card flex flex-col items-center gap-3 rounded-md border p-8 text-center">
      <span className="bg-muted flex h-12 w-12 items-center justify-center rounded-full">
        <UserX className="text-neutral-600 h-6 w-6" aria-hidden />
      </span>
      <h1 className="text-foreground text-lg font-semibold">
        Data {entityLabel} belum terhubung
      </h1>
      <p className="text-neutral-600 max-w-md text-sm">
        Akun <span className="font-medium">{email}</span> belum memiliki data{" "}
        {entityLabel.toLowerCase()}. Hubungi administrator untuk melengkapi data
        Anda sebelum menggunakan portal ini.
      </p>
    </div>
  );
}
