"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import FitLinkLogo from "@/components/FitLinkLogo";
import { validateUsername } from "@/lib/username";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
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

  setStatus("Creating account...");
  setErrorMessage("");

  const usernameValidation = validateUsername(formData.username);

  if (!usernameValidation.isValid) {
    setStatus("");
    setErrorMessage(usernameValidation.error);
    return;
  }

  const cleanUsername = usernameValidation.username;
  const cleanEmail = formData.email.trim().toLowerCase();

  const emailCheckResponse = await fetch("/api/check-email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: cleanEmail,
    }),
  });

  const emailCheckData = await emailCheckResponse.json();

  if (emailCheckData.exists) {
    setStatus("");
    setErrorMessage("Email already exists.");
    return;
  }

  if (!emailCheckResponse.ok) {
    setStatus("");
    setErrorMessage(emailCheckData.error || "Could not check email.");
    return;
  }

  const { error } = await supabase.auth.signUp({
    email: cleanEmail,
    password: formData.password,
    options: {
      data: {
        full_name: formData.fullName.trim(),
        username: cleanUsername,
      },
    },
  });

  if (error) {
    setStatus("");
    setErrorMessage(error.message);
    return;
  }

  setStatus("Account created. Please check your email and confirm your account.");

  setFormData({
    fullName: "",
    username: "",
    email: "",
    password: "",
  });
}

  return (
    <main className="min-h-screen bg-white p-2 text-gray-950 md:p-3 lg:p-4">
      <section className="grid min-h-[calc(100vh-1rem)] w-full gap-3 md:min-h-[calc(100vh-1.5rem)] lg:min-h-[calc(100vh-2rem)] lg:grid-cols-[1fr_0.9fr]">
        <div className="hidden rounded-[2rem] bg-gray-950 p-8 text-white shadow-xl lg:flex lg:flex-col lg:justify-between xl:p-10">
          <div>
            <div className="origin-left scale-110">
              <FitLinkLogo href="/" />
            </div>

            <div className="mt-16">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-400">
                Create your trainer page
              </p>

              <h1 className="mt-4 max-w-2xl text-5xl font-black leading-tight tracking-tight">
                Build a clean FitLink your clients can trust.
              </h1>

              <p className="mt-5 max-w-xl text-lg leading-8 text-gray-300">
                Sign up to create your public trainer profile, add your coaching
                packages, and start collecting organized client requests.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-5">
              <p className="font-black">One public link</p>
              <p className="mt-1 text-sm leading-6 text-gray-300">
                Share your FitLink in your Instagram bio, WhatsApp, TikTok, or
                anywhere clients find you.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-blue-400/20 bg-blue-400/10 p-5">
                <p className="font-black text-blue-200">Profile</p>
                <p className="mt-1 text-sm leading-6 text-gray-300">
                  Show who you are.
                </p>
              </div>

              <div className="rounded-2xl border border-green-400/20 bg-green-400/10 p-5">
                <p className="font-black text-green-200">Growth</p>
                <p className="mt-1 text-sm leading-6 text-gray-300">
                  Turn interest into leads.
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

            <div className="mt-2">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-600">
                Start free
              </p>

              <h1 className="mt-2 text-4xl font-black tracking-tight">
                Create account
              </h1>

              <p className="mt-3 leading-7 text-gray-600">
                Create your FitLink account and start building your trainer
                page.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 grid gap-4">
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Full name
                </label>

                <input
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  type="text"
                  required
                  placeholder="Your full name"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Username
                </label>

                <input
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  type="text"
                  required
                  placeholder="abdalla-fitness"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-600"
                />

                <p className="mt-1 text-xs text-gray-500">
                  Use lowercase letters, numbers, and hyphens only. Example:
                  abdalla-fitness
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Your public link will be /trainer/
                  {formData.username || "your-username"}
                </p>
              </div>

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
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-600"
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
                  placeholder="Create a password"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-600"
                />
              </div>

              <button className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700">
                Create Account
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
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-gray-950 underline"
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
