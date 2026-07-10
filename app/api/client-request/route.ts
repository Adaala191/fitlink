import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

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
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      return NextResponse.json(
        { error: "Missing RESEND_API_KEY." },
        { status: 500 }
      );
    }

    const resend = new Resend(resendApiKey);

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

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const dashboardRequestsUrl = `${appUrl}/dashboard/requests`;
    const logoUrl = `${appUrl}/fitlink-logo.svg`;

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
        <div style="font-family: Arial, sans-serif; line-height: 1.6; background-color: #f7f5ef; padding: 24px;">
          <div style="max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e5e7eb;">
            
            <div style="padding: 24px 24px 12px 24px;">
              <img
                src="${logoUrl}"
                alt="FitLink"
                width="180"
                style="display: block; max-width: 180px;"
              />
            </div>

            <div style="padding: 12px 24px 24px 24px;">
              <div style="background: #111827; border-radius: 18px; padding: 24px; color: #ffffff;">
                <p style="margin: 0 0 8px 0; color: #93c5fd; font-size: 13px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;">
                  New client request
                </p>

                <h1 style="margin: 0; font-size: 26px; line-height: 1.2;">
                  ${clientName} is interested in your coaching.
                </h1>

                <p style="margin: 14px 0 0 0; color: #d1d5db;">
                  You received a new request on FitLink. Review the client details and follow up from your dashboard.
                </p>
              </div>

              <div style="background: #f9fafb; border-radius: 16px; padding: 18px; margin-top: 18px;">
                <h2 style="margin: 0 0 12px 0; color: #111827; font-size: 18px;">
                  Client Details
                </h2>

                <p style="margin: 6px 0;"><strong>Name:</strong> ${clientName}</p>
                <p style="margin: 6px 0;"><strong>Email:</strong> ${clientEmail}</p>
                <p style="margin: 6px 0;"><strong>Phone:</strong> ${
                  clientPhone || "Not provided"
                }</p>
              </div>

              <div style="background: #eff6ff; border-radius: 16px; padding: 18px; margin-top: 16px;">
                <h2 style="margin: 0 0 12px 0; color: #1e3a8a; font-size: 18px;">
                  Selected Package
                </h2>

                <p style="margin: 6px 0;"><strong>Package:</strong> ${
                  selectedPackage.title
                }</p>
                <p style="margin: 6px 0;"><strong>Price:</strong> ${
                  selectedPackage.price
                }</p>
                <p style="margin: 6px 0;"><strong>Duration:</strong> ${
                  selectedPackage.duration
                }</p>
              </div>

              <div style="background: #f0fdf4; border-radius: 16px; padding: 18px; margin-top: 16px;">
                <h2 style="margin: 0 0 12px 0; color: #166534; font-size: 18px;">
                  Fitness Goal
                </h2>

                <p style="margin: 0; color: #374151;">${fitnessGoal}</p>

                <h2 style="margin: 18px 0 12px 0; color: #166534; font-size: 18px;">
                  Message
                </h2>

                <p style="margin: 0; color: #374151;">
                  ${message || "No message provided."}
                </p>
              </div>

              <a
                href="${dashboardRequestsUrl}"
                style="display: inline-block; margin-top: 22px; background: #16a34a; color: #ffffff; padding: 14px 20px; border-radius: 14px; text-decoration: none; font-weight: 800;"
              >
                View request in dashboard
              </a>

              <p style="margin-top: 24px; color: #6b7280; font-size: 13px;">
                This email was sent by FitLink. Train. Connect. Grow.
              </p>
            </div>
          </div>
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