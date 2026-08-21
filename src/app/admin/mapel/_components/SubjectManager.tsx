"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CreateButton } from "@/src/app/admin/_components/CreateButton";
import { apiRequest } from "@/src/lib/apiRequest";
import { ENTITY_LABELS } from "@/src/lib/constants";
import { SubjectForm } from "./SubjectForm";
import { SubjectTable } from "./SubjectTable";

export interface SubjectRow {
  id: string;
  name: string;
  code: string;
  specialization: string | null;
  gradeLevel: number | null;
  jumlahGuru: number;
  jumlahJadwal: number;
}

interface SubjectManagerProps {
  subjectList: SubjectRow[];
}

export function SubjectManager({ subjectList }: SubjectManagerProps) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState<boolean>(false);

  async function handleDelete(id: string): Promise<void> {
    if (!window.confirm(`Hapus ${ENTITY_LABELS.SUBJECT.toLowerCase()} ini?`)) {
      return;
    }
    try {
      await apiRequest(
        `/api/master/subjects/${id}`,
        "DELETE",
        undefined,
        `Gagal menghapus ${ENTITY_LABELS.SUBJECT.toLowerCase()}`,
      );
      toast.success(`${ENTITY_LABELS.SUBJECT} dihapus`);
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <CreateButton
          label={`Tambah ${ENTITY_LABELS.SUBJECT}`}
          onClick={() => setFormOpen(true)}
        />
      </div>

      <SubjectTable rows={subjectList} onDelete={handleDelete} />

      <SubjectForm open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
