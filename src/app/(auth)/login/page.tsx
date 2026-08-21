import { Suspense } from "react";
import type { Metadata } from "next";
import { Loader2 } from "lucide-react";

import { LoginRolePanel } from "./_components/LoginRolePanel";
import { LoginForm } from "./_components/LoginForm";

export const metadata: Metadata = {
  title: "Masuk Portal",
  description:
    "Masuk ke portal SMK Muhammadiyah 2 Cibiru untuk guru, siswa, dan orang tua.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="grid min-h-screen md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:grid-cols-2">
      <LoginRolePanel />

      <div className="flex items-center justify-center px-6 py-10 md:px-10 lg:px-14">
        <div className="w-full max-w-sm">
          <h2 className="text-foreground text-xl font-bold">
            Masuk ke portal
          </h2>
          <p className="mt-1.5 text-sm text-neutral-600">
            Gunakan email dan kata sandi dari sekolah.
          </p>

          <div className="mt-6">
            <Suspense fallback={<LoginFormFallback />}>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginFormFallback() {
  return (
    <div className="flex h-64 items-center justify-center">
      <Loader2
        className="text-primary-500 h-5 w-5 animate-spin"
        aria-label="Memuat formulir"
      />
    </div>
  );
}
