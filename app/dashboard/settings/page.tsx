"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CopyLinkButton from "@/components/CopyLinkButton";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/lib/supabaseClient";

const adminEmail = "adaala191@gmail.com";

type TrainerProfile = {
  id: string;
  username: string;
  full_name: string;
  contact_email: string;
};

export default function SettingsPage() {
  const [profile, setProfile] = useState<TrainerProfile | null>(null);
  const [accountEmail, setAccountEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [supportSubject, setSupportSubject] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [supportStatus, setSupportStatus] = useState("");
  const [supportError, setSupportError] = useState("");
  const [submittingSupport, setSubmittingSupport] = useState(false);

  useEffect(() => {
    async function loadSettings() {
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

      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, full_name, contact_email")
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
    }

    loadSettings();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  async function handleSupportSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!profile) {
      return;
    }

    setSubmittingSupport(true);
    setSupportStatus("");
    setSupportError("");

    const senderName = profile.full_name || "Unknown trainer";
    const senderEmail =
      profile.contact_email || accountEmail || "No email provided";
    const senderUsername = profile.username || "no-username";

    const { error } = await supabase.from("support_messages").insert({
      trainer_id: profile.id,
      trainer_name: senderName,
      trainer_email: senderEmail,
      trainer_username: senderUsername,
      subject: supportSubject.trim(),
      message: supportMessage.trim(),
      status: "new",
    });

    if (error) {
      setSupportError(error.message);
      setSubmittingSupport(false);
      return;
    }

    setSupportSubject("");
    setSupportMessage("");
    setSupportStatus("Support message sent. We will review it soon.");
    setSubmittingSupport(false);
  }

  if (loading) {
    return (
      <DashboardLayout>
        <section className="w-full">
          <div className="rounded-3xl border border-gray-200 bg-white p-6">
            <p className="font-semibold">Loading settings...</p>
          </div>
        </section>
      </DashboardLayout>
    );
  }

  if (errorMessage || !profile) {
    return (
      <DashboardLayout>
        <section className="w-full">
          <div className="rounded-3xl bg-red-100 p-6 text-red-800">
            <h1 className="text-xl font-bold">Settings error</h1>
            <p className="mt-2">{errorMessage || "Profile not found."}</p>

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

  const publicPageUrl = `/trainer/${profile.username}`;
  const publicLink = `${window.location.origin}${publicPageUrl}`;
  const isAdmin = accountEmail === adminEmail;

  return (
    <DashboardLayout publicPageUrl={publicPageUrl}>
      <section className="w-full">
        <div className="rounded-3xl bg-gray-950 p-6 text-white">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-300">
                Account Settings
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight">
                Settings
              </h1>

              <p className="mt-2 max-w-2xl text-gray-300">
                Manage your public page, account details, support requests, and
                session.
              </p>
            </div>

            <Link
              href={publicPageUrl}
              className="rounded-2xl bg-white px-5 py-3 text-center font-bold text-gray-950 transition hover:bg-gray-100"
            >
              View Public Page
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <div className="rounded-3xl border border-gray-200 bg-white p-6">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-600">
              Public page
            </p>

            <h2 className="mt-2 text-2xl font-black">Your FitLink URL</h2>

            <p className="mt-2 text-gray-600">
              Share this link in your Instagram bio, TikTok, WhatsApp, or
              anywhere clients find you.
            </p>

            <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <p className="break-all font-semibold text-gray-800">
                {publicLink}
              </p>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <CopyLinkButton link={publicLink} />

                <Link
                  href={publicPageUrl}
                  className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-center font-semibold text-gray-800 transition hover:bg-gray-50"
                >
                  Open Public Page
                </Link>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-green-600">
              Account
            </p>

            <h2 className="mt-2 text-2xl font-black">Account details</h2>

            <div className="mt-5 grid gap-4">
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-500">
                  Trainer name
                </p>
                <p className="mt-1 font-bold">{profile.full_name}</p>
              </div>

              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-500">
                  Login email
                </p>
                <p className="mt-1 break-all font-bold">{accountEmail}</p>
              </div>

              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-500">
                  Contact email
                </p>
                <p className="mt-1 break-all font-bold">
                  {profile.contact_email || "Not added yet"}
                </p>
              </div>
            </div>

            {isAdmin && (
              <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-700">
                  Admin access
                </p>

                <h3 className="mt-2 text-xl font-black text-gray-950">
                  Support inbox
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Review support messages sent by trainers from their dashboard.
                </p>

                <Link
                  href="/admin/support"
                  className="mt-4 inline-block rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                >
                  Open Admin Support
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-600">
                Support
              </p>

              <h2 className="mt-2 text-2xl font-black">
                Contact FitLink Support
              </h2>

              <p className="mt-2 max-w-2xl text-gray-600">
                Send a message if you need help with your profile, packages,
                requests, or public page.
              </p>
            </div>

            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
              Admin review
            </span>
          </div>

          <form onSubmit={handleSupportSubmit} className="mt-6 grid gap-4">
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Subject
              </label>

              <input
                value={supportSubject}
                onChange={(event) => {
                  setSupportSubject(event.target.value);
                  setSupportStatus("");
                  setSupportError("");
                }}
                type="text"
                required
                placeholder="Example: I need help with my public page"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Message
              </label>

              <textarea
                value={supportMessage}
                onChange={(event) => {
                  setSupportMessage(event.target.value);
                  setSupportStatus("");
                  setSupportError("");
                }}
                rows={5}
                required
                placeholder="Explain what you need help with..."
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-600"
              />
            </div>

            <button
              disabled={submittingSupport}
              className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submittingSupport ? "Sending..." : "Send Support Message"}
            </button>

            {supportStatus && (
              <p className="rounded-xl bg-green-100 px-4 py-3 text-sm font-medium text-green-800">
                {supportStatus}
              </p>
            )}

            {supportError && (
              <p className="rounded-xl bg-red-100 px-4 py-3 text-sm font-medium text-red-800">
                {supportError}
              </p>
            )}
          </form>
        </div>

        <div className="mt-6 rounded-3xl border border-red-100 bg-white p-6">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-red-600">
            Session
          </p>

          <h2 className="mt-2 text-2xl font-black">Log out</h2>

          <p className="mt-2 max-w-2xl text-gray-600">
            Log out of your FitLink dashboard on this device.
          </p>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-5 rounded-xl border border-red-200 px-5 py-3 font-semibold text-red-700 transition hover:bg-red-50"
          >
            Log Out
          </button>
        </div>
      </section>
    </DashboardLayout>
  );
}
