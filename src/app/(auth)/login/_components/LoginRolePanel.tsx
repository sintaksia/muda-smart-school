import Image from "next/image";
import Link from "next/link";

import { cn } from "@/src/lib/utils";
import { loginAudiences } from "@/src/features/auth/constants";

/**
 * Left half of the login: a pastel wash over the school identity and the
 * audiences the portal serves. Presentation only — nothing here is selectable.
 */
export function LoginRolePanel() {
  return (
    <div className="bg-primary-50 login-wash relative isolate overflow-hidden md:min-h-screen">
      <div className="flex h-full flex-col px-6 py-8 md:px-10 lg:px-14 lg:py-12">
        <Link
          href="/"
          className="focus-visible:ring-primary-900/50 flex w-fit items-center gap-2.5 rounded-sm outline-none focus-visible:ring-2"
        >
          <Image
            src="/logo.jpg"
            alt=""
            width={36}
            height={36}
            className="h-9 w-9 rounded-sm object-cover"
          />
          <span className="text-foreground text-sm leading-tight font-semibold">
            SMK Muhammadiyah 2 Cibiru
          </span>
        </Link>

        <div className="flex flex-1 flex-col justify-center gap-8 py-10 md:gap-10 md:py-12">
          <div className="max-w-md">
            <p className="text-[11px] font-bold tracking-wider text-neutral-600 uppercase">
              Portal Sekolah
            </p>
            <h1 className="text-foreground mt-3 text-3xl font-bold tracking-tight md:text-4xl md:font-extrabold">
              Satu pintu untuk seluruh warga sekolah.
            </h1>
            <p className="mt-3 text-sm text-neutral-700">
              Masuk sekali, lalu portal Anda terbuka sesuai peran akun.
            </p>
          </div>

          <ul className="grid grid-cols-3 gap-2 md:grid-cols-1 md:gap-1">
            {loginAudiences.map((audience) => {
              const Icon = audience.icon;

              return (
                <li
                  key={audience.key}
                  className="flex flex-col items-center gap-2 rounded-sm px-2 py-2 text-center md:flex-row md:items-center md:gap-3 md:px-3 md:py-2.5 md:text-left"
                >
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-sm",
                      audience.tileClass,
                    )}
                  >
                    <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="text-foreground block text-sm font-semibold">
                      {audience.label}
                    </span>
                    <span className="mt-0.5 hidden text-xs leading-snug text-neutral-600 md:block">
                      {audience.tagline}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
