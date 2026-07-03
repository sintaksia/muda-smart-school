import { redirect } from "next/navigation";
import { PageHeader } from "@/src/app/admin/_components/PageHeader";
import { UserForm } from "../_components/UserForm";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { canManageUsers } from "@/src/features/auth/utils/permissions";

export default async function CreateUserPage() {
  const currentUser = await getCurrentUser();

  // Only SUPER_ADMIN and ADMIN can create users
  if (!currentUser || !canManageUsers(currentUser.role)) {
    redirect("/admin");
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Tambah User" description="Buat akun pengguna baru" />
      <UserForm mode="create" actorRole={currentUser.role} />
    </div>
  );
}
