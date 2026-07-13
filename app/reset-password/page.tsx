"use client";

import { useState } from "react";
import Link from "next/link";
import FitLinkLogo from "@/components/FitLinkLogo";
import { supabase } from "@/lib/supabaseClient";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setStatus("Updating password...");
    setErrorMessage("");

    if (password.length < 6) {
      setStatus("");
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setStatus("");
      setErrorMessage("Passwords do not match.");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setStatus("");
      setErrorMessage(error.message);
      return;
    }

    setPassword("");
    setConfirmPassword("");
    setStatus("Password updated successfully. You can now log in.");
  }

  return (
    <main className="min-h-screen bg-[oklch(98.4%_0.003_247.858)] text-slate-950">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between">
          <FitLinkLogo href="/" />

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-900 hover:text-slate-950 sm:inline-flex"
            >
              Home
            </Link>

            <Link
              href="/login"
              className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Log in
            </Link>
          </div>
        </header>

        <div className="grid flex-1 gap-10 py-10 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:py-14">
          <div className="max-w-2xl">
            <p className="text-base font-medium text-slate-500">
              New password
            </p>

            <h1 className="mt-4 text-5xl font-semibold tracking-[-0.05em] text-slate-950 md:text-6xl">
              Create your new FitLink password.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Choose a new password for your trainer dashboard. After updating
              it, you can return to login and sign in again.
            </p>

            <div className="mt-10 border-t border-slate-200 pt-6">
              <p className="text-xl font-semibold tracking-[-0.03em]">
                Almost done
              </p>

              <p className="mt-2 max-w-md leading-7 text-slate-500">
                Use at least 6 characters and keep your password somewhere safe.
              </p>
            </div>
          </div>

          <div className="w-full rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:ml-auto lg:max-w-md">
            <div>
              <p className="text-base font-medium text-slate-500">
                Reset password
              </p>

              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-slate-950">
                Set new password
              </h2>

              <p className="mt-3 leading-7 text-slate-600">
                Enter and confirm your new password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
              <div>
                <label className="mb-2 block text-base font-medium text-slate-800">
                  New password
                </label>

                <input
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setStatus("");
                    setErrorMessage("");
                  }}
                  type="password"
                  required
                  placeholder="Create new password"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-base outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-base font-medium text-slate-800">
                  Confirm password
                </label>

                <input
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    setStatus("");
                    setErrorMessage("");
                  }}
                  type="password"
                  required
                  placeholder="Confirm new password"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-base outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <button className="rounded-full bg-blue-600 px-6 py-3.5 text-base font-medium text-white transition hover:bg-blue-700">
                Update password
              </button>

              {status && (
                <div className="rounded-2xl bg-green-50 px-4 py-3 text-base font-medium text-green-800">
                  <p>{status}</p>

                  <Link
                    href="/login"
                    className="mt-3 inline-block font-medium text-green-900 underline-offset-4 hover:underline"
                  >
                    Go to login
                  </Link>
                </div>
              )}

              {errorMessage && (
                <p className="rounded-2xl bg-red-50 px-4 py-3 text-base font-medium text-red-800">
                  {errorMessage}
                </p>
              )}
            </form>

            <p className="mt-7 text-center text-base text-slate-600">
              Remember your password?{" "}
              <Link
                href="/login"
                className="font-medium text-blue-600 underline-offset-4 hover:underline"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}