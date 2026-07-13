import Link from "next/link";
import FitLinkLogo from "@/components/FitLinkLogo";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[oklch(98.4%_0.003_247.858)] text-slate-950">
      <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between py-3">
          <FitLinkLogo href="/" />

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-950"
            >
              Log in
            </Link>

            <Link
              href="/signup"
              className="rounded-full bg-[#2563eb] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1d4ed8]"
            >
              Sign up
            </Link>
          </div>
        </header>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.05fr] lg:items-center">
          <div className="overflow-hidden rounded-[2rem] bg-[#2563eb]">
            <div className="grid min-h-[520px] place-items-center p-6 md:p-10">
              <div className="w-full max-w-sm rounded-[2rem] bg-slate-900 p-6 text-white shadow-2xl">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-300">
                    FitLink
                  </p>

                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200">
                    Live
                  </span>
                </div>

                <div className="mt-8">
                  <p className="text-sm font-medium text-slate-400">
                    Independent coach page
                  </p>

                  <h2 className="mt-3 text-3xl font-bold leading-tight">
                    One simple link for your coaching business.
                  </h2>

                  <p className="mt-4 text-sm leading-6 text-slate-300">
                    Show your profile, display your packages, and receive
                    organized client inquiries.
                  </p>
                </div>

                <div className="mt-8 space-y-3">
                  <div className="rounded-2xl bg-white/5 px-4 py-3">
                    <p className="text-sm font-semibold">Professional profile</p>
                  </div>

                  <div className="rounded-2xl bg-white/5 px-4 py-3">
                    <p className="text-sm font-semibold">Package selection</p>
                  </div>

                  <div className="rounded-2xl bg-white/5 px-4 py-3">
                    <p className="text-sm font-semibold">Client inquiries</p>
                  </div>
                </div>

                <div className="mt-8 flex items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
                  <p className="text-sm text-slate-300">
                    Built for solo independent coaches
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="px-1 lg:px-10">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              Simple and professional
            </p>

            <h1 className="mt-4 max-w-3xl text-5xl font-bold leading-tight tracking-tight md:text-6xl">
              Look professional.
              <br />
              Get more inquiries.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              FitLink helps independent coaches create a clean profile, show
              their packages, and manage client interest in one place.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="rounded-full bg-[#2563eb] px-6 py-3.5 text-center font-semibold text-white transition hover:bg-[#1d4ed8]"
              >
                Create your page
              </Link>

              <Link
                href="/login"
                className="rounded-full border border-slate-300 bg-white px-6 py-3.5 text-center font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-950"
              >
                Open account
              </Link>
            </div>

            <div className="mt-10 grid gap-6 border-t border-slate-200 pt-8 sm:grid-cols-3">
              <div>
                <p className="text-3xl font-bold text-slate-950">1 page</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  One clean place for clients to learn about you.
                </p>
              </div>

              <div>
                <p className="text-3xl font-bold text-slate-950">Packages</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Let clients choose the coaching option that fits them.
                </p>
              </div>

              <div>
                <p className="text-3xl font-bold text-slate-950">Leads</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Keep new client inquiries organized and easy to manage.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-14 border-t border-slate-200 py-10">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <p className="text-lg font-semibold text-slate-950">
                Create your profile
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Add your photo, description, and contact details.
              </p>
            </div>

            <div>
              <p className="text-lg font-semibold text-slate-950">
                Show your packages
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Present your coaching options clearly and simply.
              </p>
            </div>

            <div>
              <p className="text-lg font-semibold text-slate-950">
                Receive inquiries
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Collect serious client requests without messy DMs.
              </p>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}