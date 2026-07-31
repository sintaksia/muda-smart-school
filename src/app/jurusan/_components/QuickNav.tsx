"use client";

import Link from "next/link";

interface QuickNavItem {
  id: string;
  abbreviation: string;
  name: string;
  color: string;
}

interface QuickNavProps {
  programs: QuickNavItem[];
}

export function QuickNav({ programs }: QuickNavProps) {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {programs.map((program: QuickNavItem) => (
        <Link
          key={program.id}
          href={`#${program.abbreviation.toLowerCase()}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-sm border-2 font-medium text-sm transition-colors"
          style={{ borderColor: program.color, color: program.color }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = program.color;
            e.currentTarget.style.color = "white";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = program.color;
          }}
        >
          <span className="font-bold">{program.abbreviation}</span>
          <span className="hidden sm:inline">{program.name}</span>
        </Link>
      ))}
    </div>
  );
}
