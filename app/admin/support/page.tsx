"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminLayout from "@/components/AdminLayout";
import { supabase } from "@/lib/supabaseClient";

const adminEmail = "adaala191@gmail.com";

type SupportStatus = "new" | "reviewing" | "resolved";

type SupportMessage = {
  id: string;
  trainer_id: string;
  trainer_name: string | null;
  trainer_email: string | null;
  trainer_username: string | null;
  subject: string;
  message: string;
  status: SupportStatus;
  created_at: string;
};

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getStatusClass(status: SupportStatus) {
  if (status === "resolved") {
    return "bg-green-100 text-green-800";
  }

  if (status === "reviewing") {
    return "bg-blue-100 text-blue-800";
  }

  return "bg-amber-100 text-amber-800";
}

function getCardBorderClass(status: SupportStatus) {
  if (status === "resolved") {
    return "border-green-200";
  }

  if (status === "reviewing") {
    return "border-blue-200";
  }

  return "border-amber-200";
}

export default function AdminSupportPage() {
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [accountEmail, setAccountEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  useEffect(() => {
    async function loadSupportMessages() {
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

      setAccountEmail(user.email || "");

      if (user.email !== adminEmail) {
        setErrorMessage("You do not have access to this admin page.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("support_messages")
        .select(
          "id, trainer_id, trainer_name, trainer_email, trainer_username, subject, message, status, created_at"
        )
        .order("created_at", { ascending: false });

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      setSupportMessages((data || []) as SupportMessage[]);
      setLoading(false);
    }

    loadSupportMessages();
  }, []);

  async function updateStatus(messageId: string, newStatus: SupportStatus) {
    setUpdatingId(messageId);
    setStatusMessage("");
    setErrorMessage("");

    const { error } = await supabase
      .from("support_messages")
      .update({
        status: newStatus,
      })
      .eq("id", messageId);

    if (error) {
      setUpdatingId("");
      setErrorMessage(error.message);
      return;
    }

    setSupportMessages((currentMessages) =>
      currentMessages.map((message) =>
        message.id === messageId
          ? {
              ...message,
              status: newStatus,
            }
          : message
      )
    );

    setUpdatingId("");
    setStatusMessage("Support message updated.");
  }

  if (loading) {
    return (
      <AdminLayout>
        <section className="w-full">
          <div className="rounded-3xl border border-gray-200 bg-white p-6">
            <p className="font-semibold">Loading admin support...</p>
          </div>
        </section>
      </AdminLayout>
    );
  }

  if (accountEmail !== adminEmail) {
    return (
      <AdminLayout>
        <section className="w-full">
          <div className="rounded-3xl bg-red-100 p-6 text-red-800">
            <h1 className="text-xl font-bold">Access denied</h1>

            <p className="mt-2">
              {errorMessage || "You do not have access to this admin page."}
            </p>

            <Link
              href="/dashboard"
              className="mt-4 inline-block rounded-xl bg-gray-950 px-5 py-3 font-semibold text-white"
            >
              Back to Dashboard
            </Link>
          </div>
        </section>
      </AdminLayout>
    );
  }

  const newCount = supportMessages.filter(
    (message) => message.status === "new"
  ).length;

  const reviewingCount = supportMessages.filter(
    (message) => message.status === "reviewing"
  ).length;

  const resolvedCount = supportMessages.filter(
    (message) => message.status === "resolved"
  ).length;

  return (
    <AdminLayout>
      <section className="w-full">
        <div className="rounded-3xl bg-gray-950 p-6 text-white">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-300">
                FitLink Admin
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight">
                Support Inbox
              </h1>

              <p className="mt-2 max-w-2xl text-gray-300">
                View trainer support messages and update their review status.
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 px-5 py-4">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">
                Admin email
              </p>
              <p className="mt-1 break-all font-bold text-white">
                {accountEmail}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4">
              <p className="text-sm font-bold text-amber-100">New</p>
              <p className="mt-1 text-3xl font-black text-amber-300">
                {newCount}
              </p>
            </div>

            <div className="rounded-2xl border border-blue-400/20 bg-blue-400/10 p-4">
              <p className="text-sm font-bold text-blue-100">Reviewing</p>
              <p className="mt-1 text-3xl font-black text-blue-300">
                {reviewingCount}
              </p>
            </div>

            <div className="rounded-2xl border border-green-400/20 bg-green-400/10 p-4">
              <p className="text-sm font-bold text-green-100">Resolved</p>
              <p className="mt-1 text-3xl font-black text-green-300">
                {resolvedCount}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-5 md:p-6">
          <div className="flex flex-col gap-3 border-b border-gray-200 pb-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-black">Support Messages</h2>

              <p className="mt-1 text-gray-600">
                {supportMessages.length} message
                {supportMessages.length === 1 ? "" : "s"} found.
              </p>
            </div>

            {statusMessage && (
              <p className="rounded-xl bg-green-100 px-4 py-3 text-sm font-medium text-green-800">
                {statusMessage}
              </p>
            )}
          </div>

          {errorMessage && (
            <p className="mt-5 rounded-xl bg-red-100 px-4 py-3 text-sm font-medium text-red-800">
              {errorMessage}
            </p>
          )}

          {supportMessages.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-gray-300 p-8 text-center">
              <h3 className="text-xl font-bold">No support messages yet</h3>

              <p className="mt-2 text-gray-600">
                New trainer support messages will appear here.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-4">
              {supportMessages.map((message) => {
                const isUpdating = updatingId === message.id;

                return (
                  <article
                    key={message.id}
                    className={`rounded-3xl border bg-white p-5 shadow-sm ${getCardBorderClass(
                      message.status
                    )}`}
                  >
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-black uppercase ${getStatusClass(
                              message.status
                            )}`}
                          >
                            {message.status}
                          </span>

                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">
                            {formatDate(message.created_at)}
                          </span>
                        </div>

                        <h3 className="mt-4 text-2xl font-black tracking-tight">
                          {message.subject}
                        </h3>

                        <p className="mt-3 whitespace-pre-wrap leading-7 text-gray-700">
                          {message.message}
                        </p>
                      </div>

                      <aside className="rounded-2xl bg-gray-50 p-4 xl:w-[300px]">
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
                          Sender
                        </p>

                        <p className="mt-2 font-black">
                          {message.trainer_name || "Unknown trainer"}
                        </p>

                        <p className="mt-1 text-sm text-gray-600">
                          @{message.trainer_username || "no-username"}
                        </p>

                        <p className="mt-1 break-all text-sm text-gray-600">
                          {message.trainer_email || "No email provided"}
                        </p>

                        {message.trainer_username && (
                          <Link
                            href={`/trainer/${message.trainer_username}`}
                            className="mt-4 inline-block rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-800 transition hover:bg-gray-50"
                          >
                            View Trainer Page
                          </Link>
                        )}
                      </aside>
                    </div>

                    <div className="mt-5 flex flex-col gap-2 border-t border-gray-200 pt-5 sm:flex-row sm:flex-wrap">
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => updateStatus(message.id, "new")}
                        className="rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm font-bold text-amber-700 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Mark New
                      </button>

                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => updateStatus(message.id, "reviewing")}
                        className="rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Mark Reviewing
                      </button>

                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => updateStatus(message.id, "resolved")}
                        className="rounded-xl border border-green-200 bg-white px-4 py-3 text-sm font-bold text-green-700 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Mark Resolved
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </AdminLayout>
  );
}