"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Menu, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/src/lib/utils";
import type { ProgramWithRelations } from "@/src/features/cms/services/programs";

interface JurusanItem {
  label: string;
  href: string;
  abbr: string;
}

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfilOpen, setIsProfilOpen] = useState(false);
  const [isJurusanOpen, setIsJurusanOpen] = useState(false);
  const [jurusanList, setJurusanList] = useState<JurusanItem[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/programs")
      .then((res) => res.json())
      .then((programs: ProgramWithRelations[]) => {
        setJurusanList(
          programs.map((p: ProgramWithRelations) => ({
            label: p.name,
            href: `/jurusan#${p.abbreviation.toLowerCase()}`,
            abbr: p.abbreviation,
          })),
        );
      })
      .catch(() => {});
  }, []);

  const menuItems = [
    { label: "BERANDA", href: "/" },
    { label: "KONTAK", href: "/kontak" },
    { label: "PENDAFTARAN", href: "/pendaftaran" },
  ];

  const profilItems = [
    { label: "Profil Sekolah", href: "/profil" },
    { label: "Prestasi", href: "/prestasi" },
    { label: "Galeri", href: "/galeri" },
  ];

  const isProfilActive =
    pathname === "/profil" ||
    pathname.startsWith("/prestasi") ||
    pathname.startsWith("/galeri");
  const isJurusanActive = pathname.startsWith("/jurusan");

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.jpg"
              alt="Muda Smart School"
              width={80}
              height={80}
              className="rounded-sm w-10 h-10"
            />
            <span className="font-semibold text-lg text-primary">
              SMK MUHAMMADIYAH 2 CIBIRU
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {/* Beranda */}
            <Link
              href="/"
              className={cn(
                "relative text-sm font-medium p-2 transition-colors after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-primary after:transition-all after:duration-300",
                pathname === "/"
                  ? "text-primary after:w-full"
                  : "text-muted-foreground after:w-0 hover:after:w-full hover:text-primary",
              )}
            >
              BERANDA
            </Link>

            {/* Profil Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  "relative text-sm font-medium p-2 transition-colors after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-primary after:transition-all after:duration-300 flex items-center gap-1 outline-none",
                  isProfilActive
                    ? "text-primary after:w-full"
                    : "text-muted-foreground after:w-0 hover:after:w-full hover:text-primary",
                )}
              >
                PROFIL
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center">
                {profilItems.map((item) => (
                  <DropdownMenuItem
                    key={item.href}
                    asChild
                    className="cursor-pointer"
                  >
                    <Link href={item.href} className="w-full">
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Jurusan Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  "relative text-sm font-medium p-2 transition-colors after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-primary after:transition-all after:duration-300 flex items-center gap-1 outline-none",
                  isJurusanActive
                    ? "text-primary after:w-full"
                    : "text-muted-foreground after:w-0 hover:after:w-full hover:text-primary",
                )}
              >
                JURUSAN
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-72">
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link
                    href="/jurusan"
                    className="w-full font-semibold text-primary"
                  >
                    Lihat Semua Jurusan
                  </Link>
                </DropdownMenuItem>
                <div className="h-px bg-border my-1" />
                {jurusanList.map((jurusan) => (
                  <DropdownMenuItem
                    key={jurusan.href}
                    asChild
                    className="cursor-pointer"
                  >
                    <Link
                      href={jurusan.href}
                      className="w-full flex items-center gap-2"
                    >
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">
                        {jurusan.abbr}
                      </span>
                      <span className="text-sm">{jurusan.label}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {menuItems.slice(1).map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative text-sm font-medium p-2 transition-colors after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-primary after:transition-all after:duration-300",
                    isActive
                      ? "text-primary after:w-full"
                      : "text-muted-foreground after:w-0 hover:after:w-full hover:text-primary",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Enquire Now Button */}
          <div className="hidden lg:block">
            <Button
              asChild
              className="bg-primary hover:bg-primary hover:scale-110 transition-transform text-white rounded-sm"
            >
              <Link href="/registrasi">Daftar Sekarang</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-sm text-muted-foreground hover:text-primary"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              {/* Beranda */}
              <Link
                href="/"
                className={cn(
                  "relative text-sm font-medium",
                  pathname === "/"
                    ? "text-primary"
                    : "text-muted-foreground hover:text-primary",
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                BERANDA
              </Link>

              {/* Mobile Profil Accordion */}
              <div>
                <button
                  onClick={() => setIsProfilOpen(!isProfilOpen)}
                  className={cn(
                    "flex items-center justify-between w-full text-sm font-medium",
                    isProfilActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-primary",
                  )}
                >
                  PROFIL
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      isProfilOpen && "rotate-180",
                    )}
                  />
                </button>
                {isProfilOpen && (
                  <div className="mt-2 ml-4 flex flex-col gap-2">
                    {profilItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "text-sm",
                          pathname === item.href
                            ? "text-primary font-semibold"
                            : "text-muted-foreground hover:text-primary",
                        )}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Jurusan Accordion */}
              <div>
                <button
                  onClick={() => setIsJurusanOpen(!isJurusanOpen)}
                  className={cn(
                    "flex items-center justify-between w-full text-sm font-medium",
                    isJurusanActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-primary",
                  )}
                >
                  JURUSAN
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      isJurusanOpen && "rotate-180",
                    )}
                  />
                </button>
                {isJurusanOpen && (
                  <div className="mt-2 ml-4 flex flex-col gap-2">
                    <Link
                      href="/jurusan"
                      className="text-sm font-semibold text-primary"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Lihat Semua Jurusan
                    </Link>
                    {jurusanList.map((jurusan) => (
                      <Link
                        key={jurusan.href}
                        href={jurusan.href}
                        className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
                          {jurusan.abbr}
                        </span>
                        {jurusan.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {menuItems.slice(1).map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative text-sm font-medium",
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground hover:text-primary",
                    )}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              })}

              <Button
                asChild
                className="bg-primary hover:bg-primary/90 hover:scale-105 transition-transform text-white w-full"
              >
                <Link href="/registrasi">Daftar Sekarang</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
