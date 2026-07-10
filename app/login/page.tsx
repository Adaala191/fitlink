"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import FitLinkLogo from "@/components/FitLinkLogo";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [status, setStatus] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    setStatus("");
    setErrorMessage("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setStatus("Logging in...");
    setErrorMessage("");

    const cleanEmail = formData.email.trim().toLowerCase();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: formData.password,
    });

    console.log("Login data:", data);
    console.log("Login error:", error);

    if (error) {
      setStatus("");
      setErrorMessage(error.message);
      return;
    }

    setStatus("Logged in successfully. Redirecting...");

    window.location.href = "/dashboard";
  }

  return (
    <main className="min-h-screen bg-white p-2 text-gray-950 md:p-3 lg:p-4">
      <section className="grid min-h-[calc(100vh-1rem)] w-full gap-4 md:min-h-[calc(100vh-1.5rem)] lg:min-h-[calc(100vh-2rem)] lg:grid-cols-[1fr_0.9fr]">
        {" "}
        <div className="hidden rounded-[2rem] bg-gray-950 p-8 text-white shadow-xl lg:flex lg:flex-col lg:justify-between xl:p-10">
          <div>
            <div className="origin-left scale-110">
              <FitLinkLogo href="/" />
            </div>

            <div className="mt-16">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-green-400">
                Trainer dashboard
              </p>

              <h1 className="mt-4 max-w-2xl text-5xl font-black leading-tight tracking-tight">
                Manage your coaching business from one simple link.
              </h1>

              <p className="mt-5 max-w-xl text-lg leading-8 text-gray-300">
                Log in to update your profile, manage packages, and follow up
                with new client requests.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-5">
              <p className="font-black">Public trainer page</p>
              <p className="mt-1 text-sm leading-6 text-gray-300">
                Share one clean FitLink in your bio, WhatsApp, TikTok, or
                Instagram.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-blue-400/20 bg-blue-400/10 p-5">
                <p className="font-black text-blue-200">Packages</p>
                <p className="mt-1 text-sm leading-6 text-gray-300">
                  Show your offers clearly.
                </p>
              </div>

              <div className="rounded-2xl border border-green-400/20 bg-green-400/10 p-5">
                <p className="font-black text-green-200">Requests</p>
                <p className="mt-1 text-sm leading-6 text-gray-300">
                  Get organized client leads.
                </p>
              </div>
            </div>
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
              href="/"
              className="inline-flex items-center rounded-full border border-gray-200 px-2 py-2 text-sm font-bold text-gray-600 transition hover:border-gray-950 hover:text-gray-950"
            >
              Back to home
            </Link>

            <div className="mt-8">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-green-600">
                Welcome back
              </p>

              <h1 className="mt-2 text-4xl font-black tracking-tight">
                Log in
              </h1>

              <p className="mt-3 leading-7 text-gray-600">
                Access your trainer dashboard and manage your public page.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 grid gap-4">
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Email
                </label>

                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  type="email"
                  required
                  placeholder="trainer@email.com"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Password
                </label>

                <input
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  type="password"
                  required
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
                />
              </div>

              <div className="text-right">
                <Link
                  href="/forgot-password"
                  className="text-sm font-semibold text-blue-600 underline"
                >
                  Forgot password?
                </Link>
              </div>

              <button className="rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700">
                Log In
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

            <p className="mt-6 text-center text-sm text-gray-600">
              New to FitLink?{" "}
              <Link
                href="/signup"
                className="font-semibold text-gray-950 underline"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
