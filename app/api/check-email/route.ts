import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
}

if (!supabaseSecretKey) {
  throw new Error("Missing SUPABASE_SECRET_KEY");
}

const supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || "")
      .trim()
      .toLowerCase();

    if (!email) {
      return NextResponse.json(
        { exists: false, error: "Email is required." },
        { status: 400 }
      );
    }

    // MVP check: look through Supabase Auth users and see if this email exists.
    // This runs on the server only, so the secret key is not exposed to the browser.
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (error) {
      return NextResponse.json(
        { exists: false, error: error.message },
        { status: 500 }
      );
    }

    const emailExists = data.users.some(
      (user) => user.email?.toLowerCase() === email
    );

    return NextResponse.json({
      exists: emailExists,
    });
  } catch {
    return NextResponse.json(
      { exists: false, error: "Could not check email." },
      { status: 500 }
    );
  }
}