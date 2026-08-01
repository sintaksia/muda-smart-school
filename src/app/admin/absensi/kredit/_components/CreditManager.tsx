"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { SelectField } from "@/src/components/common/SelectField";
import { ADMIN_FIELD_CLASS } from "@/src/components/common/formClasses";
import {
  creditEntryTypeOptions,
  creditOwnerTypeOptions,
  CREDIT_OWNER_TYPE_LABELS,
} from "@/src/lib/constants";
import { CreditHistory, type CreditData } from "./CreditHistory";

/** Manual entry records a prestasi or pelanggaran; CORRECTION is only ever
 *  written by the system when an earlier entry is reversed. */
const manualEntryTypeOptions = creditEntryTypeOptions.filter(
  (option) => option.value !== "CORRECTION",
);

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
  const [type, setType] = useState<"ACHIEVEMENT" | "VIOLATION">("VIOLATION");
  const [category, setCategory] = useState<string>("");
  const [points, setPoints] = useState<string>("-5");
  const [note, setNote] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [credit, setCredit] = useState<CreditData | null>(null);

  const owners = ownerType === "STUDENT" ? students : teachers;
  const categoryOptions = categories.filter(
    (c) => c.ownerType === ownerType && c.type === type,
  );

  async function loadCredit(nextOwnerId: string): Promise<void> {
    setOwnerId(nextOwnerId);
    setCredit(null);
    if (!nextOwnerId) {
      return;
    }
    const response = await fetch(
      `/api/attendance/credit-scores?ownerType=${ownerType}&ownerId=${nextOwnerId}`,
    );
    if (response.ok) {
      setCredit((await response.json()) as CreditData);
    }
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch("/api/attendance/credit-scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerType,
          ownerId,
          type,
          category,
          points: Number(points),
          note: note || undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Gagal menyimpan entri");
      }
      toast.success("Entri kredit tersimpan");
      setNote("");
      await loadCredit(ownerId);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="border-border rounded-md border bg-white p-5"
      >
        <h3 className="text-foreground mb-4 text-base font-semibold">
          Entri Manual (Prestasi / Pelanggaran)
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SelectField
            ariaLabel="Jenis Pemilik"
            value={ownerType}
            onChange={(next) => {
              setOwnerType(next as "STUDENT" | "TEACHER");
              setOwnerId("");
              setCredit(null);
              setCategory("");
            }}
            className={ADMIN_FIELD_CLASS}
            options={creditOwnerTypeOptions.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
          />
          <SelectField
            ariaLabel={CREDIT_OWNER_TYPE_LABELS[ownerType]}
            placeholder={`Pilih ${CREDIT_OWNER_TYPE_LABELS[ownerType]}…`}
            value={ownerId}
            onChange={loadCredit}
            className={ADMIN_FIELD_CLASS}
            options={owners.map((owner) => ({
              value: owner.id,
              label: owner.name,
            }))}
          />
          <SelectField
            ariaLabel="Jenis Entri"
            value={type}
            onChange={(next) => {
              setType(next as "ACHIEVEMENT" | "VIOLATION");
              setCategory("");
            }}
            className={ADMIN_FIELD_CLASS}
            options={manualEntryTypeOptions.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
          />
          <SelectField
            ariaLabel="Kategori"
            placeholder="Pilih kategori…"
            value={category}
            onChange={setCategory}
            className={ADMIN_FIELD_CLASS}
            options={categoryOptions.map((option) => ({
              value: option.name,
              label: option.name,
            }))}
          />
          <Input
            type="number"
            value={points}
            onChange={(event) => setPoints(event.target.value)}
            className={`${ADMIN_FIELD_CLASS} tabular-nums`}
            placeholder="Poin (mis. -5 / 10)"
            required
          />
          <Input
            type="text"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className={ADMIN_FIELD_CLASS}
            placeholder="Catatan (opsional)"
          />
        </div>
        <Button
          type="submit"
          disabled={submitting || !ownerId || !category}
          className="mt-4 h-11"
        >
          {submitting ? "Menyimpan..." : "Simpan Entri"}
        </Button>
      </form>

      {credit && <CreditHistory credit={credit} />}
    </div>
  );
}
