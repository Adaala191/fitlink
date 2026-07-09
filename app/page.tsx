export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 text-center">
        <p className="mb-4 rounded-full border border-gray-700 px-4 py-2 text-sm text-gray-300">
          FitLink for Online Trainers
        </p>

        <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
          One simple link for trainers to get client requests.
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-gray-300">
          FitLink helps trainers create a public profile, show their packages,
          and receive client requests from Instagram, WhatsApp, or anywhere.
        </p>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <a
            href="/trainer/adal"
            className="rounded-xl bg-white px-6 py-3 font-semibold text-gray-950 transition hover:bg-gray-200"
          >
            View Demo Trainer Page
          </a>

          <a
            href="/dashboard"
            className="rounded-xl border border-gray-700 px-6 py-3 font-semibold text-white transition hover:bg-gray-900"
          >
            Trainer Dashboard
          </a>
        </div>
      </section>
    </main>
  );
}