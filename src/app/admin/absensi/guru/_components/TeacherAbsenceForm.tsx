"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface TeacherAbsenceFormProps {
  teacherOptions: { id: string; name: string }[];
}

export function TeacherAbsenceForm({
  teacherOptions,
}: TeacherAbsenceFormProps) {
  const router = useRouter();
  const [teacherId, setTeacherId] = useState<string>("");
  const [date, setDate] = useState<string>(
    new Date().toISOString().slice(0, 10),
  );
  const [status, setStatus] = useState<string>("EXCUSED");
  const [note, setNote] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    if (!teacherId) {
      toast.error("Pilih guru terlebih dahulu");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch("/api/attendance/teacher-absence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherId, date, status, note }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Gagal mencatat absensi guru");
      }
      toast.success("Absensi guru tercatat untuk semua jadwal hari itu");
      setNote("");
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "border-neutral-300 text-foreground rounded-sm h-11 border bg-white px-3 text-sm";

  return (
    <form
      onSubmit={handleSubmit}
      className="border-border rounded-md border bg-white p-5"
    >
      <h3 className="text-foreground mb-4 text-base font-semibold">
        Catat Ketidakhadiran Guru
      </h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <select
          value={teacherId}
          onChange={(event) => setTeacherId(event.target.value)}
          className={inputClass}
        >
          <option value="">Pilih guru…</option>
          {teacherOptions.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          className={inputClass}
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className={inputClass}
        >
          <option value="EXCUSED">Izin</option>
          <option value="SICK">Sakit</option>
          <option value="ABSENT">Alpa</option>
        </select>
        <input
          type="text"
          placeholder="Catatan (opsional)"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          className={inputClass}
        />
        <button
          type="submit"
          disabled={submitting}
          className="bg-primary-900 hover:bg-primary-800 active:bg-primary-950 rounded-sm h-11 px-5 text-sm font-semibold text-white transition-colors disabled:opacity-50"
        >
          {submitting ? "Menyimpan..." : "Simpan"}
        </button>
      </div>
    </form>
  );
}
