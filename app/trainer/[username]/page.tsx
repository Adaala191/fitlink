"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import TrainerPublicContent from "@/components/TrainerPublicContent";
import { supabase } from "@/lib/supabaseClient";

type TrainerProfile = {
  id: string;
  username: string;
  full_name: string;
  specialty: string | null;
  bio: string | null;
  instagram: string | null;
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

export default function TrainerPage() {
  const params = useParams();
  const username = String(params.username);

  const [trainer, setTrainer] = useState<TrainerProfile | null>(null);
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadTrainerPage() {
      setLoading(true);
      setErrorMessage("");

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, username, full_name, specialty, bio, instagram, image_url")
        .eq("username", username)
        .single();

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

      setTrainer(profileData);
      setPackages(packagesData || []);
      setLoading(false);
    }

    loadTrainerPage();
  }, [username]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 px-3 py-4 text-gray-950">
        <section className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-sm">
          <p className="font-semibold">Loading trainer page...</p>
        </section>
      </main>
    );
  }

  if (errorMessage || !trainer) {
    return (
      <main className="min-h-screen bg-gray-100 px-3 py-4 text-gray-950">
        <section className="mx-auto max-w-3xl rounded-3xl bg-white p-6 text-center shadow-sm">
          <h1 className="text-2xl font-bold">Trainer not found</h1>

          <p className="mt-2 text-gray-600">
            This FitLink page does not exist or the username was changed.
          </p>

          <Link
            href="/"
            className="mt-5 inline-block rounded-xl bg-gray-950 px-5 py-3 font-semibold text-white transition hover:bg-gray-800"
          >
            Back Home
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 px-3 py-4 text-gray-950">
      <section className="mx-auto max-w-3xl overflow-hidden rounded-3xl bg-white shadow-sm">
        <div className="h-40 bg-gray-950" />

        <div className="px-4 pb-6">
          <img
            src={
              trainer.image_url ||
              "https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=800&auto=format&fit=crop"
            }
            alt={trainer.full_name}
            className="-mt-20 h-36 w-36 rounded-3xl border-4 border-white object-cover shadow-md"
          />

          <div className="mt-5">
            {trainer.instagram && (
              <p className="text-sm font-semibold text-gray-500">
                {trainer.instagram}
              </p>
            )}

            <h1 className="mt-1 text-3xl font-bold">{trainer.full_name}</h1>

            <p className="mt-2 font-medium text-gray-700">
              {trainer.specialty || "Fitness Coach"}
            </p>

            <p className="mt-4 leading-7 text-gray-600">
              {trainer.bio || "This trainer has not added a bio yet."}
            </p>
          </div>

          {packages.length > 0 ? (
            <TrainerPublicContent trainerId={trainer.id} packages={packages} />
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-gray-300 p-6 text-center">
              <h2 className="text-xl font-bold">No packages available yet</h2>
              <p className="mt-2 text-gray-600">
                This trainer has not published any active packages.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}