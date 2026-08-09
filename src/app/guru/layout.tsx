import { redirect } from "next/navigation";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { PortalHeader } from "@/src/features/auth/components/PortalHeader";

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
      <PortalHeader
        homeHref="/guru"
        title="Portal Guru"
        userName={user.name}
        containerClassName="max-w-4xl"
      />
      <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>
    </div>
  );
}
