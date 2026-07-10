"use client";

import { useState } from "react";
import Link from "next/link";
import FitLinkLogo from "@/components/FitLinkLogo";
import { supabase } from "@/lib/supabaseClient";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setStatus("Sending reset link...");
    setErrorMessage("");

    const cleanEmail = email.trim().toLowerCase();

    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setStatus("");
      setErrorMessage(error.message);
      return;
    }

    setStatus("Password reset link sent. Please check your email.");
    setEmail("");
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
              <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-400">
                Account recovery
              </p>

              <h1 className="mt-4 max-w-2xl text-5xl font-black leading-tight tracking-tight">
                Reset your FitLink password.
              </h1>

              <p className="mt-5 max-w-xl text-lg leading-8 text-gray-300">
                Enter your account email and we will send you a secure password
                reset link.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-green-400/20 bg-green-400/10 p-5">
            <p className="font-black text-green-200">Secure reset</p>
            <p className="mt-1 text-sm leading-6 text-gray-300">
              The reset link will take you back to FitLink to create a new
              password.
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
              <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-600">
                Forgot password
              </p>

              <h1 className="mt-2 text-4xl font-black tracking-tight">
                Reset password
              </h1>

              <p className="mt-3 leading-7 text-gray-600">
                Enter your email and we will send you a password reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 grid gap-4">
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Email
                </label>

                <input
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setStatus("");
                    setErrorMessage("");
                  }}
                  type="email"
                  required
                  placeholder="trainer@email.com"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-600"
                />
              </div>

              <button className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700">
                Send Reset Link
              </button>

              {status && (
                <p className="rounded-xl bg-green-100 px-4 py-3 text-sm font-medium text-green-800">
                  {status}
                </p>
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