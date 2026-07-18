import Link from "next/link";
import type { ProgramWithRelations } from "@/src/features/cms/services/programs";

interface ProgramCardProps {
  program: ProgramWithRelations;
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

export function ProgramCard({ program }: ProgramCardProps) {
  const rgb = hexToRgb(program.color);

  return (
    <Link
      href={`/jurusan#${program.abbreviation.toLowerCase()}`}
      className="group block bg-white rounded-2xl p-6 border-2 border-neutral-100 hover:border-primary-500 hover:shadow-xl transition-all duration-300"
    >
      <div
        className="max-w-20 h-16 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 px-3"
        style={{ backgroundColor: `rgba(${rgb}, 0.15)` }}
      >
        <span className="text-2xl font-bold" style={{ color: program.color }}>
          {program.abbreviation}
        </span>
      </div>
      <h3 className="text-xl font-bold text-neutral-900 mb-3">
        {program.name}
      </h3>
      <p className="text-neutral-600 mb-4">{program.description}</p>
      {program.skills.length > 0 && (
        <ul className="space-y-2 text-sm text-neutral-500">
          {program.skills.map((skill) => (
            <li key={skill.id} className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-green-500 shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              {skill.name}
            </li>
          ))}
        </ul>
      )}
    </Link>
  );
}
