"use client";

import { useCallback, useEffect, useState } from "react";
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

  const loadDashboardData = useCallback(async () => {
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
        "Your trainer profile was not found. Please complete your profile.",
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
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadDashboardData();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadDashboardData]);

  if (loading) {
    return (
      <DashboardLayout>
        <section className="w-full">
          <div className="h-32" />
        </section>
      </DashboardLayout>
    );
  }

  if (errorMessage) {
    return (
      <DashboardLayout>
        <section className="w-full">
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-800">
            <p className="text-sm font-medium">Overview error</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-[-0.02em]">
              Something needs attention
            </h1>

            <p className="mt-3 max-w-2xl leading-7">{errorMessage}</p>

            <Link
              href="/dashboard/profile"
              className="mt-5 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
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

  const activePackagesCount = packages.filter(
    (packageItem) => packageItem.is_active,
  ).length;

  const newRequestsCount = requests.filter(
    (request) => request.status === "new",
  ).length;

  const totalRequestsCount = requests.length;
  const publicPageUrl = `/trainer/${profile.username}`;
  const publicLink = `${window.location.origin}${publicPageUrl}`;

  return (
    <DashboardLayout publicPageUrl={publicPageUrl}>
      <section className="w-full">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-base font-medium text-slate-500">Overview</p>

            <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-slate-950 md:text-5xl">
              Welcome back, {profile.full_name}
            </h1>

            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
              Manage your coaching profile, packages, and new client leads from
              one simple workspace.
            </p>
          </div>

          <Link
            href={publicPageUrl}
            className="inline-flex w-fit rounded-full bg-blue-600 px-5 py-3 text-base font-medium text-white transition hover:bg-blue-700"
          >
            View Profile
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <p className="text-base font-medium text-slate-500">Profile</p>

            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-950">
              Live
            </h2>

            <p className="mt-3 leading-7 text-slate-600">
              Your public coaching profile is ready to share.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <p className="text-base font-medium text-slate-500">Packages</p>

            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-950">
              {activePackagesCount} Active
            </h2>

            <p className="mt-3 leading-7 text-slate-600">
              Visible packages clients can choose from.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <p className="text-base font-medium text-slate-500">Leads</p>

            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-950">
              {newRequestsCount} New
            </h2>

            <p className="mt-3 leading-7 text-slate-600">
              {totalRequestsCount} total client inquiries received.
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-base font-medium text-slate-500">
                Your FitLink
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                Share your profile with clients
              </h2>

              <p className="mt-3 max-w-2xl leading-7 text-slate-600">
                Add this link to Instagram, WhatsApp, TikTok, or anywhere
                clients discover your coaching.
              </p>
            </div>

            <CopyLinkButton link={publicLink} />
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-[oklch(98.4%_0.003_247.858)] px-4 py-4">
            <p className="break-all text-base font-medium text-slate-700">
              {publicLink}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Link
            href="/dashboard/profile"
            className="group rounded-3xl border border-slate-200 bg-white p-6 transition hover:border-blue-200 hover:bg-blue-50"
          >
            <p className="text-base font-medium text-slate-500">Profile</p>

            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              Edit your coaching page
            </h2>

            <p className="mt-3 leading-7 text-slate-600">
              Update your photo, bio, specialty, and contact details.
            </p>

            <p className="mt-5 text-base font-medium text-blue-600">
              Edit Profile →
            </p>
          </Link>

          <Link
            href="/dashboard/packages"
            className="group rounded-3xl border border-slate-200 bg-white p-6 transition hover:border-blue-200 hover:bg-blue-50"
          >
            <p className="text-base font-medium text-slate-500">Packages</p>

            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              Manage your offers
            </h2>

            <p className="mt-3 leading-7 text-slate-600">
              Add, edit, hide, or remove your coaching packages.
            </p>

            <p className="mt-5 text-base font-medium text-blue-600">
              Manage Packages →
            </p>
          </Link>

          <Link
            href="/dashboard/requests"
            className="group rounded-3xl border border-slate-200 bg-white p-6 transition hover:border-blue-200 hover:bg-blue-50"
          >
            <p className="text-base font-medium text-slate-500">Leads</p>

            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              Review client inquiries
            </h2>

            <p className="mt-3 leading-7 text-slate-600">
              See who selected a package and submitted your form.
            </p>

            <p className="mt-5 text-base font-medium text-blue-600">
              Open Leads →
            </p>
          </Link>

          <Link
            href={publicPageUrl}
            className="group rounded-3xl border border-slate-200 bg-white p-6 transition hover:border-blue-200 hover:bg-blue-50"
          >
            <p className="text-base font-medium text-slate-500">
              Public profile
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              Preview your client view
            </h2>

            <p className="mt-3 leading-7 text-slate-600">
              See what clients see when they open your FitLink.
            </p>

            <p className="mt-5 text-base font-medium text-blue-600">
              View Profile →
            </p>
          </Link>
        </div>
      </section>
    </DashboardLayout>
  );
}