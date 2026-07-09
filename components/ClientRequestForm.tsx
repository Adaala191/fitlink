"use client";

import { useState } from "react";

type PackageOption = {
  id: number;
  title: string;
  price: string;
};

type ClientRequestFormProps = {
  packages: PackageOption[];
};

export default function ClientRequestForm({
  packages,
}: ClientRequestFormProps) {
  const [selectedPackage, setSelectedPackage] = useState("");
  const [formStatus, setFormStatus] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const requestData = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      fitnessGoal: formData.get("fitnessGoal"),
      package: selectedPackage,
      message: formData.get("message"),
    };

    console.log("Client request:", requestData);

    setFormStatus(
      "Request submitted successfully. The trainer will contact you soon."
    );

    event.currentTarget.reset();
    setSelectedPackage("");
  }

  return (
    <div className="mt-10 rounded-3xl bg-gray-50 p-6">
      <h2 className="text-2xl font-bold">Request coaching</h2>

      <p className="mt-2 text-gray-600">
        Select a package and send your details to the trainer.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
        <div>
          <label className="mb-2 block text-sm font-semibold">
            Select package
          </label>

          <select
            name="package"
            value={selectedPackage}
            onChange={(event) => setSelectedPackage(event.target.value)}
            required
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-950"
          >
            <option value="">Choose a package</option>

            {packages.map((pkg) => (
              <option key={pkg.id} value={pkg.title}>
                {pkg.title} - {pkg.price}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">Full name</label>
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

        <button className="rounded-xl bg-gray-950 px-5 py-3 font-semibold text-white transition hover:bg-gray-800">
          Submit Request
        </button>

        {formStatus && (
          <p className="rounded-xl bg-green-100 px-4 py-3 text-sm font-medium text-green-800">
            {formStatus}
          </p>
        )}
      </form>
    </div>
  );
}