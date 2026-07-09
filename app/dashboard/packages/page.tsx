"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
      <main className="min-h-screen bg-gray-100 px-4 py-6 text-gray-950">
        <section className="mx-auto max-w-5xl">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="font-semibold">Loading packages...</p>
          </div>
        </section>
      </main>
    );
  }

  if (errorMessage && !profile) {
    return (
      <main className="min-h-screen bg-gray-100 px-4 py-6 text-gray-950">
        <section className="mx-auto max-w-5xl">
          <div className="rounded-3xl bg-red-100 p-6 text-red-800 shadow-sm">
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
      </main>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-6 text-gray-950">
      <section className="mx-auto max-w-5xl">
        <Link
          href="/dashboard"
          className="text-sm font-semibold text-gray-600 transition hover:text-gray-950"
        >
          ← Back to Dashboard
        </Link>

        <div className="mt-4 rounded-3xl bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-500">
                Trainer Packages
              </p>

              <h1 className="mt-1 text-3xl font-bold">Manage Packages</h1>

              <p className="mt-2 text-gray-600">
                Add, edit, delete, or hide packages from your public FitLink
                page.
              </p>
            </div>

            <Link
              href={`/trainer/${profile.username}`}
              className="rounded-xl bg-gray-950 px-5 py-3 text-center font-semibold text-white transition hover:bg-gray-800"
            >
              Preview Public Page
            </Link>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
            <form onSubmit={handleSubmit} className="rounded-2xl bg-gray-50 p-5">
              <h2 className="text-xl font-bold">
                {editingId ? "Edit Package" : "Add New Package"}
              </h2>

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
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-950"
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
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-950"
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
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-950"
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
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-950"
                  />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button className="rounded-xl bg-gray-950 px-5 py-3 font-semibold text-white transition hover:bg-gray-800">
                    {editingId ? "Save Changes" : "Add Package"}
                  </button>

                  {editingId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-700 transition hover:bg-white"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                {status && (
                  <p className="rounded-xl bg-green-100 px-4 py-3 text-sm font-medium text-green-800">
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

            <div>
              <h2 className="text-xl font-bold">Your Packages</h2>

              <div className="mt-4 grid gap-4">
                {packages.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-300 p-6 text-center">
                    <p className="font-semibold">No packages yet</p>
                    <p className="mt-1 text-sm text-gray-600">
                      Add your first coaching package using the form.
                    </p>
                  </div>
                ) : (
                  packages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className={`rounded-2xl border p-5 shadow-sm ${
                        pkg.is_active
                          ? "border-gray-200 bg-white"
                          : "border-gray-200 bg-gray-100 opacity-70"
                      }`}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-bold">{pkg.title}</h3>

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                pkg.is_active
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-200 text-gray-700"
                              }`}
                            >
                              {pkg.is_active ? "Active" : "Hidden"}
                            </span>
                          </div>

                          <p className="mt-1 text-sm text-gray-500">
                            {pkg.duration} · {pkg.price}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleActive(pkg)}
                          className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold transition hover:bg-gray-50"
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
                          className="rounded-xl bg-gray-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
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
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}