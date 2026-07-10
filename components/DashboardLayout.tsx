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
    label: "Dashboard",
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
    label: "Requests",
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
    <main className="min-h-screen bg-white text-gray-950">
      <div className="flex min-h-screen w-full gap-4 p-3 lg:p-4">
        <aside className="hidden w-[260px] shrink-0 rounded-[1.75rem] bg-gray-950 p-5 text-white lg:flex lg:flex-col">
          <div className="rounded-2xl bg-white p-4">
            <FitLinkLogo href="/dashboard" />
          </div>

          <nav className="mt-6 grid gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-2xl px-4 py-3 text-sm font-bold transition ${
                    isActive
                      ? "bg-white text-gray-950"
                      : "text-gray-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 grid gap-2">
            {publicPageUrl && (
              <Link
                href={publicPageUrl}
                className="rounded-2xl border border-blue-400/30 bg-blue-400/10 px-4 py-3 text-sm font-bold text-blue-100 transition hover:bg-blue-400/20"
              >
                View Public Page
              </Link>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-2xl border border-green-400/30 bg-green-400/10 px-4 py-3 text-left text-sm font-bold text-green-100 transition hover:bg-green-400/20"
            >
              Log Out
            </button>
          </div>

          <div className="mt-auto rounded-2xl bg-white/10 p-4">
            <p className="text-sm font-black text-white">
              Train. Connect. Grow.
            </p>
            <p className="mt-1 text-xs leading-5 text-gray-300">
              Manage your profile, packages, and requests from one place.
            </p>
          </div>
        </aside>

        <section className="min-w-0 flex-1 bg-white p-2 md:p-4">
          <div className="mb-4 rounded-2xl bg-gray-950 p-4 text-white lg:hidden">
            <FitLinkLogo href="/dashboard" />
          </div>

          {children}
        </section>
      </div>
    </main>
  );
}