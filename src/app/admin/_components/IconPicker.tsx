"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import { ICONS, ICON_MAP } from "@/src/lib/icons";

interface IconPickerProps {
  value?: string | null;
  onChange: (iconName: string | null) => void;
  disabled?: boolean;
}

export function IconPicker({ value, onChange, disabled }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const SelectedIcon = value ? ICON_MAP[value] : null;
  const selectedLabel = value
    ? ICONS.find((e) => e.name === value)?.label
    : null;

  const filtered = search
    ? ICONS.filter(
        (e) =>
          e.label.toLowerCase().includes(search.toLowerCase()) ||
          e.name.toLowerCase().includes(search.toLowerCase()),
      )
    : ICONS;

  const handleSelect = (name: string) => {
    onChange(name);
    setOpen(false);
    setSearch("");
  };

  const handleClear = () => {
    onChange(null);
    setOpen(false);
    setSearch("");
  };

  return (
    <div className="flex items-center gap-2">
      {/* Preview box */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border bg-muted">
        {SelectedIcon ? (
          <SelectedIcon className="h-5 w-5 text-foreground" />
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </div>

      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) setSearch("");
        }}
      >
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className="flex-1 justify-start font-normal"
          >
            {selectedLabel ?? (
              <span className="text-muted-foreground">Pilih icon...</span>
            )}
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle>Pilih Icon Fasilitas</DialogTitle>
          </DialogHeader>

          <div className="relative shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari icon..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="grid grid-cols-5 gap-1.5 overflow-y-auto py-1 pr-1">
            {/* Clear / remove option */}
            {value && (
              <button
                type="button"
                onClick={handleClear}
                className="flex flex-col items-center gap-1 rounded-sm border-2 border-dashed border-destructive/30 p-2 hover:bg-destructive/5 transition-colors"
              >
                <X className="h-5 w-5 text-destructive/50" />
                <span className="text-[10px] text-destructive/50 leading-none">
                  Hapus
                </span>
              </button>
            )}

            {filtered.map((entry) => {
              const Icon = entry.icon;
              const isSelected = value === entry.name;
              return (
                <button
                  key={entry.name}
                  type="button"
                  onClick={() => handleSelect(entry.name)}
                  title={entry.label}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-sm border-2 p-2 transition-all hover:border-primary-400 hover:bg-primary-50",
                    isSelected
                      ? "border-primary-500 bg-primary-50"
                      : "border-transparent",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5",
                      isSelected ? "text-primary-600" : "text-neutral-600",
                    )}
                  />
                  <span
                    className={cn(
                      "text-[10px] leading-none text-center line-clamp-1",
                      isSelected
                        ? "text-primary-600 font-medium"
                        : "text-muted-foreground",
                    )}
                  >
                    {entry.label}
                  </span>
                </button>
              );
            })}

            {filtered.length === 0 && (
              <div className="col-span-5 flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Search className="h-8 w-8 mb-2 opacity-30" />
                <p className="text-sm">Tidak ada icon ditemukan</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
