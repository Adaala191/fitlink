"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import Link from "next/link";
import TrainerPublicContent from "@/components/TrainerPublicContent";
import FitLinkLogo from "@/components/FitLinkLogo";
import { supabase } from "@/lib/supabaseClient";

type TrainerProfile = {
  id: string;
  username: string;
  full_name: string;
  specialty: string | null;
  bio: string | null;
  instagram: string | null;
  tiktok: string | null;
  whatsapp: string | null;
  phone: string | null;
  contact_email: string | null;
  image_url: string | null;
};

type PackageItem = {
  id: string;
  title: string;
  price: string;
  duration: string;
  description: string;
  is_active: boolean;
};

const defaultTrainerImage =
  "https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=800&auto=format&fit=crop";

// Removes @ from usernames so links work whether the trainer types @name or name.
function cleanUsername(value: string) {
  return value.replace("@", "").trim();
}

// WhatsApp links need only numbers and an optional + sign.
function cleanPhone(value: string) {
  return value.replace(/[^\d+]/g, "");
}

export default function TrainerPage() {
  const params = useParams();
  const username = String(params.username);

  const [trainer, setTrainer] = useState<TrainerProfile | null>(null);
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");

  useEffect(() => {
    async function loadTrainerPage() {
      setLoading(true);
      setErrorMessage("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      setCurrentUserId(user?.id || "");

      // First we load the trainer profile from the public username in the URL.
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select(
          "id, username, full_name, specialty, bio, instagram, tiktok, whatsapp, phone, contact_email, image_url",
        )
        .eq("username", username)
        .maybeSingle();

      if (profileError) {
        console.error("Profile error:", profileError);
        setTrainer(null);
        setErrorMessage(profileError.message);
        setLoading(false);
        return;
      }

      if (!profileData) {
        setTrainer(null);
        setErrorMessage("Trainer profile was not found.");
        setLoading(false);
        return;
      }

      // Only active packages should show on the public page.
      const { data: packagesData, error: packagesError } = await supabase
        .from("packages")
        .select("id, title, price, duration, description, is_active")
        .eq("trainer_id", profileData.id)
        .eq("is_active", true)
        .order("created_at", { ascending: true });

      if (packagesError) {
        setErrorMessage(packagesError.message);
        setLoading(false);
        return;
      }

      setTrainer(profileData as TrainerProfile);
      setPackages((packagesData || []) as PackageItem[]);
      setLoading(false);
    }

    loadTrainerPage();
  }, [username]);

  if (loading) {
    return (
      <main className="min-h-screen bg-white px-4 py-6 text-gray-950">
        <section className="mx-auto max-w-6xl">
          <div className="rounded-3xl border border-gray-200 bg-white p-6">
            <p className="font-semibold">Loading trainer page...</p>
          </div>
        </section>
      </main>
    );
  }

  if (errorMessage || !trainer) {
    return (
      <main className="min-h-screen bg-white px-4 py-6 text-gray-950">
        <section className="mx-auto flex min-h-[80vh] max-w-3xl items-center justify-center">
          <div className="w-full rounded-3xl border border-gray-200 bg-white p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-2xl">
              !
            </div>

            <h1 className="mt-5 text-3xl font-black">Trainer not found</h1>

            <p className="mt-3 text-gray-600">
              This FitLink page does not exist or the username was changed.
            </p>

            <Link
              href="/"
              className="mt-6 inline-block rounded-xl bg-gray-950 px-5 py-3 font-semibold text-white transition hover:bg-gray-800"
            >
              Back Home
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const trainerImage = trainer.image_url || defaultTrainerImage;
  const isTrainerOwner = currentUserId === trainer.id;

  return (
    <main className="min-h-screen bg-white text-gray-950">
      <section className="w-full px-3 py-3 md:px-4">
        <div className="overflow-hidden rounded-[2rem] bg-gray-950 text-white">
          <div className="relative p-6 md:p-8 lg:p-10">
            <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-green-500/20 blur-3xl" />

            <div className="relative z-10">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="inline-flex rounded-2xl bg-white p-3 shadow-sm">
                  <FitLinkLogo href="/" />
                </div>

                {isTrainerOwner && (
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-black text-gray-950 transition hover:bg-gray-100"
                  >
                    Back to Dashboard
                  </Link>
                )}
              </div>

              <div className="mt-10 grid gap-8 lg:grid-cols-[220px_1fr] lg:items-center">
                <div className="relative h-48 w-48 overflow-hidden rounded-[2rem] border-4 border-white/10 bg-gray-800 shadow-xl">
                  <Image
                    src={trainerImage}
                    alt={trainer.full_name}
                    fill
                    priority
                    unoptimized
                    className="object-cover"
                  />
                </div>

                <div>
                  <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight md:text-6xl">
                    Train with {trainer.full_name}
                  </h1>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <span className="rounded-full bg-green-400/15 px-4 py-2 text-sm font-bold text-green-200">
                      {trainer.specialty || "Fitness Coach"}
                    </span>

                    <span className="rounded-full bg-blue-400/15 px-4 py-2 text-sm font-bold text-blue-200">
                      {packages.length} Available Packages
                    </span>

                    <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-gray-200">
                      Accepting Requests
                    </span>
                  </div>

                  <p className="mt-5 max-w-3xl text-lg leading-8 text-gray-300">
                    {trainer.bio || "This trainer has not added a bio yet."}
                  </p>

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <a
                      href="#packages"
                      className="rounded-2xl bg-blue-600 px-6 py-4 text-center font-black text-white transition hover:bg-blue-700"
                    >
                      View Packages
                    </a>

                    <a
                      href="#request"
                      className="rounded-2xl bg-green-500 px-6 py-4 text-center font-black text-gray-950 transition hover:bg-green-400"
                    >
                      Send Request
                    </a>

                    {trainer.instagram && (
                      <a
                        href={`https://instagram.com/${cleanUsername(
                          trainer.instagram,
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-pink-400/30 bg-pink-400/10 px-6 py-4 font-black text-pink-100 transition hover:bg-pink-400/20"
                      >
                        <span>◎</span>
                        Instagram
                      </a>
                    )}

                    {trainer.tiktok && (
                      <a
                        href={`https://www.tiktok.com/@${cleanUsername(
                          trainer.tiktok,
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-6 py-4 font-black text-white transition hover:bg-white/15"
                      >
                        <span>♪</span>
                        TikTok
                      </a>
                    )}

                    {trainer.whatsapp && (
                      <a
                        href={`https://wa.me/${cleanPhone(trainer.whatsapp)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-green-400/30 bg-green-400/10 px-6 py-4 font-black text-green-200 transition hover:bg-green-400/20"
                      >
                        <span>☘</span>
                        WhatsApp
                      </a>
                    )}

                    {trainer.phone && (
                      <a
                        href={`tel:${trainer.phone}`}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-400/30 bg-blue-400/10 px-6 py-4 font-black text-blue-200 transition hover:bg-blue-400/20"
                      >
                        <span>☎</span>
                        Call
                      </a>
                    )}

                    {trainer.contact_email && (
                      <a
                        href={`mailto:${trainer.contact_email}`}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-6 py-4 font-black text-white transition hover:bg-white/15"
                      >
                        <span>✉</span>
                        Email
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-[2rem] border border-gray-200 bg-white p-5 md:p-7">
          <div className="flex flex-col gap-4 border-b border-gray-200 pb-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-600">
                Coaching packages
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-tight">
                Choose your package
              </h2>

              <p className="mt-2 max-w-2xl text-gray-600">
                Select the option that fits your goal, then send your request.
                The trainer will contact you with the next steps.
              </p>
            </div>

            <div className="rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-green-900">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-green-700">
                Page status
              </p>
              <p className="mt-1 font-black">Live and accepting leads</p>
            </div>
          </div>

          {packages.length > 0 ? (
            <div id="packages">
              <TrainerPublicContent
                trainerId={trainer.id}
                packages={packages}
              />
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-gray-300 p-8 text-center">
              <h2 className="text-xl font-bold">No packages available yet</h2>

              <p className="mt-2 text-gray-600">
                This trainer has not published any active packages.
              </p>

              {isTrainerOwner && (
                <Link
                  href="/dashboard/packages"
                  className="mt-5 inline-block rounded-xl bg-blue-600 px-5 py-3 font-bold text-white transition hover:bg-blue-700"
                >
                  Add Your First Package
                </Link>
              )}
            </div>
          )}
        </div>

        <footer className="px-2 py-6 text-center text-sm text-gray-500">
          Powered by{" "}
          <Link href="/" className="font-bold text-gray-950">
            FitLink
          </Link>
        </footer>
      </section>
    </main>
  );
}
