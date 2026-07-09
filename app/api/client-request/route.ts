import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
}

if (!supabaseSecretKey) {
  throw new Error("Missing SUPABASE_SECRET_KEY");
}

const supabase = createClient(supabaseUrl, supabaseSecretKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      trainerId,
      packageId,
      clientName,
      clientEmail,
      clientPhone,
      fitnessGoal,
      message,
    } = body;

    if (!trainerId || !packageId || !clientName || !clientEmail || !fitnessGoal) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const { data: trainer, error: trainerError } = await supabase
      .from("profiles")
      .select("full_name, contact_email")
      .eq("id", trainerId)
      .maybeSingle();

    if (trainerError) {
      return NextResponse.json({ error: trainerError.message }, { status: 400 });
    }

    if (!trainer) {
      return NextResponse.json(
        { error: "Trainer not found." },
        { status: 404 }
      );
    }

    const { data: selectedPackage, error: packageError } = await supabase
      .from("packages")
      .select("title, price, duration")
      .eq("id", packageId)
      .eq("trainer_id", trainerId)
      .maybeSingle();

    if (packageError) {
      return NextResponse.json({ error: packageError.message }, { status: 400 });
    }

    if (!selectedPackage) {
      return NextResponse.json(
        { error: "Package not found." },
        { status: 404 }
      );
    }

    const { data: clientRequest, error: insertError } = await supabase
      .from("client_requests")
      .insert({
        trainer_id: trainerId,
        package_id: packageId,
        client_name: clientName,
        client_email: clientEmail,
        client_phone: clientPhone,
        fitness_goal: fitnessGoal,
        message,
        status: "new",
      })
      .select("id")
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }

    const trainerEmail = trainer.contact_email;

    if (!trainerEmail) {
      return NextResponse.json({
        success: true,
        requestId: clientRequest.id,
        emailSent: false,
        message: "Request saved, but trainer has no contact email.",
      });
    }

    const { error: emailError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "FitLink <onboarding@resend.dev>",
      to: trainerEmail,
      subject: `New FitLink request from ${clientName}`,
      replyTo: clientEmail,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>New client request</h2>
          <p>You received a new request on FitLink.</p>

          <h3>Client Details</h3>
          <p><strong>Name:</strong> ${clientName}</p>
          <p><strong>Email:</strong> ${clientEmail}</p>
          <p><strong>Phone:</strong> ${clientPhone || "Not provided"}</p>

          <h3>Selected Package</h3>
          <p><strong>Package:</strong> ${selectedPackage.title}</p>
          <p><strong>Price:</strong> ${selectedPackage.price}</p>
          <p><strong>Duration:</strong> ${selectedPackage.duration}</p>

          <h3>Fitness Goal</h3>
          <p>${fitnessGoal}</p>

          <h3>Message</h3>
          <p>${message || "No message provided."}</p>

          <p style="margin-top: 24px;">
            Log in to your FitLink dashboard to manage this request.
          </p>
        </div>
      `,
    });

    if (emailError) {
      return NextResponse.json({
        success: true,
        requestId: clientRequest.id,
        emailSent: false,
        emailError: emailError.message,
      });
    }

    return NextResponse.json({
      success: true,
      requestId: clientRequest.id,
      emailSent: true,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Something went wrong.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}