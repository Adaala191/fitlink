"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/lib/supabaseClient";

type TrainerProfile = {
  id: string;
  username: string;
};

type ClientRequest = {
  id: string;
  trainer_id: string;
  package_id: string | null;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  fitness_goal: string;
  message: string | null;
  status: "new" | "contacted" | "closed";
  created_at: string;
  packages?: {
    title: string;
  }[];
};

function getStatusBadgeClass(status: ClientRequest["status"]) {
  if (status === "new") {
    return "bg-blue-100 text-blue-800";
  }

  if (status === "contacted") {
    return "bg-amber-100 text-amber-800";
  }

  return "bg-green-100 text-green-800";
}

function getRequestCardClass(status: ClientRequest["status"]) {
  if (status === "new") {
    return "border-blue-200 bg-blue-50";
  }

  if (status === "contacted") {
    return "border-amber-200 bg-amber-50";
  }

  return "border-green-200 bg-green-50";
}

function formatStatus(status: ClientRequest["status"]) {
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

  useEffect(() => {
    async function loadRequestsPage() {
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
          created_at,
          packages (
            title
          )
        `
        )
        .eq("trainer_id", user.id)
        .order("created_at", { ascending: false });

      if (requestsError) {
        setErrorMessage(requestsError.message);
        setLoading(false);
        return;
      }

      setProfile(profileData as TrainerProfile);
      setRequests((requestsData || []) as ClientRequest[]);
      setLoading(false);
    }

    loadRequestsPage();
  }, []);

  async function handleStatusChange(
    requestId: string,
    newStatus: ClientRequest["status"]
  ) {
    setStatusMessage("Updating request...");
    setErrorMessage("");

    const { data, error } = await supabase
      .from("client_requests")
      .update({
        status: newStatus,
      })
      .eq("id", requestId)
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
        created_at,
        packages (
          title
        )
      `
      )
      .single();

    if (error) {
      setStatusMessage("");
      setErrorMessage(error.message);
      return;
    }

    setRequests((currentRequests) =>
      currentRequests.map((request) =>
        request.id === requestId ? (data as ClientRequest) : request
      )
    );

    setStatusMessage("Request updated.");
  }

  async function handleDelete(requestId: string) {
    setStatusMessage("Deleting request...");
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
      currentRequests.filter((request) => request.id !== requestId)
    );

    setStatusMessage("Request deleted.");
  }

  if (loading) {
    return (
      <DashboardLayout>
        <section className="w-full">
          <div className="rounded-3xl border border-gray-200 bg-white p-6">
            <p className="font-semibold">Loading requests...</p>
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
            <h1 className="text-xl font-bold">Requests error</h1>
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

  const newRequestsCount = requests.filter(
    (request) => request.status === "new"
  ).length;

  const contactedRequestsCount = requests.filter(
    (request) => request.status === "contacted"
  ).length;

  const closedRequestsCount = requests.filter(
    (request) => request.status === "closed"
  ).length;

  return (
    <DashboardLayout publicPageUrl={publicPageUrl}>
      <section className="w-full">
        <div className="rounded-3xl bg-gray-950 p-6 text-white">
          <p className="text-sm font-semibold text-gray-300">
            Client Requests
          </p>

          <h1 className="mt-1 text-3xl font-bold">Manage Requests</h1>

          <p className="mt-2 max-w-2xl text-gray-300">
            View leads from your public FitLink page and track who you already
            contacted.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <span className="rounded-full bg-blue-400/15 px-4 py-2 text-sm font-bold text-blue-200">
              {newRequestsCount} New
            </span>

            <span className="rounded-full bg-amber-400/15 px-4 py-2 text-sm font-bold text-amber-200">
              {contactedRequestsCount} Contacted
            </span>

            <span className="rounded-full bg-green-400/15 px-4 py-2 text-sm font-bold text-green-200">
              {closedRequestsCount} Closed
            </span>
          </div>
        </div>

        {statusMessage && (
          <p
            className={`mt-6 rounded-xl px-4 py-3 text-sm font-medium ${
              statusMessage.toLowerCase().includes("delet")
                ? "bg-red-100 text-red-800"
                : statusMessage.toLowerCase().includes("updating")
                ? "bg-blue-100 text-blue-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {statusMessage}
          </p>
        )}

        {errorMessage && (
          <p className="mt-6 rounded-xl bg-red-100 px-4 py-3 text-sm font-medium text-red-800">
            {errorMessage}
          </p>
        )}

        <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-gray-500">Request inbox</p>
              <h2 className="mt-1 text-2xl font-bold">All Requests</h2>
            </div>

            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700">
              {requests.length} Total
            </span>
          </div>

          <div className="mt-5 grid gap-4">
            {requests.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center">
                <h2 className="text-xl font-bold">No requests yet</h2>

                <p className="mt-2 text-gray-600">
                  When clients submit your public FitLink form, their requests
                  will appear here.
                </p>

                <Link
                  href={publicPageUrl}
                  className="mt-5 inline-block rounded-xl bg-gray-950 px-5 py-3 font-semibold text-white transition hover:bg-gray-800"
                >
                  Open Public Page
                </Link>
              </div>
            ) : (
              requests.map((request) => (
                <div
                  key={request.id}
                  className={`rounded-2xl border p-5 transition ${getRequestCardClass(
                    request.status
                  )}`}
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xl font-bold">
                          {request.client_name}
                        </h3>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusBadgeClass(
                            request.status
                          )}`}
                        >
                          {formatStatus(request.status)}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-gray-500">
                        {new Date(request.created_at).toLocaleString()}
                      </p>
                    </div>

                    <select
                      value={request.status}
                      onChange={(event) =>
                        handleStatusChange(
                          request.id,
                          event.target.value as ClientRequest["status"]
                        )
                      }
                      className={`rounded-xl border px-4 py-3 text-sm font-semibold outline-none ${
                        request.status === "new"
                          ? "border-blue-300 bg-white text-blue-800 focus:border-blue-700"
                          : request.status === "contacted"
                          ? "border-amber-300 bg-white text-amber-800 focus:border-amber-700"
                          : "border-green-300 bg-white text-green-800 focus:border-green-700"
                      }`}
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl bg-white/80 p-4">
                      <p className="text-sm font-semibold text-gray-500">
                        Selected Package
                      </p>

                      <p className="mt-1 font-bold">
                        {request.packages?.[0]?.title || "Package not found"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-white/80 p-4">
                      <p className="text-sm font-semibold text-gray-500">
                        Fitness Goal
                      </p>

                      <p className="mt-1 font-bold">{request.fitness_goal}</p>
                    </div>

                    <div className="rounded-xl bg-white/80 p-4">
                      <p className="text-sm font-semibold text-gray-500">
                        Email
                      </p>

                      <a
                        href={`mailto:${request.client_email}`}
                        className="mt-1 block break-all font-bold text-gray-950 underline-offset-4 hover:underline"
                      >
                        {request.client_email}
                      </a>
                    </div>

                    <div className="rounded-xl bg-white/80 p-4">
                      <p className="text-sm font-semibold text-gray-500">
                        Phone
                      </p>

                      {request.client_phone ? (
                        <a
                          href={`tel:${request.client_phone}`}
                          className="mt-1 block font-bold text-gray-950 underline-offset-4 hover:underline"
                        >
                          {request.client_phone}
                        </a>
                      ) : (
                        <p className="mt-1 font-bold">Not provided</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl bg-white/80 p-4">
                    <p className="text-sm font-semibold text-gray-500">
                      Message
                    </p>

                    <p className="mt-1 leading-6 text-gray-700">
                      {request.message || "No message provided."}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <a
                      href={`mailto:${request.client_email}`}
                      className="rounded-xl bg-gray-950 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-gray-800"
                    >
                      Email Client
                    </a>

                    {request.client_phone && (
                      <a
                        href={`tel:${request.client_phone}`}
                        className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-center text-sm font-semibold transition hover:bg-gray-50"
                      >
                        Call Client
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDelete(request.id)}
                      className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                    >
                      Delete Request
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