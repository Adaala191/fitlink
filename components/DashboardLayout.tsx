"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import FitLinkLogo from "@/components/FitLinkLogo";
import { supabase } from "@/lib/supabaseClient";

type DashboardLayoutProps = {
  children: React.ReactNode;
  publicPageUrl?: string;
};

const navItems = [
  {
    label: "Overview",
    href: "/dashboard",
  },
  {
    label: "Profile",
    href: "/dashboard/profile",
  },
  {
    label: "Packages",
    href: "/dashboard/packages",
  },
  {
    label: "Leads",
    href: "/dashboard/requests",
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
  },
];

export default function DashboardLayout({
  children,
  publicPageUrl,
}: DashboardLayoutProps) {
  const pathname = usePathname();

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

return (
  <main className="min-h-screen bg-[oklch(98.4%_0.003_247.858)] text-slate-950">
    <div className="flex min-h-screen w-full">
      <aside className="hidden w-[272px] shrink-0 border-r border-slate-200 bg-white px-6 py-7 lg:flex lg:flex-col">
        <div className="mb-10">
          <FitLinkLogo href="/dashboard" />
        </div>

        <nav className="grid gap-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-xl px-4 py-3.5 text-base font-medium tracking-[-0.01em] transition ${
                  isActive
                    ? "bg-blue-50 text-blue-700 shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 grid gap-2 border-t border-slate-200 pt-5">
          {publicPageUrl && (
            <Link
              href={publicPageUrl}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-base font-medium tracking-[-0.01em] text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
            >
              View Profile
            </Link>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl px-4 py-3.5 text-left text-base font-medium tracking-[-0.01em] text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
          >
            Log out
          </button>
        </div>

        <div className="mt-auto border-t border-slate-200 pt-5">
          <p className="text-base font-semibold tracking-[-0.01em] text-slate-950">
            Train. Connect. Grow.
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Manage your coaching profile, packages, and leads in one simple
            place.
          </p>
        </div>
      </aside>

      <section className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-[oklch(98.4%_0.003_247.858)]/90 px-4 py-4 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <FitLinkLogo href="/dashboard" />

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-slate-300 bg-white px-4 py-2.5 text-base font-medium text-slate-700 transition hover:border-slate-900 hover:text-slate-950"
            >
              Log out
            </button>
          </div>

          <nav className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`shrink-0 rounded-full px-4 py-2.5 text-base font-medium tracking-[-0.01em] transition ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            {publicPageUrl && (
              <Link
                href={publicPageUrl}
                className="shrink-0 rounded-full border border-slate-300 bg-white px-4 py-2.5 text-base font-medium text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
              >
                View Profile
              </Link>
            )}
          </nav>
        </header>

        <div className="px-4 py-5 sm:px-6 lg:px-10 lg:py-9">
          {children}
        </div>
      </section>
    </div>
  </main>
);
}
