"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  FaEnvelope,
  FaInstagram,
  FaPhone,
  FaTiktok,
  FaWhatsapp,
} from "react-icons/fa";
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

function cleanUsername(value: string) {
  return value.replace("@", "").trim();
}

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

  const loadTrainerPage = useCallback(async () => {
    setErrorMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    setCurrentUserId(user?.id || "");

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
  }, [username]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadTrainerPage();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadTrainerPage]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[oklch(98.4%_0.003_247.858)] px-4 py-6 text-slate-950">
        <section className="mx-auto max-w-5xl">
          <div className="h-32" />
        </section>
      </main>
    );
  }

  if (errorMessage || !trainer) {
    return (
      <main className="min-h-screen bg-[oklch(98.4%_0.003_247.858)] px-4 py-6 text-slate-950">
        <section className="mx-auto flex min-h-[80vh] max-w-3xl items-center justify-center">
          <div className="w-full rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-2xl text-red-700">
              !
            </div>

            <h1 className="mt-5 text-3xl font-semibold tracking-[-0.04em]">
              Trainer not found
            </h1>

            <p className="mt-3 leading-7 text-slate-600">
              This FitLink profile does not exist or the username was changed.
            </p>

            <Link
              href="/"
              className="mt-6 inline-flex rounded-full bg-blue-600 px-5 py-3 text-base font-medium text-white transition hover:bg-blue-700"
            >
              Back home
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const trainerImage = trainer.image_url || defaultTrainerImage;
  const isTrainerOwner = currentUserId === trainer.id;

  return (
    <main className="min-h-screen bg-[oklch(98.4%_0.003_247.858)] text-slate-950">
      <section className="mx-auto w-full max-w-5xl px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between">
          <FitLinkLogo href="/" />

          {isTrainerOwner ? (
            <Link
              href="/dashboard"
              className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Overview
            </Link>
          ) : (
            <a
              href="#packages"
              className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              View packages
            </a>
          )}
        </header>

        <section className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="grid gap-8 md:grid-cols-[150px_1fr] md:items-start">
            <div className="mx-auto md:mx-0">
              <div className="relative h-32 w-32 overflow-hidden rounded-full border border-slate-200 bg-slate-100 md:h-36 md:w-36">
                <Image
                  src={trainerImage}
                  alt={trainer.full_name}
                  fill
                  priority
                  unoptimized
                  className="object-cover"
                />
              </div>
            </div>

            <div>
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h1 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950 md:text-4xl">
                    {trainer.full_name}
                  </h1>

                  <p className="mt-2 text-base font-medium text-slate-500">
                    @{trainer.username}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <a
                    href="#packages"
                    className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                  >
                    Packages
                  </a>

                  <a
                    href="#request"
                    className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                  >
                    Inquiry
                  </a>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-8 border-y border-slate-200 py-5">
                <div>
                  <p className="text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                    {packages.length}
                  </p>
                  <p className="text-sm text-slate-500">Packages</p>
                </div>

                <div>
                  <p className="text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                    Open
                  </p>
                  <p className="text-sm text-slate-500">Inquiries</p>
                </div>

                <div>
                  <p className="text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                    Coach
                  </p>
                  <p className="text-sm text-slate-500">Profile</p>
                </div>
              </div>

              <div className="mt-5">
                <p className="text-base font-semibold text-slate-950">
                  {trainer.specialty || "Fitness Coach"}
                </p>

                <p className="mt-2 max-w-3xl leading-7 text-slate-600">
                  {trainer.bio || "This trainer has not added a bio yet."}
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {trainer.instagram && (
                  <a
                    href={`https://instagram.com/${cleanUsername(
                      trainer.instagram,
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Instagram"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-lg text-slate-700 transition hover:border-pink-300 hover:bg-pink-50 hover:text-pink-600"
                  >
                    <FaInstagram />
                  </a>
                )}

                {trainer.tiktok && (
                  <a
                    href={`https://www.tiktok.com/@${cleanUsername(
                      trainer.tiktok,
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="TikTok"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-lg text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                  >
                    <FaTiktok />
                  </a>
                )}

                {trainer.whatsapp && (
                  <a
                    href={`https://wa.me/${cleanPhone(trainer.whatsapp)}`}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="WhatsApp"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-green-200 bg-green-50 text-lg text-green-700 transition hover:bg-green-100"
                  >
                    <FaWhatsapp />
                  </a>
                )}

                {trainer.phone && (
                  <a
                    href={`tel:${trainer.phone}`}
                    aria-label="Call"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-base text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                  >
                    <FaPhone />
                  </a>
                )}

                {trainer.contact_email && (
                  <a
                    href={`mailto:${trainer.contact_email}`}
                    aria-label="Email"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-base text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                  >
                    <FaEnvelope />
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        <section
          id="packages"
          className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8"
        >
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-base font-medium text-slate-500">
                Coaching packages
              </p>

              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-slate-950">
                Choose a package
              </h2>

              <p className="mt-3 max-w-2xl leading-7 text-slate-600">
                Select the option that fits your goal, then send your inquiry.
              </p>
            </div>

            <div className="rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
              Accepting inquiries
            </div>
          </div>

          {packages.length > 0 ? (
            <TrainerPublicContent trainerId={trainer.id} packages={packages} />
          ) : (
            <div className="mt-8 rounded-3xl border border-dashed border-slate-300 p-8 text-center">
              <h2 className="text-xl font-semibold tracking-[-0.02em]">
                No packages available yet
              </h2>

              <p className="mt-2 leading-7 text-slate-600">
                This trainer has not published any active packages.
              </p>

              {isTrainerOwner && (
                <Link
                  href="/dashboard/packages"
                  className="mt-5 inline-flex rounded-full bg-blue-600 px-5 py-3 text-base font-medium text-white transition hover:bg-blue-700"
                >
                  Add your first package
                </Link>
              )}
            </div>
          )}
        </section>

        <footer className="px-2 py-8 text-center text-sm text-slate-500">
          Powered by{" "}
          <Link href="/" className="font-medium text-slate-950">
            FitLink
          </Link>
        </footer>
      </section>
    </main>
  );
}