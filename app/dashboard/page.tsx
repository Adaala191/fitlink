"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CopyLinkButton from "@/components/CopyLinkButton";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/lib/supabaseClient";

type TrainerProfile = {
  id: string;
  username: string;
  full_name: string;
};

type PackageItem = {
  id: string;
  is_active: boolean;
};

type ClientRequest = {
  id: string;
  status: "new" | "contacted" | "closed";
};

export default function DashboardPage() {
  const [profile, setProfile] = useState<TrainerProfile | null>(null);
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [requests, setRequests] = useState<ClientRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadDashboardData() {
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
        .select("id, username, full_name")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        setErrorMessage(profileError.message);
        setLoading(false);
        return;
      }

      if (!profileData) {
        setErrorMessage(
          "Your trainer profile was not found. Please go to the Profile page and complete your profile."
        );
        setLoading(false);
        return;
      }

      const { data: packagesData, error: packagesError } = await supabase
        .from("packages")
        .select("id, is_active")
        .eq("trainer_id", user.id);

      if (packagesError) {
        setErrorMessage(packagesError.message);
        setLoading(false);
        return;
      }

      const { data: requestsData, error: requestsError } = await supabase
        .from("client_requests")
        .select("id, status")
        .eq("trainer_id", user.id);

      if (requestsError) {
        setErrorMessage(requestsError.message);
        setLoading(false);
        return;
      }

      setProfile(profileData as TrainerProfile);
      setPackages((packagesData || []) as PackageItem[]);
      setRequests((requestsData || []) as ClientRequest[]);
      setLoading(false);
    }

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <section className="w-full">
          <div className="rounded-3xl border border-gray-200 bg-white p-6">
            <p className="font-semibold">Loading dashboard...</p>
          </div>
        </section>
      </DashboardLayout>
    );
  }

  if (errorMessage) {
    return (
      <DashboardLayout>
        <section className="w-full">
          <div className="rounded-3xl bg-red-100 p-6 text-red-800">
            <h1 className="text-xl font-bold">Dashboard error</h1>
            <p className="mt-2">{errorMessage}</p>

            <Link
              href="/dashboard/profile"
              className="mt-4 inline-block rounded-xl bg-gray-950 px-5 py-3 font-semibold text-white"
            >
              Go to Profile
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

  const activePackagesCount = packages.filter(
    (packageItem) => packageItem.is_active
  ).length;

  const newRequestsCount = requests.filter(
    (request) => request.status === "new"
  ).length;

  const publicPageUrl = `/trainer/${profile.username}`;
  const publicLink = `${window.location.origin}${publicPageUrl}`;

  return (
    <DashboardLayout publicPageUrl={publicPageUrl}>
      <section className="w-full">
        <div className="rounded-3xl bg-gray-950 p-6 text-white">
          <p className="text-sm font-semibold text-gray-300">
            FitLink Dashboard
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Welcome back, {profile.full_name}
          </h1>

          <p className="mt-2 max-w-2xl text-gray-300">
            Manage your public trainer profile, packages, and client requests
            from one simple place.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <p className="text-sm font-semibold text-gray-500">Profile</p>
            <h2 className="mt-2 text-2xl font-bold">Saved</h2>
            <p className="mt-2 text-sm text-gray-600">
              Your public profile is ready to share.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <p className="text-sm font-semibold text-gray-500">Packages</p>
            <h2 className="mt-2 text-2xl font-bold">
              {activePackagesCount} Active
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Clients can choose from your visible coaching packages.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <p className="text-sm font-semibold text-gray-500">
              Client Requests
            </p>
            <h2 className="mt-2 text-2xl font-bold">{newRequestsCount} New</h2>
            <p className="mt-2 text-sm text-gray-600">
              New client requests from your public page.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="text-xl font-bold">Your public FitLink</h2>

          <p className="mt-2 text-gray-600">
            Share this link in your Instagram bio, WhatsApp, TikTok, or anywhere
            clients can find you.
          </p>

          <div className="mt-4 flex flex-col gap-3 rounded-xl border border-gray-200 p-4 md:flex-row md:items-center md:justify-between">
            <p className="break-all font-medium text-gray-700">{publicLink}</p>
            <CopyLinkButton link={publicLink} />
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Link
            href="/dashboard/profile"
            className="rounded-2xl border border-gray-200 bg-white p-5 transition hover:shadow-md"
          >
            <h2 className="text-xl font-bold">Edit Profile</h2>
            <p className="mt-2 text-gray-600">
              Update your picture, name, bio, specialty, and contact details.
            </p>
          </Link>

          <Link
            href="/dashboard/packages"
            className="rounded-2xl border border-gray-200 bg-white p-5 transition hover:shadow-md"
          >
            <h2 className="text-xl font-bold">Manage Packages</h2>
            <p className="mt-2 text-gray-600">
              Add, edit, delete, or hide your coaching packages.
            </p>
          </Link>

          <Link
            href="/dashboard/requests"
            className="rounded-2xl border border-gray-200 bg-white p-5 transition hover:shadow-md"
          >
            <h2 className="text-xl font-bold">Client Requests</h2>
            <p className="mt-2 text-gray-600">
              View people who selected a package and submitted the form.
            </p>
          </Link>

          <Link
            href={publicPageUrl}
            className="rounded-2xl border border-gray-200 bg-white p-5 transition hover:shadow-md"
          >
            <h2 className="text-xl font-bold">Preview Public Page</h2>
            <p className="mt-2 text-gray-600">
              See exactly what clients will see when they open your FitLink.
            </p>
          </Link>
        </div>
      </section>
    </DashboardLayout>
  );
}