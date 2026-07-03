import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { PageHeader } from "@/src/app/admin/_components/PageHeader";
import { UserTable } from "./_components/UserTable";
import { getUsers } from "@/src/features/auth/services/users";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { canManageUsers } from "@/src/features/auth/utils/permissions";

export default async function UsersPage() {
  const currentUser = await getCurrentUser();

  // Only SUPER_ADMIN and ADMIN can access this page
  if (!currentUser || !canManageUsers(currentUser.role)) {
    redirect("/admin");
  }

  const users = await getUsers();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kelola User"
        description="Kelola akun pengguna sistem"
        action={
          <Button asChild>
            <Link href="/admin/users/create">
              <Plus className="mr-2 h-4 w-4" />
              Tambah User
            </Link>
          </Button>
        }
      />
      <UserTable data={users} actorRole={currentUser.role} />
    </div>
  );
}
