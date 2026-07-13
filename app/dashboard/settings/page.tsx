"use client";

import { useCallback, useEffect, useState } from "react";
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

  const loadSettings = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadSettings();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadSettings]);

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
          <div className="h-32" />
        </section>
      </DashboardLayout>
    );
  }

  if (errorMessage || !profile) {
    return (
      <DashboardLayout>
        <section className="w-full">
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-800">
            <p className="text-sm font-medium">Settings error</p>

            <h1 className="mt-2 text-2xl font-semibold tracking-[-0.02em]">
              Something needs attention
            </h1>

            <p className="mt-3 max-w-2xl leading-7">
              {errorMessage || "Profile not found."}
            </p>

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

  const publicPageUrl = `/trainer/${profile.username}`;
  const publicLink = `${window.location.origin}${publicPageUrl}`;
  const isAdmin = accountEmail === adminEmail;

  return (
    <DashboardLayout publicPageUrl={publicPageUrl}>
      <section className="w-full">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-base font-medium text-slate-500">Settings</p>

            <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-slate-950 md:text-5xl">
              Account settings
            </h1>

            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
              Manage your profile link, account details, support messages, and
              session.
            </p>
          </div>

          <Link
            href={publicPageUrl}
            className="inline-flex w-fit rounded-full border border-slate-300 bg-white px-5 py-3 text-base font-medium text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
          >
            View Profile
          </Link>
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_0.9fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <div className="border-b border-slate-200 pb-6">
              <p className="text-base font-medium text-slate-500">
                Profile link
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                Your FitLink URL
              </h2>

              <p className="mt-3 leading-7 text-slate-600">
                Share this link in your Instagram bio, TikTok, WhatsApp, or
                anywhere clients discover your coaching.
              </p>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-[oklch(98.4%_0.003_247.858)] p-4">
              <p className="break-all text-base font-medium text-slate-800">
                {publicLink}
              </p>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <CopyLinkButton link={publicLink} />

              <Link
                href={publicPageUrl}
                className="rounded-full border border-slate-300 bg-white px-5 py-3 text-center text-base font-medium text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
              >
                Open Profile
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <div className="border-b border-slate-200 pb-6">
              <p className="text-base font-medium text-slate-500">Account</p>

              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                Account details
              </h2>
            </div>

            <div className="mt-6 grid gap-4">
              <div className="rounded-2xl border border-slate-200 bg-[oklch(98.4%_0.003_247.858)] p-4">
                <p className="text-sm font-medium text-slate-500">
                  Trainer name
                </p>

                <p className="mt-2 text-base font-semibold text-slate-950">
                  {profile.full_name}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-[oklch(98.4%_0.003_247.858)] p-4">
                <p className="text-sm font-medium text-slate-500">
                  Login email
                </p>

                <p className="mt-2 break-all text-base font-semibold text-slate-950">
                  {accountEmail}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-[oklch(98.4%_0.003_247.858)] p-4">
                <p className="text-sm font-medium text-slate-500">
                  Contact email
                </p>

                <p className="mt-2 break-all text-base font-semibold text-slate-950">
                  {profile.contact_email || "Not added yet"}
                </p>
              </div>
            </div>

            {isAdmin && (
              <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">
                <p className="text-base font-medium text-blue-700">
                  Admin access
                </p>

                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                  Support inbox
                </h3>

                <p className="mt-3 leading-7 text-slate-600">
                  Review support messages sent by trainers from their dashboard.
                </p>

                <Link
                  href="/admin/support"
                  className="mt-5 inline-flex rounded-full bg-blue-600 px-5 py-3 text-base font-medium text-white transition hover:bg-blue-700"
                >
                  Open Admin Support
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
              <p className="text-base font-medium text-slate-500">Support</p>

              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                Contact FitLink support
              </h2>

              <p className="mt-3 max-w-2xl leading-7 text-slate-600">
                Send a message if you need help with your profile, packages,
                leads, or public profile.
              </p>
            </div>

            <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
              Admin review
            </span>
          </div>

          <form onSubmit={handleSupportSubmit} className="mt-6 grid gap-5">
            <div>
              <label className="mb-2 block text-base font-medium text-slate-800">
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
                placeholder="Example: I need help with my profile"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-base outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-base font-medium text-slate-800">
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
                className="w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-base outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <button
                disabled={submittingSupport}
                className="rounded-full bg-blue-600 px-6 py-3.5 text-base font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submittingSupport ? "Sending..." : "Send Support Message"}
              </button>
            </div>

            {supportStatus && (
              <p className="rounded-2xl bg-green-50 px-4 py-3 text-base font-medium text-green-800">
                {supportStatus}
              </p>
            )}

            {supportError && (
              <p className="rounded-2xl bg-red-50 px-4 py-3 text-base font-medium text-red-800">
                {supportError}
              </p>
            )}
          </form>
        </div>
      </section>
    </DashboardLayout>
  );
}
