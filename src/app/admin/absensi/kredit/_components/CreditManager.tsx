"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CreditHistory, type CreditData } from "./CreditHistory";

interface CreditManagerProps {
  students: { id: string; nama: string }[];
  gurus: { id: string; nama: string }[];
  categories: { ownerType: string; type: string; nama: string }[];
}

export function CreditManager({
  students,
  gurus,
  categories,
}: CreditManagerProps) {
  const [ownerType, setOwnerType] = useState<"STUDENT" | "TEACHER">("STUDENT");
  const [ownerId, setOwnerId] = useState<string>("");
  const [type, setType] = useState<"PRESTASI" | "PELANGGARAN">("PELANGGARAN");
  const [category, setCategory] = useState<string>("");
  const [points, setPoints] = useState<string>("-5");
  const [note, setNote] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [credit, setCredit] = useState<CreditData | null>(null);

  const owners = ownerType === "STUDENT" ? students : gurus;
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

  const inputClass =
    "border-hairline-strong text-ink rounded-input h-11 border bg-white px-3 text-sm";

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="border-hairline rounded-card border bg-white p-5"
      >
        <h3 className="text-ink mb-4 text-base font-semibold">
          Entri Manual (Prestasi / Pelanggaran)
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <select
            value={ownerType}
            onChange={(event) => {
              setOwnerType(event.target.value as "STUDENT" | "TEACHER");
              setOwnerId("");
              setCredit(null);
              setCategory("");
            }}
            className={inputClass}
          >
            <option value="STUDENT">Siswa</option>
            <option value="TEACHER">Guru</option>
          </select>
          <select
            value={ownerId}
            onChange={(event) => loadCredit(event.target.value)}
            className={inputClass}
          >
            <option value="">
              Pilih {ownerType === "STUDENT" ? "siswa" : "guru"}…
            </option>
            {owners.map((owner) => (
              <option key={owner.id} value={owner.id}>
                {owner.nama}
              </option>
            ))}
          </select>
          <select
            value={type}
            onChange={(event) => {
              setType(event.target.value as "PRESTASI" | "PELANGGARAN");
              setCategory("");
            }}
            className={inputClass}
          >
            <option value="PELANGGARAN">Pelanggaran</option>
            <option value="PRESTASI">Prestasi</option>
          </select>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className={inputClass}
            required
          >
            <option value="">Pilih kategori…</option>
            {categoryOptions.map((option) => (
              <option key={option.nama} value={option.nama}>
                {option.nama}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={points}
            onChange={(event) => setPoints(event.target.value)}
            className={`${inputClass} tabular-nums`}
            placeholder="Poin (mis. -5 / 10)"
            required
          />
          <input
            type="text"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className={inputClass}
            placeholder="Catatan (opsional)"
          />
        </div>
        <button
          type="submit"
          disabled={submitting || !ownerId || !category}
          className="bg-brand hover:bg-brand-600 active:bg-brand-700 rounded-input mt-4 h-11 px-5 text-sm font-semibold text-white transition-colors disabled:opacity-50"
        >
          {submitting ? "Menyimpan..." : "Simpan Entri"}
        </button>
      </form>

      {credit && <CreditHistory credit={credit} />}
    </div>
  );
}
