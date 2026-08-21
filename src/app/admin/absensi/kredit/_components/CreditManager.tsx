"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CreateButton } from "@/src/app/admin/_components/CreateButton";
import { SelectField } from "@/src/components/common/SelectField";
import { FILTER_FIELD_CLASS } from "@/src/components/common/formClasses";
import {
  creditOwnerTypeOptions,
  CREDIT_OWNER_TYPE_LABELS,
} from "@/src/lib/constants";
import { CreditEntryForm } from "./CreditEntryForm";
import { CreditHistory, type CreditData } from "./CreditHistory";

interface CreditManagerProps {
  students: { id: string; name: string }[];
  teachers: { id: string; name: string }[];
  categories: { ownerType: string; type: string; name: string }[];
}

export function CreditManager({
  students,
  teachers,
  categories,
}: CreditManagerProps) {
  const [ownerType, setOwnerType] = useState<"STUDENT" | "TEACHER">("STUDENT");
  const [ownerId, setOwnerId] = useState<string>("");
  const [credit, setCredit] = useState<CreditData | null>(null);
  const [formOpen, setFormOpen] = useState<boolean>(false);

  const owners = ownerType === "STUDENT" ? students : teachers;
  const ownerName = owners.find((owner) => owner.id === ownerId)?.name ?? "";

  async function loadCredit(nextOwnerId: string): Promise<void> {
    setOwnerId(nextOwnerId);
    setCredit(null);
    if (!nextOwnerId) {
      return;
    }
    try {
      const response = await fetch(
        `/api/attendance/credit-scores?ownerType=${ownerType}&ownerId=${nextOwnerId}`,
      );
      if (!response.ok) {
        throw new Error("Gagal memuat skor kredit");
      }
      setCredit((await response.json()) as CreditData);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <SelectField
            ariaLabel="Jenis Pemilik"
            value={ownerType}
            onChange={(next) => {
              setOwnerType(next as "STUDENT" | "TEACHER");
              setOwnerId("");
              setCredit(null);
            }}
            className={FILTER_FIELD_CLASS}
            options={creditOwnerTypeOptions.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
          />
          <SelectField
            searchable
            ariaLabel={CREDIT_OWNER_TYPE_LABELS[ownerType]}
            placeholder={`Pilih ${CREDIT_OWNER_TYPE_LABELS[ownerType]}…`}
            value={ownerId}
            onChange={loadCredit}
            className={FILTER_FIELD_CLASS}
            options={owners.map((owner) => ({
              value: owner.id,
              label: owner.name,
            }))}
          />
        </div>
        <CreateButton
          label="Entri Manual"
          onClick={() => setFormOpen(true)}
          disabled={!ownerId}
        />
      </div>

      {credit ? (
        <CreditHistory credit={credit} />
      ) : (
        <p className="border-border text-muted-foreground rounded-md border bg-white px-5 py-12 text-center text-sm">
          Pilih {CREDIT_OWNER_TYPE_LABELS[ownerType].toLowerCase()} untuk
          melihat skor dan riwayat kreditnya.
        </p>
      )}

      {ownerId && (
        <CreditEntryForm
          key={ownerId}
          open={formOpen}
          onOpenChange={setFormOpen}
          ownerType={ownerType}
          ownerId={ownerId}
          ownerName={ownerName}
          categories={categories}
          onSaved={() => loadCredit(ownerId)}
        />
      )}
    </div>
  );
}
