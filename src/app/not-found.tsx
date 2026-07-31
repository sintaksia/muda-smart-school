// app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 to-slate-800 text-white">
      <div className="text-center px-6">
        <p className="text-sm uppercase tracking-widest text-slate-400">
          404 • Under Maintenance
        </p>

        <h1 className="mt-4 text-4xl md:text-5xl font-bold">
          We’ll be back soon 🚧
        </h1>

        <p className="mt-4 text-slate-300 max-w-md mx-auto">
          This page is currently under maintenance or doesn’t exist. We’re
          fixing things to make it better.
        </p>

        <div className="mt-8 flex gap-4 justify-center">
          <Link
            href="/"
            className="px-5 py-2.5 rounded-sm bg-white text-slate-900 font-medium hover:bg-slate-200 transition"
          >
            Go Home
          </Link>

          <a
            href="mailto:support@yourdomain.com"
            className="px-5 py-2.5 rounded-sm border border-slate-600 hover:bg-slate-700 transition"
          >
            Contact Support
          </a>
        </div>
      </div>
    </main>
  );
}
