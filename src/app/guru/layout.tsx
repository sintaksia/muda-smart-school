import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/src/features/auth/services/auth";

export default async function GuruLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  if (user.role !== "TEACHER") {
    redirect(user.role === "STUDENT" ? "/siswa" : "/admin");
  }

  return (
    <div className="bg-muted min-h-screen">
      <header className="border-border sticky top-0 z-10 border-b bg-white">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <Link href="/guru" className="flex items-center gap-2">
            <span className="bg-primary-900 flex h-8 w-8 items-center justify-center rounded-sm text-sm font-bold text-white">
              M
            </span>
            <span className="text-foreground text-sm font-semibold">
              Portal Guru
            </span>
          </Link>
          <span className="text-neutral-600 text-sm">{user.name}</span>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>
    </div>
  );
}
