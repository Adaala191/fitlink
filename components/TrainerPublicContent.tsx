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

    formRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
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
        <h2 className="text-2xl font-bold">Choose a package</h2>

        <div className="mt-4 grid gap-4">
          {packages.map((pkg) => {
            const isSelected = selectedPackageId === String(pkg.id);

            return (
              <div
                key={pkg.id}
                className={`rounded-2xl border p-4 shadow-sm transition ${
                  isSelected
                    ? "border-gray-950 bg-gray-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold">{pkg.title}</h3>

                    <p className="mt-1 text-sm text-gray-500">{pkg.duration}</p>
                  </div>

                  <p className="font-bold">{pkg.price}</p>
                </div>

                <p className="mt-3 leading-6 text-gray-600">
                  {pkg.description}
                </p>

                <button
                  type="button"
                  onClick={() => handleSelectPackage(pkg.id)}
                  className="mt-4 w-full rounded-xl bg-gray-950 px-5 py-3 font-semibold text-white transition hover:bg-gray-800"
                >
                  {isSelected ? "Selected" : "Select Package"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div ref={formRef} className="mt-8 rounded-3xl bg-gray-50 p-4">
        <h2 className="text-2xl font-bold">Request coaching</h2>

        <p className="mt-2 text-gray-600">
          Select a package and send your details to the trainer.
        </p>

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
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-950"
            >
              <option value="">Choose a package</option>

              {packages.map((pkg) => (
                <option key={pkg.id} value={String(pkg.id)}>
                  {pkg.title} - {pkg.price}
                </option>
              ))}
            </select>

            {selectedPackage && (
              <p className="mt-2 text-sm text-gray-500">
                You selected: {selectedPackage.title}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Full name
            </label>

            <input
              name="name"
              type="text"
              required
              placeholder="Enter your full name"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-950"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">Email</label>

            <input
              name="email"
              type="email"
              required
              placeholder="Enter your email"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-950"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">Phone</label>

            <input
              name="phone"
              type="tel"
              placeholder="Enter your phone number"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-950"
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
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-950"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">Message</label>

            <textarea
              name="message"
              rows={4}
              placeholder="Tell the trainer more about what you need"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-950"
            />
          </div>

          <button
            disabled={isSubmitting}
            className="rounded-xl bg-gray-950 px-5 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Submitting..." : "Submit Request"}
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
