"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import ProtectedPage from "@/components/ProtectedPage";

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

      setProfile(profileData);
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

  const newRequestsCount = requests.filter(
    (request) => request.status === "new"
  ).length;

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 px-4 py-6 text-gray-950">
        <section className="mx-auto max-w-5xl">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="font-semibold">Loading requests...</p>
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
                Client Requests
              </p>

              <h1 className="mt-1 text-3xl font-bold">Manage Requests</h1>

              <p className="mt-2 text-gray-600">
                View leads from your public FitLink page and track who you
                already contacted.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="rounded-2xl bg-gray-950 px-5 py-4 text-white">
                <p className="text-sm text-gray-300">New requests</p>
                <p className="mt-1 text-3xl font-bold">{newRequestsCount}</p>
              </div>

              <Link
                href={`/trainer/${profile.username}`}
                className="rounded-xl border border-gray-300 px-4 py-3 text-center text-sm font-semibold transition hover:bg-gray-50"
              >
                Open Public Page
              </Link>
            </div>
          </div>

          {statusMessage && (
            <p className="mt-6 rounded-xl bg-green-100 px-4 py-3 text-sm font-medium text-green-800">
              {statusMessage}
            </p>
          )}

          {errorMessage && (
            <p className="mt-6 rounded-xl bg-red-100 px-4 py-3 text-sm font-medium text-red-800">
              {errorMessage}
            </p>
          )}

          <div className="mt-8 grid gap-4">
            {requests.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center">
                <h2 className="text-xl font-bold">No requests yet</h2>

                <p className="mt-2 text-gray-600">
                  When clients submit your public FitLink form, their requests
                  will appear here.
                </p>

                <Link
                  href={`/trainer/${profile.username}`}
                  className="mt-5 inline-block rounded-xl bg-gray-950 px-5 py-3 font-semibold text-white transition hover:bg-gray-800"
                >
                  Open Public Page
                </Link>
              </div>
            ) : (
              requests.map((request) => (
                <div
                  key={request.id}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-bold">
                          {request.client_name}
                        </h2>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            request.status === "new"
                              ? "bg-green-100 text-green-800"
                              : request.status === "contacted"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {request.status}
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
                      className="rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold outline-none focus:border-gray-950"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl bg-gray-50 p-4">
                      <p className="text-sm font-semibold text-gray-500">
                        Selected Package
                      </p>

                      <p className="mt-1 font-bold">
                        {request.packages?.[0]?.title || "Package not found"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-gray-50 p-4">
                      <p className="text-sm font-semibold text-gray-500">
                        Fitness Goal
                      </p>

                      <p className="mt-1 font-bold">{request.fitness_goal}</p>
                    </div>

                    <div className="rounded-xl bg-gray-50 p-4">
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

                    <div className="rounded-xl bg-gray-50 p-4">
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

                  <div className="mt-4 rounded-xl bg-gray-50 p-4">
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
                        className="rounded-xl border border-gray-300 px-4 py-2 text-center text-sm font-semibold transition hover:bg-gray-50"
                      >
                        Call Client
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDelete(request.id)}
                      className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
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
    </main>
  );
}