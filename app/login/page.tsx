"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

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

          <h1 className="mt-1 text-3xl font-bold">Log in</h1>

          <p className="mt-2 text-gray-600">
            Access your trainer dashboard and manage your public page.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
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
              placeholder="Enter your password"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-950"
            />
          </div>

          <button className="rounded-xl bg-gray-950 px-5 py-3 font-semibold text-white transition hover:bg-gray-800">
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
          <Link href="/signup" className="font-semibold text-gray-950 underline">
            Create account
          </Link>
        </p>
      </section>
    </main>
  );
}