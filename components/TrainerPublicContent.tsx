"use client";

import { useRef, useState } from "react";

type PackageOption = {
  id: string | number;
  title: string;
  price: string;
  duration: string;
  description: string;
};

type TrainerPublicContentProps = {
  trainerId: string;
  packages: PackageOption[];
};

export default function TrainerPublicContent({
  trainerId,
  packages,
}: TrainerPublicContentProps) {
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [formStatus, setFormStatus] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formRef = useRef<HTMLDivElement>(null);

  const selectedPackage = packages.find(
    (pkg) => String(pkg.id) === selectedPackageId,
  );

  function handleSelectPackage(packageId: string | number) {
    setSelectedPackageId(String(packageId));
    setFormStatus("");
    setErrorMessage("");

    setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;

    if (!selectedPackageId) {
      setErrorMessage("Please select a package first.");
      return;
    }

    setIsSubmitting(true);
    setFormStatus("");
    setErrorMessage("");

    const formData = new FormData(form);

    const response = await fetch("/api/client-request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        trainerId,
        packageId: selectedPackageId,
        clientName: String(formData.get("name") || ""),
        clientEmail: String(formData.get("email") || "")
          .trim()
          .toLowerCase(),
        clientPhone: String(formData.get("phone") || ""),
        fitnessGoal: String(formData.get("fitnessGoal") || ""),
        message: String(formData.get("message") || ""),
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      setErrorMessage(result.error || "Failed to submit inquiry.");
      setIsSubmitting(false);
      return;
    }

    if (result.emailSent === false) {
      console.warn("Request saved, but email was not sent:", result);
    }

    setFormStatus(
      "Inquiry submitted successfully. The trainer will contact you soon.",
    );

    form.reset();
    setSelectedPackageId("");
    setIsSubmitting(false);
  }

  return (
    <div className="w-full">
      <section className="mt-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {packages.map((pkg, index) => {
            const isSelected = selectedPackageId === String(pkg.id);

            return (
              <article
                key={pkg.id}
                className={`flex min-h-[300px] flex-col rounded-3xl border p-5 transition ${
                  isSelected
                    ? "border-blue-300 bg-blue-50"
                    : "border-slate-200 bg-white hover:border-blue-200"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-medium ${
                      isSelected
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    Package {index + 1}
                  </span>

                  {isSelected && (
                    <span className="rounded-full bg-white px-3 py-1 text-sm font-medium text-blue-700">
                      Selected
                    </span>
                  )}
                </div>

                <h3 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                  {pkg.title}
                </h3>

                <p className="mt-3 leading-7 text-slate-600">
                  {pkg.description}
                </p>

                <div className="mt-auto pt-6">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-slate-200 bg-[oklch(98.4%_0.003_247.858)] px-4 py-2 text-sm font-medium text-slate-700">
                      {pkg.duration}
                    </span>

                    <span className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
                      {pkg.price}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectPackage(pkg.id)}
                    className={`mt-5 w-full rounded-full px-5 py-3 text-base font-medium transition ${
                      isSelected
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "border border-slate-300 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-700"
                    }`}
                  >
                    {isSelected ? "Selected" : "Choose package"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section
        id="request"
        ref={formRef}
        className="mt-10 border-t border-slate-200 pt-10"
      >
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-base font-medium text-slate-500">
              Coaching inquiry
            </p>

            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-slate-950">
              Send your details
            </h2>

            <p className="mt-3 max-w-xl leading-7 text-slate-600">
              Choose a package, share your goal, and the trainer will contact
              you with next steps.
            </p>

            <div className="mt-6 rounded-3xl border border-slate-200 bg-[oklch(98.4%_0.003_247.858)] p-5">
              {selectedPackage ? (
                <>
                  <p className="text-sm font-medium text-slate-500">
                    Selected package
                  </p>

                  <h3 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-slate-950">
                    {selectedPackage.title}
                  </h3>

                  <p className="mt-2 text-slate-600">
                    {selectedPackage.duration} · {selectedPackage.price}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-slate-500">
                    Step one
                  </p>

                  <h3 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-slate-950">
                    Choose a package first
                  </h3>

                  <p className="mt-2 text-slate-600">
                    Select one of the coaching packages above before submitting
                    your inquiry.
                  </p>
                </>
              )}
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-slate-200 bg-white p-6"
          >
            <div className="grid gap-5">
              <div>
                <label className="mb-2 block text-base font-medium text-slate-800">
                  Selected package
                </label>

                <select
                  name="package"
                  value={selectedPackageId}
                  onChange={(event) => {
                    setSelectedPackageId(event.target.value);
                    setFormStatus("");
                    setErrorMessage("");
                  }}
                  required
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-base outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="">Choose a package</option>

                  {packages.map((pkg) => (
                    <option key={pkg.id} value={String(pkg.id)}>
                      {pkg.title} - {pkg.price}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-base font-medium text-slate-800">
                    Full name
                  </label>

                  <input
                    name="name"
                    type="text"
                    required
                    placeholder="Your full name"
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-base outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-base font-medium text-slate-800">
                    Email
                  </label>

                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="you@email.com"
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-base outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-base font-medium text-slate-800">
                    Phone
                  </label>

                  <input
                    name="phone"
                    type="tel"
                    placeholder="Your phone number"
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-base outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-base font-medium text-slate-800">
                    Fitness goal
                  </label>

                  <input
                    name="fitnessGoal"
                    type="text"
                    required
                    placeholder="Lose fat, build muscle..."
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-base outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-base font-medium text-slate-800">
                  Message
                </label>

                <textarea
                  name="message"
                  rows={5}
                  placeholder="Tell the trainer more about what you need"
                  className="w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-base outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <button
                disabled={isSubmitting}
                className="rounded-full bg-blue-600 px-6 py-3.5 text-base font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Submitting..." : "Submit inquiry"}
              </button>

              {formStatus && (
                <p className="rounded-2xl bg-green-50 px-4 py-3 text-base font-medium text-green-800">
                  {formStatus}
                </p>
              )}

              {errorMessage && (
                <p className="rounded-2xl bg-red-50 px-4 py-3 text-base font-medium text-red-800">
                  {errorMessage}
                </p>
              )}
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}