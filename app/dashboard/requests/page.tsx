"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/lib/supabaseClient";

type TrainerProfile = {
  id: string;
  username: string;
};

type RequestStatus = "new" | "contacted" | "closed";

type PackageSummary = {
  id: string;
  title: string;
  price: string;
  duration: string;
};

type ClientRequestRow = {
  id: string;
  trainer_id: string;
  package_id: string | null;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  fitness_goal: string;
  message: string | null;
  status: RequestStatus;
  created_at: string;
};

type ClientRequest = ClientRequestRow & {
  package: PackageSummary | null;
};

function getStatusBadgeClass(status: RequestStatus) {
  if (status === "new") {
    return "bg-blue-50 text-blue-700";
  }

  if (status === "contacted") {
    return "bg-amber-50 text-amber-700";
  }

  return "bg-green-50 text-green-700";
}

function getRequestCardClass(status: RequestStatus) {
  if (status === "new") {
    return "border-blue-200 bg-white";
  }

  if (status === "contacted") {
    return "border-amber-200 bg-white";
  }

  return "border-slate-200 bg-white";
}

function formatStatus(status: RequestStatus) {
  if (status === "new") {
    return "New";
  }

  if (status === "contacted") {
    return "Contacted";
  }

  return "Closed";
}

export default function ClientRequestsPage() {
  const [profile, setProfile] = useState<TrainerProfile | null>(null);
  const [requests, setRequests] = useState<ClientRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const loadRequestsPage = useCallback(async () => {
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

    const { data: requestsData, error: requestsError } = await supabase
      .from("client_requests")
      .select(
        `
        id,
        trainer_id,
        package_id,
        client_name,
        client_email,
        client_phone,
        fitness_goal,
        message,
        status,
        created_at
      `,
      )
      .eq("trainer_id", profileData.id)
      .order("created_at", { ascending: false });

    if (requestsError) {
      setErrorMessage(requestsError.message);
      setLoading(false);
      return;
    }

    const requestRows = (requestsData || []) as ClientRequestRow[];

    const packageIds = Array.from(
      new Set(
        requestRows
          .map((request) => request.package_id)
          .filter((packageId): packageId is string => Boolean(packageId)),
      ),
    );

    let packagesData: PackageSummary[] = [];

    if (packageIds.length > 0) {
      const { data: packageRows, error: packagesError } = await supabase
        .from("packages")
        .select("id, title, price, duration")
        .in("id", packageIds);

      if (packagesError) {
        setErrorMessage(packagesError.message);
        setLoading(false);
        return;
      }

      packagesData = (packageRows || []) as PackageSummary[];
    }

    const requestsWithPackages: ClientRequest[] = requestRows.map((request) => {
      const selectedPackage =
        packagesData.find((pkg) => pkg.id === request.package_id) || null;

      return {
        ...request,
        package: selectedPackage,
      };
    });

    setProfile(profileData as TrainerProfile);
    setRequests(requestsWithPackages);
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadRequestsPage();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadRequestsPage]);

  async function handleStatusChange(
    requestId: string,
    newStatus: RequestStatus,
  ) {
    setStatusMessage("Updating lead...");
    setErrorMessage("");

    const { error } = await supabase
      .from("client_requests")
      .update({
        status: newStatus,
      })
      .eq("id", requestId);

    if (error) {
      setStatusMessage("");
      setErrorMessage(error.message);
      return;
    }

    setRequests((currentRequests) =>
      currentRequests.map((request) =>
        request.id === requestId
          ? {
              ...request,
              status: newStatus,
            }
          : request,
      ),
    );

    setStatusMessage("Lead updated.");
  }

  async function handleDelete(requestId: string) {
    setStatusMessage("Deleting lead...");
    setErrorMessage("");

    const { error } = await supabase
      .from("client_requests")
      .delete()
      .eq("id", requestId);

    if (error) {
      setStatusMessage("");
      setErrorMessage(error.message);
      return;
    }

    setRequests((currentRequests) =>
      currentRequests.filter((request) => request.id !== requestId),
    );

    setStatusMessage("Lead deleted.");
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
            <p className="text-sm font-medium">Leads error</p>

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

  const newRequestsCount = requests.filter(
    (request) => request.status === "new",
  ).length;

  const contactedRequestsCount = requests.filter(
    (request) => request.status === "contacted",
  ).length;

  const closedRequestsCount = requests.filter(
    (request) => request.status === "closed",
  ).length;

  return (
    <DashboardLayout publicPageUrl={publicPageUrl}>
      <section className="w-full">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-base font-medium text-slate-500">Leads</p>

            <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-slate-950 md:text-5xl">
              Manage client inquiries
            </h1>

            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
              Review new leads from your profile and keep track of who you have
              contacted.
            </p>
          </div>

          <Link
            href={publicPageUrl}
            className="inline-flex w-fit rounded-full border border-slate-300 bg-white px-5 py-3 text-base font-medium text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
          >
            View Profile
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <p className="text-base font-medium text-slate-500">Total</p>

            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em]">
              {requests.length}
            </h2>

            <p className="mt-3 leading-7 text-slate-600">
              Client inquiries received.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <p className="text-base font-medium text-slate-500">New</p>

            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-blue-700">
              {newRequestsCount}
            </h2>

            <p className="mt-3 leading-7 text-slate-600">
              Waiting for your first reply.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <p className="text-base font-medium text-slate-500">Contacted</p>

            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-amber-700">
              {contactedRequestsCount}
            </h2>

            <p className="mt-3 leading-7 text-slate-600">
              You already followed up.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <p className="text-base font-medium text-slate-500">Closed</p>

            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-green-700">
              {closedRequestsCount}
            </h2>

            <p className="mt-3 leading-7 text-slate-600">
              Finished or no longer active.
            </p>
          </div>
        </div>

        {statusMessage && (
          <p
            className={`mt-6 rounded-2xl px-4 py-3 text-base font-medium ${
              statusMessage.toLowerCase().includes("delet")
                ? "bg-red-50 text-red-800"
                : statusMessage.toLowerCase().includes("updating")
                  ? "bg-blue-50 text-blue-800"
                  : "bg-green-50 text-green-800"
            }`}
          >
            {statusMessage}
          </p>
        )}

        {errorMessage && (
          <p className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-base font-medium text-red-800">
            {errorMessage}
          </p>
        )}

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-6">
            <div>
              <p className="text-base font-medium text-slate-500">
                Lead inbox
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
                All leads
              </h2>
            </div>

            <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
              {requests.length} Total
            </span>
          </div>

          <div className="mt-6 grid gap-4">
            {requests.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 p-8 text-center">
                <h2 className="text-xl font-semibold tracking-[-0.02em]">
                  No leads yet
                </h2>

                <p className="mt-2 leading-7 text-slate-600">
                  When clients submit your FitLink form, their inquiries will
                  appear here.
                </p>

                <Link
                  href={publicPageUrl}
                  className="mt-5 inline-flex rounded-full bg-blue-600 px-5 py-3 text-base font-medium text-white transition hover:bg-blue-700"
                >
                  View Profile
                </Link>
              </div>
            ) : (
              requests.map((request) => (
                <div
                  key={request.id}
                  className={`rounded-3xl border p-5 transition ${getRequestCardClass(
                    request.status,
                  )}`}
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                          {request.client_name}
                        </h3>

                        <span
                          className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusBadgeClass(
                            request.status,
                          )}`}
                        >
                          {formatStatus(request.status)}
                        </span>
                      </div>

                      <p className="mt-2 text-base text-slate-500">
                        {new Date(request.created_at).toLocaleString()}
                      </p>
                    </div>

                    <select
                      value={request.status}
                      onChange={(event) =>
                        handleStatusChange(
                          request.id,
                          event.target.value as RequestStatus,
                        )
                      }
                      className="rounded-full border border-slate-300 bg-white px-4 py-2.5 text-base font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-[oklch(98.4%_0.003_247.858)] p-4">
                      <p className="text-sm font-medium text-slate-500">
                        Selected package
                      </p>

                      {request.package ? (
                        <div className="mt-2">
                          <p className="text-base font-semibold text-slate-950">
                            {request.package.title}
                          </p>

                          <p className="mt-1 text-base text-slate-600">
                            {request.package.duration} · {request.package.price}
                          </p>
                        </div>
                      ) : (
                        <p className="mt-2 text-base font-medium text-slate-500">
                          Package not found
                        </p>
                      )}
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-[oklch(98.4%_0.003_247.858)] p-4">
                      <p className="text-sm font-medium text-slate-500">
                        Fitness goal
                      </p>

                      <p className="mt-2 text-base font-semibold text-slate-950">
                        {request.fitness_goal}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-[oklch(98.4%_0.003_247.858)] p-4">
                      <p className="text-sm font-medium text-slate-500">
                        Email
                      </p>

                      <a
                        href={`mailto:${request.client_email}`}
                        className="mt-2 block break-all text-base font-semibold text-slate-950 underline-offset-4 hover:underline"
                      >
                        {request.client_email}
                      </a>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-[oklch(98.4%_0.003_247.858)] p-4">
                      <p className="text-sm font-medium text-slate-500">
                        Phone
                      </p>

                      {request.client_phone ? (
                        <a
                          href={`tel:${request.client_phone}`}
                          className="mt-2 block text-base font-semibold text-slate-950 underline-offset-4 hover:underline"
                        >
                          {request.client_phone}
                        </a>
                      ) : (
                        <p className="mt-2 text-base font-medium text-slate-500">
                          Not provided
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-slate-200 bg-[oklch(98.4%_0.003_247.858)] p-4">
                    <p className="text-sm font-medium text-slate-500">
                      Message
                    </p>

                    <p className="mt-2 leading-7 text-slate-700">
                      {request.message || "No message provided."}
                    </p>
                  </div>

                  <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                    <a
                      href={`mailto:${request.client_email}`}
                      className="rounded-full bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white transition hover:bg-blue-700"
                    >
                      Email Client
                    </a>

                    {request.client_phone && (
                      <a
                        href={`tel:${request.client_phone}`}
                        className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-center text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                      >
                        Call Client
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDelete(request.id)}
                      className="rounded-full border border-red-200 bg-white px-5 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-50"
                    >
                      Delete Lead
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}