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

    const { data: existingProfile, error: usernameCheckError } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", cleanUsername)
      .maybeSingle();

    if (usernameCheckError) {
      setStatus("");
      setErrorMessage(usernameCheckError.message);
      return;
    }

    if (existingProfile) {
      setStatus("");
      setErrorMessage("Username already taken. Please choose another one.");
      return;
    }

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
        emailRedirectTo: `${window.location.origin}/login`,
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

    setStatus(
      "Account created. Please check your email and confirm your account.",
    );

    setFormData({
      fullName: "",
      username: "",
      email: "",
      password: "",
    });
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
              className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
            >
              Log in
            </Link>
          </div>
        </header>

        <div className="grid flex-1 gap-10 py-10 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:py-14">
          <div className="max-w-2xl">
            <p className="text-base font-medium text-slate-500">
              Start with your profile
            </p>

            <h1 className="mt-4 text-5xl font-semibold tracking-[-0.05em] text-slate-950 md:text-6xl">
              Create a professional page for your coaching business.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Build your FitLink, show your packages, and collect organized
              client leads from one simple link.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="border-t border-slate-200 pt-5">
                <p className="text-xl font-semibold tracking-[-0.03em]">
                  Profile
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Present yourself like a professional coach.
                </p>
              </div>

              <div className="border-t border-slate-200 pt-5">
                <p className="text-xl font-semibold tracking-[-0.03em]">
                  Packages
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Make your offers clear before clients message you.
                </p>
              </div>

              <div className="border-t border-slate-200 pt-5">
                <p className="text-xl font-semibold tracking-[-0.03em]">
                  Leads
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Keep new client inquiries in one place.
                </p>
              </div>
            </div>
          </div>

          <div className="w-full rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:ml-auto lg:max-w-md">
            <div>
              <p className="text-base font-medium text-slate-500">
                Create account
              </p>

              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-slate-950">
                Start your FitLink
              </h2>

              <p className="mt-3 leading-7 text-slate-600">
                Set up your account and create your public coaching profile.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
              <div>
                <label className="mb-2 block text-base font-medium text-slate-800">
                  Full name
                </label>

                <input
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  type="text"
                  required
                  placeholder="Insert name"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-base outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-base font-medium text-slate-800">
                  Username
                </label>

                <input
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  type="text"
                  required
                  placeholder="abdalla_fitness"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-base outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Your profile link will be /trainer/
                  {formData.username || "your-username"}
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Use letters, numbers, hyphens, and underscores.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-base font-medium text-slate-800">
                  Email
                </label>

                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  type="email"
                  required
                  placeholder="trainer@email.com"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-base outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-base font-medium text-slate-800">
                  Password
                </label>

                <input
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  type="password"
                  required
                  placeholder="Create a password"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-base outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <button className="rounded-full bg-blue-600 px-6 py-3.5 text-base font-medium text-white transition hover:bg-blue-700">
                Create account
              </button>

              {status && (
                <p className="rounded-2xl bg-green-50 px-4 py-3 text-base font-medium text-green-800">
                  {status}
                </p>
              )}

              {errorMessage && (
                <p className="rounded-2xl bg-red-50 px-4 py-3 text-base font-medium text-red-800">
                  {errorMessage}
                </p>
              )}
            </form>

            <p className="mt-7 text-center text-base text-slate-600">
              Already have an account?{" "}
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