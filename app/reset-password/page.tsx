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
    <main className="min-h-screen bg-white p-2 text-gray-950 md:p-3 lg:p-4">
      <section className="grid min-h-[calc(100vh-1rem)] w-full gap-3 md:min-h-[calc(100vh-1.5rem)] lg:min-h-[calc(100vh-2rem)] lg:grid-cols-[1fr_0.9fr]">
        <div className="hidden rounded-[2rem] bg-gray-950 p-8 text-white shadow-xl lg:flex lg:flex-col lg:justify-between xl:p-10">
          <div>
            <div className="inline-flex rounded-2xl bg-white p-3">
              <FitLinkLogo href="/" />
            </div>

            <div className="mt-16">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-green-400">
                New password
              </p>

              <h1 className="mt-4 max-w-2xl text-5xl font-black leading-tight tracking-tight">
                Create your new FitLink password.
              </h1>

              <p className="mt-5 max-w-xl text-lg leading-8 text-gray-300">
                Choose a new password for your trainer dashboard.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-blue-400/20 bg-blue-400/10 p-5">
            <p className="font-black text-blue-200">Almost done</p>
            <p className="mt-1 text-sm leading-6 text-gray-300">
              After updating your password, return to login and sign in again.
            </p>
          </div>
        </div>

        <div className="flex rounded-[2rem] bg-white p-4 shadow-xl md:p-8 lg:items-center lg:justify-center xl:p-10">
          <div className="w-full max-w-md">
            <div className="mb-10 flex justify-center lg:hidden">
              <div className="scale-110">
                <FitLinkLogo href="/" />
              </div>
            </div>

            <Link
              href="/login"
              className="inline-flex items-center rounded-full border border-gray-200 px-4 py-2 text-sm font-bold text-gray-600 transition hover:border-gray-950 hover:text-gray-950"
            >
              Back to login
            </Link>

            <div className="mt-5">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-green-600">
                Reset password
              </p>

              <h1 className="mt-2 text-4xl font-black tracking-tight">
                New password
              </h1>

              <p className="mt-3 leading-7 text-gray-600">
                Enter and confirm your new password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 grid gap-4">
              <div>
                <label className="mb-2 block text-sm font-semibold">
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
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
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
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
                />
              </div>

              <button className="rounded-xl bg-green-500 px-5 py-3 font-semibold text-gray-950 transition hover:bg-green-400">
                Update Password
              </button>

              {status && (
                <div className="rounded-xl bg-green-100 px-4 py-3 text-sm font-medium text-green-800">
                  <p>{status}</p>

                  <Link
                    href="/login"
                    className="mt-3 inline-block font-bold underline"
                  >
                    Go to login
                  </Link>
                </div>
              )}

              {errorMessage && (
                <p className="rounded-xl bg-red-100 px-4 py-3 text-sm font-medium text-red-800">
                  {errorMessage}
                </p>
              )}
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}