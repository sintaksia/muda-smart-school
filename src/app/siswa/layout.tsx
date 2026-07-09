import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/src/features/auth/services/auth";

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
    <div className="bg-surface min-h-screen">
      <header className="border-hairline sticky top-0 z-10 border-b bg-white">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <Link href="/siswa" className="flex items-center gap-2">
            <span className="bg-brand flex h-8 w-8 items-center justify-center rounded-[10px] text-sm font-bold text-white">
              M
            </span>
            <span className="text-ink text-sm font-semibold">Portal Siswa</span>
          </Link>
          <span className="text-ink-secondary text-sm">{user.name}</span>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-6">{children}</main>
    </div>
  );
}
