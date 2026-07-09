"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type ProtectedPageProps = {
  children: React.ReactNode;
};

export default function ProtectedPage({ children }: ProtectedPageProps) {
  const [loading, setLoading] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      setIsAllowed(true);
      setLoading(false);
    }

    checkUser();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 px-4 py-6 text-gray-950">
        <section className="mx-auto max-w-5xl">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="font-semibold">Checking access...</p>
          </div>
        </section>
      </main>
    );
  }

  if (!isAllowed) {
    return null;
  }

  return <>{children}</>;
}