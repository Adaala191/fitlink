"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/lib/supabaseClient";

type TrainerProfile = {
  id: string;
  username: string;
};

type PackageItem = {
  id: string;
  trainer_id: string;
  title: string;
  price: string;
  duration: string;
  description: string;
  is_active: boolean;
};

export default function PackagesPage() {
  const [profile, setProfile] = useState<TrainerProfile | null>(null);
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    price: "",
    duration: "",
    description: "",
  });

  useEffect(() => {
    async function loadPackagesPage() {
      setLoading(true);
      setErrorMessage("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        setErrorMessage(userError.message);
        setLoading(false);
        return;
      }

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, username")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        setErrorMessage(profileError.message);
        setLoading(false);
        return;
      }

      if (!profileData) {
        setErrorMessage("No trainer profile found for this account.");
        setLoading(false);
        return;
      }

      const { data: packagesData, error: packagesError } = await supabase
        .from("packages")
        .select(
          "id, trainer_id, title, price, duration, description, is_active",
        )
        .eq("trainer_id", user.id)
        .order("created_at", { ascending: false });

      if (packagesError) {
        setErrorMessage(packagesError.message);
        setLoading(false);
        return;
      }

      setProfile(profileData as TrainerProfile);
      setPackages((packagesData || []) as PackageItem[]);
      setLoading(false);
    }

    loadPackagesPage();
  }, []);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    setStatus("");
    setErrorMessage("");
  }

  function resetForm() {
    setFormData({
      title: "",
      price: "",
      duration: "",
      description: "",
    });

    setEditingId(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!profile) {
      return;
    }

    setStatus(editingId ? "Saving changes..." : "Adding package...");
    setErrorMessage("");

    if (editingId) {
      const { data, error } = await supabase
        .from("packages")
        .update({
          title: formData.title,
          price: formData.price,
          duration: formData.duration,
          description: formData.description,
        })
        .eq("id", editingId)
        .eq("trainer_id", profile.id)
        .select(
          "id, trainer_id, title, price, duration, description, is_active",
        )
        .single();

      if (error) {
        setStatus("");
        setErrorMessage(error.message);
        return;
      }

      setPackages((currentPackages) =>
        currentPackages.map((pkg) =>
          pkg.id === editingId ? (data as PackageItem) : pkg,
        ),
      );

      setStatus("Package updated successfully.");
      resetForm();
      return;
    }

    const { data, error } = await supabase
      .from("packages")
      .insert({
        trainer_id: profile.id,
        title: formData.title,
        price: formData.price,
        duration: formData.duration,
        description: formData.description,
        is_active: true,
      })
      .select("id, trainer_id, title, price, duration, description, is_active")
      .single();

    if (error) {
      setStatus("");
      setErrorMessage(error.message);
      return;
    }

    setPackages((currentPackages) => [data as PackageItem, ...currentPackages]);
    setStatus("Package added successfully.");
    resetForm();
  }

  function handleEdit(packageItem: PackageItem) {
    setEditingId(packageItem.id);

    setFormData({
      title: packageItem.title,
      price: packageItem.price,
      duration: packageItem.duration,
      description: packageItem.description,
    });

    setStatus("");
    setErrorMessage("");
  }

  async function handleDelete(packageId: string) {
    if (!profile) {
      return;
    }

    setStatus("Deleting package...");
    setErrorMessage("");

    const { error } = await supabase
      .from("packages")
      .delete()
      .eq("id", packageId)
      .eq("trainer_id", profile.id);

    if (error) {
      setStatus("");
      setErrorMessage(error.message);
      return;
    }

    setPackages((currentPackages) =>
      currentPackages.filter((pkg) => pkg.id !== packageId),
    );

    if (editingId === packageId) {
      resetForm();
    }

    setStatus("Package deleted.");
  }

  async function handleToggleActive(packageItem: PackageItem) {
    if (!profile) {
      return;
    }

    setStatus("Updating package visibility...");
    setErrorMessage("");

    const { data, error } = await supabase
      .from("packages")
      .update({
        is_active: !packageItem.is_active,
      })
      .eq("id", packageItem.id)
      .eq("trainer_id", profile.id)
      .select("id, trainer_id, title, price, duration, description, is_active")
      .single();

    if (error) {
      setStatus("");
      setErrorMessage(error.message);
      return;
    }

    setPackages((currentPackages) =>
      currentPackages.map((pkg) =>
        pkg.id === packageItem.id ? (data as PackageItem) : pkg,
      ),
    );

    setStatus("Package visibility updated.");
  }

  if (loading) {
    return (
      <DashboardLayout>
        <section className="w-full">
          <div className="h-32" />
        </section>
      </DashboardLayout>
    );
  }

  if (errorMessage && !profile) {
    return (
      <DashboardLayout>
        <section className="w-full">
          <div className="rounded-3xl bg-red-100 p-6 text-red-800">
            <h1 className="text-xl font-bold">Packages error</h1>
            <p className="mt-2">{errorMessage}</p>

            <Link
              href="/dashboard"
              className="mt-4 inline-block rounded-xl bg-gray-950 px-5 py-3 font-semibold text-white"
            >
              Back to Dashboard
            </Link>
          </div>
        </section>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout>
        <section className="w-full">
          <div className="rounded-3xl border border-gray-200 bg-white p-6">
            <h1 className="text-xl font-bold">No profile found</h1>
            <p className="mt-2 text-gray-600">
              Your profile has not loaded yet.
            </p>
          </div>
        </section>
      </DashboardLayout>
    );
  }

  const publicPageUrl = `/trainer/${profile.username}`;
  const activePackagesCount = packages.filter((pkg) => pkg.is_active).length;
  const hiddenPackagesCount = packages.filter((pkg) => !pkg.is_active).length;

  return (
    <DashboardLayout publicPageUrl={publicPageUrl}>
      <section className="w-full">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-base font-medium text-slate-500">Packages</p>

            <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-slate-950 md:text-5xl">
              Manage offers
            </h1>

            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
              Create simple coaching packages clients can choose from when they
              visit your profile.
            </p>
          </div>

          <Link
            href={publicPageUrl}
            className="inline-flex w-fit rounded-full border border-slate-300 bg-white px-5 py-3 text-base font-medium text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
          >
            View Profile
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <p className="text-base font-medium text-slate-500">Total</p>

            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-950">
              {packages.length}
            </h2>

            <p className="mt-3 leading-7 text-slate-600">
              Coaching packages created.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <p className="text-base font-medium text-slate-500">Active</p>

            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-green-700">
              {activePackagesCount}
            </h2>

            <p className="mt-3 leading-7 text-slate-600">
              Visible on your public profile.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <p className="text-base font-medium text-slate-500">Hidden</p>

            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-700">
              {hiddenPackagesCount}
            </h2>

            <p className="mt-3 leading-7 text-slate-600">
              Saved but not shown to clients.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-[0.85fr_1.15fr]">
          <form
            onSubmit={handleSubmit}
            className={`h-fit rounded-3xl border p-6 ${
              editingId
                ? "border-blue-200 bg-blue-50"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="border-b border-slate-200 pb-6">
              <p
                className={`text-base font-medium ${
                  editingId ? "text-blue-700" : "text-slate-500"
                }`}
              >
                {editingId ? "Editing package" : "New package"}
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                {editingId ? "Update this package" : "Add a package"}
              </h2>

              <p className="mt-3 leading-7 text-slate-600">
                Keep the offer simple, clear, and easy for clients to
                understand.
              </p>
            </div>

            <div className="mt-6 grid gap-5">
              <div>
                <label className="mb-2 block text-base font-medium text-slate-800">
                  Package title
                </label>

                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  type="text"
                  required
                  placeholder="8-Week Transformation"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-base outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-base font-medium text-slate-800">
                    Price
                  </label>

                  <input
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    type="text"
                    required
                    placeholder="$199"
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-base outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-base font-medium text-slate-800">
                    Duration
                  </label>

                  <input
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    type="text"
                    required
                    placeholder="8 weeks"
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-base outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-base font-medium text-slate-800">
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  required
                  placeholder="Describe what is included in this package."
                  className="w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-base outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button className="rounded-full bg-blue-600 px-6 py-3.5 text-base font-medium text-white transition hover:bg-blue-700">
                  {editingId ? "Save Changes" : "Add Package"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-full border border-slate-300 bg-white px-6 py-3.5 text-base font-medium text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              {status && (
                <p
                  className={`rounded-2xl px-4 py-3 text-base font-medium ${
                    status.toLowerCase().includes("delete")
                      ? "bg-red-50 text-red-800"
                      : status.toLowerCase().includes("saving") ||
                          status.toLowerCase().includes("adding") ||
                          status.toLowerCase().includes("updating")
                        ? "bg-blue-50 text-blue-800"
                        : "bg-green-50 text-green-800"
                  }`}
                >
                  {status}
                </p>
              )}

              {errorMessage && (
                <p className="rounded-2xl bg-red-50 px-4 py-3 text-base font-medium text-red-800">
                  {errorMessage}
                </p>
              )}
            </div>
          </form>

          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-6">
              <div>
                <p className="text-base font-medium text-slate-500">
                  Package library
                </p>

                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                  Your packages
                </h2>
              </div>

              <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
                {packages.length} Total
              </span>
            </div>

            <div className="mt-6 grid gap-4">
              {packages.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 p-8 text-center">
                  <p className="text-xl font-semibold tracking-[-0.02em] text-slate-950">
                    No packages yet
                  </p>

                  <p className="mt-2 leading-7 text-slate-600">
                    Add your first coaching package using the form.
                  </p>
                </div>
              ) : (
                packages.map((pkg) => {
                  const isEditingThisPackage = editingId === pkg.id;

                  return (
                    <div
                      key={pkg.id}
                      className={`rounded-3xl border p-5 transition ${
                        isEditingThisPackage
                          ? "border-blue-300 bg-blue-50"
                          : pkg.is_active
                            ? "border-slate-200 bg-white"
                            : "border-slate-200 bg-slate-50 opacity-80"
                      }`}
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-xl font-semibold tracking-[-0.02em] text-slate-950">
                              {pkg.title}
                            </h3>

                            <span
                              className={`rounded-full px-3 py-1 text-sm font-medium ${
                                pkg.is_active
                                  ? "bg-green-50 text-green-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {pkg.is_active ? "Active" : "Hidden"}
                            </span>

                            {isEditingThisPackage && (
                              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                                Editing
                              </span>
                            )}
                          </div>

                          <p className="mt-2 text-base text-slate-500">
                            {pkg.duration} · {pkg.price}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleActive(pkg)}
                          className={`rounded-full px-5 py-2.5 text-sm font-medium transition ${
                            pkg.is_active
                              ? "border border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                              : "bg-green-600 text-white hover:bg-green-700"
                          }`}
                        >
                          {pkg.is_active ? "Hide" : "Show"}
                        </button>
                      </div>

                      <p className="mt-4 leading-7 text-slate-600">
                        {pkg.description}
                      </p>

                      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                        <button
                          type="button"
                          onClick={() => handleEdit(pkg)}
                          className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(pkg.id)}
                          className="rounded-full border border-red-200 bg-white px-5 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}
