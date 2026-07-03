import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/src/app/admin/_components/PageHeader";
import { UserForm } from "../_components/UserForm";
import { getUserById } from "@/src/features/auth/services/users";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import {
  canManageUsers,
  canModifyUser,
} from "@/src/features/auth/utils/permissions";

interface EditUserPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  const { id } = await params;
  const currentUser = await getCurrentUser();

  // Only SUPER_ADMIN and ADMIN can access user management
  if (!currentUser || !canManageUsers(currentUser.role)) {
    redirect("/admin");
  }

  const user = await getUserById(id);

  if (!user) {
    notFound();
  }

  // ADMIN can only edit TEACHER/STUDENT accounts, not other admins
  if (!canModifyUser(currentUser.role, user.role)) {
    redirect("/admin/users");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit User"
        description={`Ubah data untuk ${user.name}`}
      />
      <UserForm user={user} mode="edit" actorRole={currentUser.role} />
    </div>
  );
}
