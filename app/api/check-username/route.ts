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

    const username = String(body.username || "")
      .trim()
      .toLowerCase();

    const currentProfileId = body.currentProfileId
      ? String(body.currentProfileId)
      : "";

    if (!username) {
      return NextResponse.json(
        { exists: false, error: "Username is required." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { exists: false, error: error.message },
        { status: 500 }
      );
    }

    const usernameBelongsToAnotherTrainer =
      data && data.id !== currentProfileId;

    return NextResponse.json({
      exists: Boolean(usernameBelongsToAnotherTrainer),
    });
  } catch {
    return NextResponse.json(
      { exists: false, error: "Could not check username." },
      { status: 500 }
    );
  }
}