"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface SettingRow {
  key: string;
  value: string;
  label: string;
  type: string;
}

interface AttendanceSettingsFormProps {
  settings: SettingRow[];
}

export function AttendanceSettingsForm({
  settings,
}: AttendanceSettingsFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(settings.map((s) => [s.key, s.value])),
  );
  const [saving, setSaving] = useState<boolean>(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await fetch("/api/attendance/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: values }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Gagal menyimpan pengaturan");
      }
      toast.success("Pengaturan tersimpan");
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  }

  function renderInput(setting: SettingRow): React.ReactNode {
    const inputClass =
      "border-hairline-strong text-ink rounded-input h-11 w-full border bg-white px-3 text-sm tabular-nums";
    if (setting.type === "BOOLEAN") {
      return (
        <select
          value={values[setting.key]}
          onChange={(event) =>
            setValues({ ...values, [setting.key]: event.target.value })
          }
          className={inputClass}
        >
          <option value="true">Ya</option>
          <option value="false">Tidak</option>
        </select>
      );
    }
    if (setting.key === "QR_MODE") {
      return (
        <select
          value={values[setting.key]}
          onChange={(event) =>
            setValues({ ...values, [setting.key]: event.target.value })
          }
          className={inputClass}
        >
          <option value="STATIC">Statis (satu QR per sesi)</option>
          <option value="DYNAMIC">Dinamis (QR berganti berkala)</option>
        </select>
      );
    }
    return (
      <input
        type={setting.type === "NUMBER" ? "number" : "text"}
        step="any"
        value={values[setting.key]}
        onChange={(event) =>
          setValues({ ...values, [setting.key]: event.target.value })
        }
        className={inputClass}
      />
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-hairline rounded-card border bg-white p-5"
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {settings.map((setting) => (
          <label key={setting.key} className="block">
            <span className="text-ink-secondary mb-1.5 block text-xs font-semibold">
              {setting.label}
            </span>
            {renderInput(setting)}
          </label>
        ))}
      </div>
      <button
        type="submit"
        disabled={saving}
        className="bg-brand hover:bg-brand-600 active:bg-brand-700 rounded-input mt-6 h-11 px-5 text-sm font-semibold text-white transition-colors disabled:opacity-50"
      >
        {saving ? "Menyimpan..." : "Simpan Pengaturan"}
      </button>
    </form>
  );
}
