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
        .select("id, trainer_id, title, price, duration, description, is_active")
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
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
        .select("id, trainer_id, title, price, duration, description, is_active")
        .single();

      if (error) {
        setStatus("");
        setErrorMessage(error.message);
        return;
      }

      setPackages((currentPackages) =>
        currentPackages.map((pkg) =>
          pkg.id === editingId ? (data as PackageItem) : pkg
        )
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
      currentPackages.filter((pkg) => pkg.id !== packageId)
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
        pkg.id === packageItem.id ? (data as PackageItem) : pkg
      )
    );

    setStatus("Package visibility updated.");
  }

  if (loading) {
    return (
      <DashboardLayout>
        <section className="w-full">
          <div className="rounded-3xl border border-gray-200 bg-white p-6">
            <p className="font-semibold">Loading packages...</p>
          </div>
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
        <div className="rounded-3xl bg-gray-950 p-6 text-white">
          <p className="text-sm font-semibold text-gray-300">
            Trainer Packages
          </p>

          <h1 className="mt-1 text-3xl font-bold">Manage Packages</h1>

          <p className="mt-2 max-w-2xl text-gray-300">
            Add, edit, delete, or hide packages from your public FitLink page.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <span className="rounded-full bg-green-400/15 px-4 py-2 text-sm font-bold text-green-200">
              {activePackagesCount} Active
            </span>

            <span className="rounded-full bg-gray-400/15 px-4 py-2 text-sm font-bold text-gray-200">
              {hiddenPackagesCount} Hidden
            </span>

            {editingId && (
              <span className="rounded-full bg-blue-400/15 px-4 py-2 text-sm font-bold text-blue-200">
                Editing package
              </span>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <form
            onSubmit={handleSubmit}
            className={`rounded-3xl border p-6 ${
              editingId
                ? "border-blue-200 bg-blue-50"
                : "border-gray-200 bg-white"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p
                  className={`text-sm font-bold ${
                    editingId ? "text-blue-700" : "text-gray-500"
                  }`}
                >
                  {editingId ? "Edit mode" : "New package"}
                </p>

                <h2 className="mt-1 text-2xl font-bold">
                  {editingId ? "Edit Package" : "Add New Package"}
                </h2>
              </div>

              {editingId && (
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
                  Editing
                </span>
              )}
            </div>

            <div className="mt-5 grid gap-4">
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Package title
                </label>

                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  type="text"
                  required
                  placeholder="8-Week Transformation"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-gray-950"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Price
                  </label>

                  <input
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    type="text"
                    required
                    placeholder="$199"
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-gray-950"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Duration
                  </label>

                  <input
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    type="text"
                    required
                    placeholder="8 weeks"
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-gray-950"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  required
                  placeholder="Describe what is included in this package."
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-gray-950"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  className={`rounded-xl px-5 py-3 font-semibold text-white transition ${
                    editingId
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gray-950 hover:bg-gray-800"
                  }`}
                >
                  {editingId ? "Save Changes" : "Add Package"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-xl border border-blue-200 bg-white px-5 py-3 font-semibold text-blue-700 transition hover:bg-blue-50"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              {status && (
                <p
                  className={`rounded-xl px-4 py-3 text-sm font-medium ${
                    status.toLowerCase().includes("delete")
                      ? "bg-red-100 text-red-800"
                      : status.toLowerCase().includes("saving") ||
                        status.toLowerCase().includes("adding") ||
                        status.toLowerCase().includes("updating")
                      ? "bg-blue-100 text-blue-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {status}
                </p>
              )}

              {errorMessage && (
                <p className="rounded-xl bg-red-100 px-4 py-3 text-sm font-medium text-red-800">
                  {errorMessage}
                </p>
              )}
            </div>
          </form>

          <div className="rounded-3xl border border-gray-200 bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-gray-500">
                  Package library
                </p>

                <h2 className="mt-1 text-2xl font-bold">Your Packages</h2>
              </div>

              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700">
                {packages.length} Total
              </span>
            </div>

            <div className="mt-5 grid gap-4">
              {packages.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center">
                  <p className="font-semibold">No packages yet</p>
                  <p className="mt-1 text-sm text-gray-600">
                    Add your first coaching package using the form.
                  </p>
                </div>
              ) : (
                packages.map((pkg) => {
                  const isEditingThisPackage = editingId === pkg.id;

                  return (
                    <div
                      key={pkg.id}
                      className={`rounded-2xl border p-5 transition ${
                        isEditingThisPackage
                          ? "border-blue-300 bg-blue-50"
                          : pkg.is_active
                          ? "border-green-200 bg-white"
                          : "border-gray-200 bg-gray-50 opacity-80"
                      }`}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-bold">{pkg.title}</h3>

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-bold ${
                                pkg.is_active
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-200 text-gray-700"
                              }`}
                            >
                              {pkg.is_active ? "Active" : "Hidden"}
                            </span>

                            {isEditingThisPackage && (
                              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
                                Editing
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-sm text-gray-500">
                            {pkg.duration} · {pkg.price}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleActive(pkg)}
                          className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                            pkg.is_active
                              ? "border border-gray-300 text-gray-700 hover:bg-gray-50"
                              : "bg-green-600 text-white hover:bg-green-700"
                          }`}
                        >
                          {pkg.is_active ? "Hide" : "Show"}
                        </button>
                      </div>

                      <p className="mt-3 leading-6 text-gray-600">
                        {pkg.description}
                      </p>

                      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                        <button
                          type="button"
                          onClick={() => handleEdit(pkg)}
                          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(pkg.id)}
                          className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
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