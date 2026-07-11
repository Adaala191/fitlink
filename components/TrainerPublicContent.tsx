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
      setErrorMessage(result.error || "Failed to submit request.");
      setIsSubmitting(false);
      return;
    }

    if (result.emailSent === false) {
      console.warn("Request saved, but email was not sent:", result);
    }

    setFormStatus(
      "Request submitted successfully. The trainer will contact you soon.",
    );

    form.reset();
    setSelectedPackageId("");
    setIsSubmitting(false);
  }

  return (
    <div className="w-full">
      <div className="mt-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {packages.map((pkg, index) => {
            const isSelected = selectedPackageId === String(pkg.id);

            return (
              <div
                key={pkg.id}
                className={`group flex min-h-[360px] flex-col rounded-3xl border p-5 transition ${
                  isSelected
                    ? "border-blue-300 bg-blue-50 shadow-sm"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                }`}
              >
                <div className="flex h-full flex-col gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black ${
                          isSelected
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        Package {index + 1}
                      </span>

                      {isSelected && (
                        <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-black text-white">
                          Selected
                        </span>
                      )}
                    </div>

                    <h3 className="mt-4 text-2xl font-black tracking-tight text-gray-950">
                      {pkg.title}
                    </h3>

                    <p className="mt-2 leading-7 text-gray-600">
                      {pkg.description}
                    </p>
                  </div>

                  <div className="mt-auto grid gap-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-gray-500">
                          Duration
                        </p>

                        <p className="mt-2 text-lg font-black text-gray-950">
                          {pkg.duration}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
                          Price
                        </p>

                        <p className="mt-2 text-lg font-black text-gray-950">
                          {pkg.price}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSelectPackage(pkg.id)}
                      className={`rounded-2xl border px-5 py-4 font-black transition ${
                        isSelected
                          ? "border-blue-600 bg-blue-600 text-white hover:bg-blue-700"
                          : "border-blue-200 bg-white text-blue-700 hover:border-blue-600 hover:bg-blue-50"
                      }`}
                    >
                      {isSelected
                        ? "Selected — Continue Below"
                        : "Choose Package"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div
        id="request"
        ref={formRef}
        className="mt-8 rounded-3xl border border-gray-200 bg-white p-5 md:p-6"
      >
        <div className="flex flex-col gap-4 border-b border-gray-200 pb-6 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-green-600">
              Send request
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight">
              Request coaching
            </h2>

            <p className="mt-2 max-w-2xl text-gray-600">
              Send your details and the trainer will contact you with the next
              steps.
            </p>
          </div>

          {selectedPackage ? (
            <div className="rounded-2xl bg-green-100 px-5 py-4 text-green-900">
              <p className="text-xs font-black uppercase tracking-[0.2em]">
                Selected
              </p>
              <p className="mt-1 font-black">{selectedPackage.title}</p>
            </div>
          ) : (
            <div className="rounded-2xl bg-gray-100 px-5 py-4 text-gray-700">
              <p className="text-xs font-black uppercase tracking-[0.2em]">
                Step 1
              </p>
              <p className="mt-1 font-black">Choose a package</p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <div>
            <label className="mb-2 block text-sm font-semibold">
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
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-600"
            >
              <option value="">Choose a package</option>

              {packages.map((pkg) => (
                <option key={pkg.id} value={String(pkg.id)}>
                  {pkg.title} - {pkg.price}
                </option>
              ))}
            </select>

            {selectedPackage && (
              <p className="mt-2 rounded-xl bg-blue-50 px-3 py-2 text-sm font-medium text-blue-800">
                You selected: {selectedPackage.title}
              </p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Full name
              </label>

              <input
                name="name"
                type="text"
                required
                placeholder="Enter your full name"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">Email</label>

              <input
                name="email"
                type="email"
                required
                placeholder="Enter your email"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold">Phone</label>

              <input
                name="phone"
                type="tel"
                placeholder="Enter your phone number"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Fitness goal
              </label>

              <input
                name="fitnessGoal"
                type="text"
                required
                placeholder="Lose weight, build muscle, improve fitness..."
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">Message</label>

            <textarea
              name="message"
              rows={5}
              placeholder="Tell the trainer more about what you need"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-600"
            />
          </div>

          <button
            disabled={isSubmitting}
            className="rounded-2xl bg-green-500 px-5 py-4 font-black text-gray-950 transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Submitting..." : "Submit Coaching Request"}
          </button>

          {formStatus && (
            <p className="rounded-xl bg-green-100 px-4 py-3 text-sm font-medium text-green-800">
              {formStatus}
            </p>
          )}

          {errorMessage && (
            <p className="rounded-xl bg-red-100 px-4 py-3 text-sm font-medium text-red-800">
              {errorMessage}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
