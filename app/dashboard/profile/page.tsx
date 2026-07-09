"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type TrainerProfile = {
  id: string;
  full_name: string;
  username: string;
  specialty: string;
  bio: string;
  instagram: string;
  phone: string;
  contact_email: string;
  image_url: string;
};

export default function EditProfilePage() {
  const [profile, setProfile] = useState<TrainerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [status, setStatus] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
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

      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, full_name, username, specialty, bio, instagram, phone, contact_email, image_url"
        )
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      if (!data) {
        setErrorMessage("No trainer profile found for this account.");
        setLoading(false);
        return;
      }

      setProfile(data as TrainerProfile);
      setLoading(false);
    }

    loadProfile();
  }, []);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = event.target;

    setProfile((currentProfile) => {
      if (!currentProfile) {
        return currentProfile;
      }

      return {
        ...currentProfile,
        [name]: value,
      };
    });

    setStatus("");
    setErrorMessage("");
  }

  async function handleImageUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    if (!profile) {
      return;
    }

    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please upload an image file.");
      return;
    }

    const maxSizeInMb = 5;
    const maxSizeInBytes = maxSizeInMb * 1024 * 1024;

    if (file.size > maxSizeInBytes) {
      setErrorMessage("Image must be smaller than 5MB.");
      return;
    }

    setUploadingImage(true);
    setStatus("Uploading image...");
    setErrorMessage("");

    const fileExtension = file.name.split(".").pop();
    const fileName = `${profile.id}-${Date.now()}.${fileExtension}`;
    const filePath = `${profile.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("trainer-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      setUploadingImage(false);
      setStatus("");
      setErrorMessage(uploadError.message);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("trainer-images")
      .getPublicUrl(filePath);

    const newImageUrl = publicUrlData.publicUrl;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        image_url: newImageUrl,
      })
      .eq("id", profile.id);

    if (updateError) {
      setUploadingImage(false);
      setStatus("");
      setErrorMessage(updateError.message);
      return;
    }

    setProfile({
      ...profile,
      image_url: newImageUrl,
    });

    setUploadingImage(false);
    setStatus("Profile image uploaded successfully.");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!profile) {
      return;
    }

    setStatus("Saving profile...");
    setErrorMessage("");

    const cleanUsername = profile.username
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-");

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        username: cleanUsername,
        specialty: profile.specialty,
        bio: profile.bio,
        instagram: profile.instagram,
        phone: profile.phone,
        contact_email: profile.contact_email,
        image_url: profile.image_url,
      })
      .eq("id", profile.id);

    if (error) {
      setStatus("");
      setErrorMessage(error.message);
      return;
    }

    setProfile({
      ...profile,
      username: cleanUsername,
    });

    setStatus("Profile saved successfully.");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 px-4 py-6 text-gray-950">
        <section className="mx-auto max-w-4xl">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="font-semibold">Loading profile...</p>
          </div>
        </section>
      </main>
    );
  }

  if (errorMessage && !profile) {
    return (
      <main className="min-h-screen bg-gray-100 px-4 py-6 text-gray-950">
        <section className="mx-auto max-w-4xl">
          <div className="rounded-3xl bg-red-100 p-6 text-red-800 shadow-sm">
            <h1 className="text-xl font-bold">Profile error</h1>
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
      <section className="mx-auto max-w-4xl">
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
                Trainer Profile
              </p>

              <h1 className="mt-1 text-3xl font-bold">Edit Profile</h1>

              <p className="mt-2 text-gray-600">
                This information appears on your public FitLink page.
              </p>
            </div>

            <Link
              href={`/trainer/${profile.username}`}
              className="rounded-xl bg-gray-950 px-5 py-3 text-center font-semibold text-white transition hover:bg-gray-800"
            >
              Preview Page
            </Link>
          </div>

          <div className="mt-8 grid gap-8 md:grid-cols-[220px_1fr]">
            <div>
              <img
                src={profile.image_url}
                alt={profile.full_name}
                className="h-40 w-40 rounded-3xl object-cover shadow-sm"
              />

              <div className="mt-4">
                <label className="mb-2 block text-sm font-semibold">
                  Upload profile image
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="block w-full text-sm text-gray-700 file:mr-4 file:rounded-xl file:border-0 file:bg-gray-950 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-gray-800"
                />

                <p className="mt-2 text-xs text-gray-500">
                  JPG, PNG, or WebP. Max size 5MB.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4">
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Profile image URL
                </label>

                <input
                  name="image_url"
                  value={profile.image_url || ""}
                  onChange={handleChange}
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-950"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Full name
                  </label>

                  <input
                    name="full_name"
                    value={profile.full_name || ""}
                    onChange={handleChange}
                    type="text"
                    required
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-950"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Username
                  </label>

                  <input
                    name="username"
                    value={profile.username || ""}
                    onChange={handleChange}
                    type="text"
                    required
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-950"
                  />

                  <p className="mt-1 text-xs text-gray-500">
                    Your link: /trainer/{profile.username}
                  </p>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Specialty
                </label>

                <input
                  name="specialty"
                  value={profile.specialty || ""}
                  onChange={handleChange}
                  type="text"
                  required
                  placeholder="Fat Loss & Strength Coaching"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-950"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">Bio</label>

                <textarea
                  name="bio"
                  value={profile.bio || ""}
                  onChange={handleChange}
                  rows={5}
                  required
                  placeholder="Tell clients who you help and how you help them."
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-950"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Instagram
                  </label>

                  <input
                    name="instagram"
                    value={profile.instagram || ""}
                    onChange={handleChange}
                    type="text"
                    placeholder="@username"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-950"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Phone
                  </label>

                  <input
                    name="phone"
                    value={profile.phone || ""}
                    onChange={handleChange}
                    type="tel"
                    placeholder="+1 647 000 0000"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-950"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Contact email
                  </label>

                  <input
                    name="contact_email"
                    value={profile.contact_email || ""}
                    onChange={handleChange}
                    type="email"
                    required
                    placeholder="trainer@email.com"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-950"
                  />
                </div>
              </div>

              <button className="rounded-xl bg-gray-950 px-5 py-3 font-semibold text-white transition hover:bg-gray-800">
                Save Profile
              </button>

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
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}