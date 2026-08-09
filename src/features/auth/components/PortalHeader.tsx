import Link from "next/link";

import { LogoutButton } from "./LogoutButton";

interface PortalHeaderProps {
  /** Where the logo/title links back to, e.g. "/guru". */
  homeHref: string;
  /** Portal name shown next to the logo, e.g. "Portal Guru". */
  title: string;
  userName: string;
  /** Tailwind max-width class for the header container, matching the page shell. */
  containerClassName: string;
}

export function PortalHeader({
  homeHref,
  title,
  userName,
  containerClassName,
}: PortalHeaderProps) {
  return (
    <header className="border-border sticky top-0 z-10 border-b bg-white">
      <div
        className={`mx-auto flex h-14 items-center justify-between px-4 ${containerClassName}`}
      >
        <Link href={homeHref} className="flex items-center gap-2">
          <span className="bg-primary-900 flex h-8 w-8 items-center justify-center rounded-sm text-sm font-bold text-white">
            M
          </span>
          <span className="text-foreground text-sm font-semibold">{title}</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="hidden text-sm text-neutral-600 sm:inline">
            {userName}
          </span>
          <LogoutButton compact />
        </div>
      </div>
    </header>
  );
}
