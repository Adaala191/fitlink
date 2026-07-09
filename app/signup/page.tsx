"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

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

    const cleanEmail = formData.email.trim().toLowerCase();

    const cleanUsername = formData.username
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-");

    const { error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
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
      "Account created. Please check your email and confirm your account before logging in."
    );

    setFormData({
      fullName: "",
      username: "",
      email: "",
      password: "",
    });
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8 text-gray-950">
      <section className="mx-auto max-w-md rounded-3xl bg-white p-6 shadow-sm">
        <Link
          href="/"
          className="text-sm font-semibold text-gray-600 transition hover:text-gray-950"
        >
          ← Back Home
        </Link>

        <div className="mt-6">
          <p className="text-sm font-semibold text-gray-500">FitLink</p>

          <h1 className="mt-1 text-3xl font-bold">Create trainer account</h1>

          <p className="mt-2 text-gray-600">
            Create your profile and get your public FitLink page.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
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
              placeholder="Adal Fitness"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-950"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">Username</label>

            <input
              name="username"
              value={formData.username}
              onChange={handleChange}
              type="text"
              required
              placeholder="adal"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-950"
            />

            <p className="mt-1 text-xs text-gray-500">
              Your public link: /trainer/
              {formData.username
                ? formData.username.toLowerCase().trim().replace(/\s+/g, "-")
                : "username"}
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">Email</label>

            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              type="email"
              required
              placeholder="trainer@email.com"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-950"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">Password</label>

            <input
              name="password"
              value={formData.password}
              onChange={handleChange}
              type="password"
              required
              minLength={6}
              placeholder="Minimum 6 characters"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-950"
            />
          </div>

          <button className="rounded-xl bg-gray-950 px-5 py-3 font-semibold text-white transition hover:bg-gray-800">
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
          <Link href="/login" className="font-semibold text-gray-950 underline">
            Log in
          </Link>
        </p>
      </section>
    </main>
  );
}