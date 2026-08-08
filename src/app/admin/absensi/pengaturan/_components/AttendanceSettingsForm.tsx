"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { SelectField } from "@/src/components/common/SelectField";
import { ADMIN_FIELD_CLASS } from "@/src/components/common/formClasses";
import {
  attendanceScanModeOptions,
  booleanSettingOptions,
  qrModeOptions,
} from "@/src/lib/constants";

/** Settings whose value comes from a fixed options list rather than free text. */
const SELECT_OPTIONS_BY_KEY: Record<
  string,
  readonly { value: string; label: string }[]
> = {
  QR_MODE: qrModeOptions,
  ATTENDANCE_SCAN_MODE: attendanceScanModeOptions,
};

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
    const fieldClass = `${ADMIN_FIELD_CLASS} tabular-nums`;
    const set = (next: string): void =>
      setValues({ ...values, [setting.key]: next });

    const options =
      setting.type === "BOOLEAN"
        ? booleanSettingOptions
        : (SELECT_OPTIONS_BY_KEY[setting.key] ?? null);

    if (options) {
      return (
        <SelectField
          ariaLabel={setting.label}
          value={values[setting.key]}
          onChange={set}
          className={fieldClass}
          options={options.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
        />
      );
    }

    return (
      <Input
        type={setting.type === "NUMBER" ? "number" : "text"}
        step="any"
        value={values[setting.key]}
        onChange={(event) => set(event.target.value)}
        className={fieldClass}
      />
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-border rounded-md border bg-white p-5"
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {settings.map((setting) => (
          <label key={setting.key} className="block">
            <span className="text-neutral-600 mb-1.5 block text-xs font-semibold">
              {setting.label}
            </span>
            {renderInput(setting)}
          </label>
        ))}
      </div>
      <Button type="submit" disabled={saving} className="mt-6 h-11">
        {saving ? "Menyimpan..." : "Simpan Pengaturan"}
      </Button>
    </form>
  );
}
