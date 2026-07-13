"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/lib/supabaseClient";
import { validateUsername } from "@/lib/username";

type TrainerProfile = {
  id: string;
  full_name: string;
  username: string;
  specialty: string;
  bio: string;
  instagram: string;
  tiktok: string;
  whatsapp: string;
  phone: string;
  contact_email: string;
  image_url: string;
};

const defaultProfileImage =
  "https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=800&auto=format&fit=crop";

export default function EditProfilePage() {
  const [profile, setProfile] = useState<TrainerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [status, setStatus] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const loadProfile = useCallback(async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    setErrorMessage("");

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
        "id, full_name, username, specialty, bio, instagram, tiktok, whatsapp, phone, contact_email, image_url",
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
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadProfile();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadProfile]);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
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

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
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

    const fileExtension =
      file.type === "image/png"
        ? "png"
        : file.type === "image/webp"
          ? "webp"
          : "jpg";

    const filePath = `${profile.id}/profile-${Date.now()}.${fileExtension}`;

    const { error: uploadError } = await supabase.storage
      .from("trainer-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type,
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
      image_url: `${newImageUrl}?t=${Date.now()}`,
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

    const usernameValidation = validateUsername(profile.username);

    if (!usernameValidation.isValid) {
      setStatus("");
      setErrorMessage(usernameValidation.error);
      return;
    }

    const cleanUsername = usernameValidation.username;

    const cleanImageUrl = profile.image_url
      ? profile.image_url.split("?")[0]
      : "";

    const usernameCheckResponse = await fetch("/api/check-username", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: cleanUsername,
        currentProfileId: profile.id,
      }),
    });

    const usernameCheckData = await usernameCheckResponse.json();

    if (usernameCheckData.exists) {
      setStatus("");
      setErrorMessage("Username already taken. Please choose another one.");
      return;
    }

    if (!usernameCheckResponse.ok) {
      setStatus("");
      setErrorMessage(usernameCheckData.error || "Could not check username.");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        username: cleanUsername,
        specialty: profile.specialty,
        bio: profile.bio,
        instagram: profile.instagram,
        tiktok: profile.tiktok,
        whatsapp: profile.whatsapp,
        phone: profile.phone,
        contact_email: profile.contact_email,
        image_url: cleanImageUrl,
      })
      .eq("id", profile.id);

    if (error) {
      setStatus("");

      if (error.message.includes("profiles_username_key")) {
        setErrorMessage("Username already taken. Please choose another one.");
        return;
      }

      setErrorMessage(error.message);
      return;
    }

    setProfile({
      ...profile,
      username: cleanUsername,
      image_url: cleanImageUrl,
    });

    setStatus("Profile saved successfully.");
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
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-800">
            <p className="text-sm font-medium">Profile error</p>

            <h1 className="mt-2 text-2xl font-semibold tracking-[-0.02em]">
              Something needs attention
            </h1>

            <p className="mt-3 max-w-2xl leading-7">{errorMessage}</p>

            <Link
              href="/dashboard"
              className="mt-5 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Back to Overview
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
          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <h1 className="text-2xl font-semibold tracking-[-0.02em]">
              No profile found
            </h1>

            <p className="mt-2 text-slate-600">
              Your profile has not loaded yet.
            </p>
          </div>
        </section>
      </DashboardLayout>
    );
  }

  const publicPageUrl = `/trainer/${profile.username}`;
  const profileImage = profile.image_url || defaultProfileImage;

  return (
    <DashboardLayout publicPageUrl={publicPageUrl}>
      <section className="w-full">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-base font-medium text-slate-500">Profile</p>

            <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-slate-950 md:text-5xl">
              Edit profile
            </h1>

            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
              This is the information clients see when they open your FitLink.
            </p>
          </div>

          <Link
            href={publicPageUrl}
            className="inline-flex w-fit rounded-full border border-slate-300 bg-white px-5 py-3 text-base font-medium text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
          >
            View Profile
          </Link>
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-[320px_1fr]">
          <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6">
            <div className="relative h-56 w-full overflow-hidden rounded-3xl bg-slate-100">
              <Image
                src={profileImage}
                alt={profile.full_name || "Trainer profile"}
                fill
                priority
                unoptimized
                className="object-cover"
              />
            </div>

            <div className="mt-5">
              <p className="text-xl font-semibold tracking-[-0.02em] text-slate-950">
                {profile.full_name || "Your name"}
              </p>

              <p className="mt-1 text-base text-slate-500">
                {profile.specialty || "Your coaching specialty"}
              </p>
            </div>

            <div className="mt-6">
              <label className="mb-2 block text-base font-medium text-slate-800">
                Upload profile image
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-blue-600 file:px-4 file:py-2.5 file:font-medium file:text-white hover:file:bg-blue-700 disabled:opacity-60"
              />

              <p className="mt-3 text-sm leading-6 text-slate-500">
                JPG, PNG, or WebP. Max size 5MB.
              </p>
            </div>

            <div className="mt-6 rounded-2xl bg-[oklch(98.4%_0.003_247.858)] p-4">
              <p className="text-sm font-medium text-slate-500">Your link</p>

              <p className="mt-1 break-all text-base font-medium text-slate-800">
                /trainer/{profile.username || "your-username"}
              </p>
            </div>
          </aside>

          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-slate-200 bg-white p-6"
          >
            <div className="border-b border-slate-200 pb-6">
              <p className="text-base font-medium text-slate-500">
                Basic information
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                Your public identity
              </h2>
            </div>

            <div className="mt-6 grid gap-5">
              <div>
                <label className="mb-2 block text-base font-medium text-slate-800">
                  Profile image URL
                </label>

                <input
                  name="image_url"
                  value={profile.image_url || ""}
                  onChange={handleChange}
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-base outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-base font-medium text-slate-800">
                    Full name
                  </label>

                  <input
                    name="full_name"
                    value={profile.full_name || ""}
                    onChange={handleChange}
                    type="text"
                    required
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-base outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-base font-medium text-slate-800">
                    Username
                  </label>

                  <input
                    name="username"
                    value={profile.username || ""}
                    onChange={handleChange}
                    type="text"
                    required
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-base outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Use lowercase letters, numbers, hyphens, and underscores.
                  </p>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-base font-medium text-slate-800">
                  Specialty
                </label>

                <input
                  name="specialty"
                  value={profile.specialty || ""}
                  onChange={handleChange}
                  type="text"
                  required
                  placeholder="Fat Loss & Strength Coaching"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-base outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-base font-medium text-slate-800">
                  Bio
                </label>

                <textarea
                  name="bio"
                  value={profile.bio || ""}
                  onChange={handleChange}
                  rows={5}
                  required
                  placeholder="Tell clients who you help and how you help them."
                  className="w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-base outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="mt-8 border-t border-slate-200 pt-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-base font-medium text-slate-500">
                    Contact buttons
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                    Social and contact details
                  </h2>

                  <p className="mt-3 max-w-2xl leading-7 text-slate-600">
                    These can appear on your public profile so clients can reach
                    you easily.
                  </p>
                </div>

                <span className="rounded-full bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
                  Optional
                </span>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-base font-medium text-slate-800">
                    Instagram
                  </label>

                  <input
                    name="instagram"
                    value={profile.instagram || ""}
                    onChange={handleChange}
                    type="text"
                    placeholder="@username"
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-base outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-base font-medium text-slate-800">
                    TikTok
                  </label>

                  <input
                    name="tiktok"
                    value={profile.tiktok || ""}
                    onChange={handleChange}
                    type="text"
                    placeholder="@username"
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-base outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-base font-medium text-slate-800">
                    WhatsApp
                  </label>

                  <input
                    name="whatsapp"
                    value={profile.whatsapp || ""}
                    onChange={handleChange}
                    type="tel"
                    placeholder="+16470000000"
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-base outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Use country code, for example +16470000000.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-base font-medium text-slate-800">
                    Phone
                  </label>

                  <input
                    name="phone"
                    value={profile.phone || ""}
                    onChange={handleChange}
                    type="tel"
                    placeholder="+1 647 000 0000"
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-base outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-base font-medium text-slate-800">
                    Contact email
                  </label>

                  <input
                    name="contact_email"
                    value={profile.contact_email || ""}
                    onChange={handleChange}
                    type="email"
                    required
                    placeholder="trainer@email.com"
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-base outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <button className="rounded-full bg-blue-600 px-6 py-3.5 text-base font-medium text-white transition hover:bg-blue-700">
                Save Profile
              </button>

              <Link
                href={publicPageUrl}
                className="rounded-full border border-slate-300 bg-white px-6 py-3.5 text-center text-base font-medium text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
              >
                Preview Profile
              </Link>
            </div>

            {status && (
              <p className="mt-5 rounded-2xl bg-green-50 px-4 py-3 text-base font-medium text-green-800">
                {status}
              </p>
            )}

            {errorMessage && (
              <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-base font-medium text-red-800">
                {errorMessage}
              </p>
            )}
          </form>
        </div>
      </section>
    </DashboardLayout>
  );
}