"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import FitLinkLogo from "@/components/FitLinkLogo";
import { supabase } from "@/lib/supabaseClient";

type AdminLayoutProps = {
  children: React.ReactNode;
};

const adminNavItems = [
  {
    label: "Support",
    href: "/admin/support",
  },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <main className="min-h-screen bg-white text-gray-950">
      <div className="flex min-h-screen w-full gap-4 p-3 lg:p-4">
        <aside className="hidden w-[250px] shrink-0 rounded-[1.75rem] bg-gray-950 p-5 text-white lg:flex lg:flex-col">
          <div className="rounded-2xl bg-white p-4">
            <FitLinkLogo href="/admin/support" />
          </div>

          <div className="mt-6 rounded-2xl bg-white/10 p-4">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-300">
              Admin
            </p>
            <p className="mt-1 font-black text-white">FitLink Control</p>
          </div>

          <nav className="mt-6 grid gap-2">
            {adminNavItems.map((item) => {
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

          <div className="mt-auto grid gap-2">
            <Link
              href="/dashboard/settings"
              className="rounded-2xl border border-blue-400/30 bg-blue-400/10 px-4 py-3 text-sm font-bold text-blue-100 transition hover:bg-blue-400/20"
            >
              Trainer Settings
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-2xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-left text-sm font-bold text-red-100 transition hover:bg-red-400/20"
            >
              Log Out
            </button>
          </div>
        </aside>

        <section className="min-w-0 flex-1 bg-white p-2 md:p-4">
          <div className="mb-4 rounded-[1.5rem] bg-gray-950 p-4 text-white lg:hidden">
            <div className="rounded-2xl bg-white p-3">
              <FitLinkLogo href="/admin/support" />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              {adminNavItems.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-2xl px-3 py-3 text-center text-sm font-bold transition ${
                      isActive
                        ? "bg-white text-gray-950"
                        : "bg-white/10 text-gray-200 hover:bg-white/15 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}

              <Link
                href="/dashboard/settings"
                className="rounded-2xl border border-blue-400/30 bg-blue-400/10 px-3 py-3 text-center text-sm font-bold text-blue-100"
              >
                Settings
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-2xl border border-red-400/30 bg-red-400/10 px-3 py-3 text-sm font-bold text-red-100"
              >
                Log Out
              </button>
            </div>
          </div>

          {children}
        </section>
      </div>
    </main>
  );
}