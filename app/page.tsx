import Link from "next/link";
import FitLinkLogo from "@/components/FitLinkLogo";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f7f5ef] text-gray-950">
      <header className="sticky top-0 z-50 border-b border-black/5 bg-[#f7f5ef]/90 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <FitLinkLogo />

          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#how-it-works"
              className="text-sm font-semibold text-gray-600 transition hover:text-gray-950"
            >
              How it works
            </a>

            <a
              href="#benefits"
              className="text-sm font-semibold text-gray-600 transition hover:text-gray-950"
            >
              Benefits
            </a>

            <a
              href="#preview"
              className="text-sm font-semibold text-gray-600 transition hover:text-gray-950"
            >
              Preview
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden rounded-xl px-4 py-2 text-sm font-bold text-gray-700 transition hover:bg-white sm:inline-flex"
            >
              Login
            </Link>

            <Link
              href="/signup"
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
            >
              Start Free
            </Link>
          </div>
        </nav>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:py-24">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            <p className="text-sm font-bold text-gray-700">
              Built for personal trainers
            </p>
          </div>

          <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[1.02] tracking-tight text-gray-950 md:text-7xl">
            Turn your coaching packages into a clean client-request page.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-650 text-gray-700">
            FitLink helps trainers create a public profile, showcase packages,
            and receive client requests from one simple link they can share on
            Instagram, WhatsApp, TikTok, or anywhere online.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="rounded-2xl bg-blue-600 px-6 py-4 text-center font-black text-white shadow-sm transition hover:bg-blue-700"
            >
              Create your trainer page
            </Link>

            <Link
              href="/login"
              className="rounded-2xl border border-gray-300 bg-white px-6 py-4 text-center font-black text-gray-950 shadow-sm transition hover:border-gray-950"
            >
              Login to dashboard
            </Link>
          </div>

          <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-2xl font-black">1</p>
              <p className="mt-1 text-sm font-semibold text-gray-600">
                Public link
              </p>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-2xl font-black">∞</p>
              <p className="mt-1 text-sm font-semibold text-gray-600">
                Packages
              </p>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-2xl font-black">24/7</p>
              <p className="mt-1 text-sm font-semibold text-gray-600">
                Requests
              </p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-6 -top-6 h-40 w-40 rounded-full bg-blue-300/30 blur-3xl" />
          <div className="absolute -bottom-6 -right-6 h-40 w-40 rounded-full bg-green-300/40 blur-3xl" />

          <div className="relative rounded-[2rem] border border-white/70 bg-white p-4 shadow-2xl">
            <div className="rounded-[1.5rem] bg-gray-950 p-5 text-white">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-400 to-green-400" />

                <div>
                  <p className="text-sm font-semibold text-gray-400">
                    Public trainer page
                  </p>
                  <h2 className="text-2xl font-black">Adam Fitness</h2>
                  <p className="text-sm text-gray-300">
                    Fat loss & strength coaching
                  </p>
                </div>
              </div>

              <p className="mt-5 leading-7 text-gray-300">
                I help busy people lose fat, build strength, and stay
                consistent with simple coaching systems.
              </p>
            </div>

            <div className="mt-4 grid gap-3">
              <div className="rounded-2xl border border-gray-100 bg-[#f7f5ef] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-black">8-Week Transformation</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Training plan, check-ins, and weekly updates.
                    </p>
                  </div>

                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700">
                    Popular
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <p className="font-black">$199</p>
                  <button className="rounded-xl bg-green-600 px-4 py-2 text-sm font-black text-white">
                    Request
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-4">
                <h3 className="font-black">Online Coaching</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Monthly coaching with accountability.
                </p>

                <div className="mt-4 flex items-center justify-between">
                  <p className="font-black">$149/mo</p>
                  <button className="rounded-xl bg-gray-950 px-4 py-2 text-sm font-black text-white">
                    Request
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-blue-50 p-4">
              <p className="text-sm font-black text-blue-800">
                New request received
              </p>
              <p className="mt-1 text-sm text-blue-700">
                Client details sent to your dashboard and email.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="border-y border-black/5 bg-white px-4 py-16"
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-600">
              How it works
            </p>

            <h2 className="mt-3 text-4xl font-black tracking-tight">
              One link. Three simple steps.
            </h2>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl bg-[#f7f5ef] p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-950 text-lg font-black text-white">
                1
              </div>

              <h3 className="mt-5 text-xl font-black">Create your profile</h3>
              <p className="mt-3 leading-7 text-gray-600">
                Add your photo, bio, specialty, contact info, and social links.
              </p>
            </div>

            <div className="rounded-3xl bg-blue-50 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-lg font-black text-white">
                2
              </div>

              <h3 className="mt-5 text-xl font-black">Add your packages</h3>
              <p className="mt-3 leading-7 text-gray-600">
                Show your coaching offers clearly with price, duration, and
                details.
              </p>
            </div>

            <div className="rounded-3xl bg-green-50 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-600 text-lg font-black text-white">
                3
              </div>

              <h3 className="mt-5 text-xl font-black">Receive requests</h3>
              <p className="mt-3 leading-7 text-gray-600">
                Clients submit their goals, contact details, and selected
                package directly to you.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="benefits" className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1fr] lg:items-start">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-green-600">
              Why trainers use it
            </p>

            <h2 className="mt-3 text-4xl font-black tracking-tight">
              Stop sending messy DMs. Start collecting clear client requests.
            </h2>

            <p className="mt-4 leading-8 text-gray-700">
              FitLink turns interest into organized requests so trainers can
              respond faster and look more professional.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h3 className="text-lg font-black">Cleaner than Instagram DMs</h3>
              <p className="mt-3 leading-7 text-gray-600">
                Clients choose a package and submit the exact details you need.
              </p>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h3 className="text-lg font-black">Professional first impression</h3>
              <p className="mt-3 leading-7 text-gray-600">
                Your offers look structured, simple, and easy to understand.
              </p>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h3 className="text-lg font-black">Email notifications</h3>
              <p className="mt-3 leading-7 text-gray-600">
                New requests go to your dashboard and email immediately.
              </p>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h3 className="text-lg font-black">Built for sharing</h3>
              <p className="mt-3 leading-7 text-gray-600">
                Add your FitLink to Instagram, WhatsApp, TikTok, or your bio.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="preview" className="bg-gray-950 px-4 py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-green-400">
              Built like a mini CRM
            </p>

            <h2 className="mt-3 text-4xl font-black tracking-tight">
              Every request goes into your trainer dashboard.
            </h2>

            <p className="mt-4 max-w-2xl leading-8 text-gray-300">
              See who requested a package, what they want, their goal, their
              message, and whether you already contacted them.
            </p>

            <Link
              href="/signup"
              className="mt-8 inline-flex rounded-2xl bg-green-500 px-6 py-4 font-black text-gray-950 transition hover:bg-green-400"
            >
              Start building your page
            </Link>
          </div>

          <div className="rounded-3xl bg-white p-4 text-gray-950">
            <div className="rounded-2xl border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-500">
                    Client request
                  </p>
                  <h3 className="text-xl font-black">Sarah M.</h3>
                </div>

                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">
                  New
                </span>
              </div>

              <div className="mt-5 grid gap-3">
                <div className="rounded-2xl bg-[#f7f5ef] p-4">
                  <p className="text-xs font-black uppercase tracking-wider text-gray-500">
                    Package
                  </p>
                  <p className="mt-1 font-black">8-Week Transformation</p>
                </div>

                <div className="rounded-2xl bg-green-50 p-4">
                  <p className="text-xs font-black uppercase tracking-wider text-green-700">
                    Goal
                  </p>
                  <p className="mt-1 font-semibold text-gray-700">
                    Lose fat, build strength, and stay consistent.
                  </p>
                </div>

                <button className="rounded-2xl bg-gray-950 px-5 py-3 font-black text-white">
                  View request
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto max-w-5xl rounded-[2rem] bg-white p-8 text-center shadow-sm md:p-12">
          <div className="mx-auto flex justify-center">
            <FitLinkLogo href="/" />
          </div>

          <h2 className="mt-8 text-4xl font-black tracking-tight">
            Ready to turn your coaching packages into a simple link?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-8 text-gray-600">
            Create your trainer profile, add your packages, and start receiving
            organized client requests today.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="rounded-2xl bg-blue-600 px-6 py-4 font-black text-white transition hover:bg-blue-700"
            >
              Create free account
            </Link>

            <Link
              href="/login"
              className="rounded-2xl bg-green-500 px-6 py-4 font-black text-gray-950 transition hover:bg-green-400"
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-black/5 bg-white px-4 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <FitLinkLogo />

          <p className="text-sm font-semibold text-gray-500">
            © 2026 FitLink. Built for trainers who want cleaner client requests.
          </p>
        </div>
      </footer>
    </main>
  );
}