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

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function POST(request: Request) {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      return NextResponse.json(
        { error: "Missing RESEND_API_KEY." },
        { status: 500 },
      );
    }

    const resend = new Resend(resendApiKey);

    const body = await request.json();

    const trainerId = String(body.trainerId || "").trim();
    const packageId = String(body.packageId || "").trim();
    const clientName = String(body.clientName || "").trim();
    const clientEmail = String(body.clientEmail || "").trim().toLowerCase();
    const clientPhone = String(body.clientPhone || "").trim();
    const fitnessGoal = String(body.fitnessGoal || "").trim();
    const message = String(body.message || "").trim();

    if (
      !trainerId ||
      !packageId ||
      !clientName ||
      !clientEmail ||
      !fitnessGoal
    ) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 },
      );
    }

    const { data: trainer, error: trainerError } = await supabase
      .from("profiles")
      .select("full_name, contact_email")
      .eq("id", trainerId)
      .maybeSingle();

    if (trainerError) {
      return NextResponse.json(
        { error: trainerError.message },
        { status: 400 },
      );
    }

    if (!trainer) {
      return NextResponse.json(
        { error: "Trainer not found." },
        { status: 404 },
      );
    }

    const { data: selectedPackage, error: packageError } = await supabase
      .from("packages")
      .select("id, title, price, duration")
      .eq("id", packageId)
      .eq("trainer_id", trainerId)
      .maybeSingle();

    if (packageError) {
      return NextResponse.json(
        { error: packageError.message },
        { status: 400 },
      );
    }

    if (!selectedPackage) {
      return NextResponse.json(
        { error: "Package not found." },
        { status: 404 },
      );
    }

    const { data: clientRequest, error: insertError } = await supabase
      .from("client_requests")
      .insert({
        trainer_id: trainerId,
        package_id: selectedPackage.id,
        client_name: clientName,
        client_email: clientEmail,
        client_phone: clientPhone || null,
        fitness_goal: fitnessGoal,
        message: message || null,
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

    if (!trainerEmail) {
      return NextResponse.json({
        success: true,
        requestId: clientRequest.id,
        emailSent: false,
        message: "Request saved, but trainer has no contact email.",
      });
    }

    const safeClientName = escapeHtml(clientName);
    const safeClientEmail = escapeHtml(clientEmail);
    const safeClientPhone = escapeHtml(clientPhone || "Not provided");
    const safeFitnessGoal = escapeHtml(fitnessGoal);
    const safeMessage = escapeHtml(message || "No message provided.");
    const safePackageTitle = escapeHtml(selectedPackage.title);
    const safePackagePrice = escapeHtml(selectedPackage.price);
    const safePackageDuration = escapeHtml(selectedPackage.duration);
    const safeDashboardRequestsUrl = escapeHtml(dashboardRequestsUrl);

    const { error: emailError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "FitLink <onboarding@resend.dev>",
      to: trainerEmail,
      subject: `New coaching inquiry from ${clientName}`,
      replyTo: clientEmail,
      html: `
        <div style="margin:0; padding:0; background:#f8fafc; font-family:Arial, Helvetica, sans-serif; color:#0f172a;">
          <div style="max-width:640px; margin:0 auto; padding:28px 16px;">
            <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:28px; overflow:hidden;">

              <div style="padding:28px 28px 18px 28px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;">
                  <tr>
                    <td style="vertical-align:middle;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td style="width:44px; height:44px; border-radius:16px; background:#0f172a; text-align:center; vertical-align:middle;">
                            <span style="display:inline-block; width:8px; height:8px; border-radius:999px; background:#3b82f6; vertical-align:middle;"></span>
                            <span style="display:inline-block; width:16px; height:5px; border-radius:999px; background:#ffffff; vertical-align:middle; margin:0 -1px;"></span>
                            <span style="display:inline-block; width:8px; height:8px; border-radius:999px; background:#22c55e; vertical-align:middle;"></span>
                          </td>

                          <td style="padding-left:12px; vertical-align:middle;">
                            <div style="font-size:25px; font-weight:800; letter-spacing:-0.6px; color:#0f172a; line-height:1;">
                              FitLink
                            </div>
                            <div style="margin-top:6px; font-size:11px; font-weight:600; letter-spacing:1.8px; color:#64748b; line-height:1.2;">
                              Train. Connect. Grow.
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>

                    <td style="text-align:right; vertical-align:middle;">
                      <span style="display:inline-block; background:#eff6ff; color:#1d4ed8; border:1px solid #bfdbfe; border-radius:999px; padding:8px 12px; font-size:13px; font-weight:600;">
                        New inquiry
                      </span>
                    </td>
                  </tr>
                </table>
              </div>

              <div style="padding:0 28px 28px 28px;">
                <div style="border-top:1px solid #e2e8f0; padding-top:26px;">
                  <h1 style="margin:0; font-size:30px; line-height:1.15; letter-spacing:-1px; color:#0f172a;">
                    ${safeClientName} wants to work with you.
                  </h1>

                  <p style="margin:14px 0 0 0; color:#475569; font-size:16px; line-height:1.7;">
                    A new client submitted a coaching inquiry through your FitLink profile. Review the details below and follow up when you are ready.
                  </p>
                </div>

                <div style="margin-top:24px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:22px; padding:20px;">
                  <h2 style="margin:0 0 14px 0; color:#0f172a; font-size:18px; letter-spacing:-0.3px;">
                    Client details
                  </h2>

                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%; border-collapse:collapse;">
                    <tr>
                      <td style="padding:9px 0; color:#64748b; width:120px; font-size:14px;">Name</td>
                      <td style="padding:9px 0; color:#0f172a; font-size:15px; font-weight:600;">${safeClientName}</td>
                    </tr>
                    <tr>
                      <td style="padding:9px 0; color:#64748b; width:120px; font-size:14px;">Email</td>
                      <td style="padding:9px 0; color:#0f172a; font-size:15px; font-weight:600;">${safeClientEmail}</td>
                    </tr>
                    <tr>
                      <td style="padding:9px 0; color:#64748b; width:120px; font-size:14px;">Phone</td>
                      <td style="padding:9px 0; color:#0f172a; font-size:15px; font-weight:600;">${safeClientPhone}</td>
                    </tr>
                  </table>
                </div>

                <div style="margin-top:16px; background:#eff6ff; border:1px solid #bfdbfe; border-radius:22px; padding:20px;">
                  <h2 style="margin:0 0 14px 0; color:#1e3a8a; font-size:18px; letter-spacing:-0.3px;">
                    Selected package
                  </h2>

                  <p style="margin:0; color:#0f172a; font-size:17px; font-weight:700;">
                    ${safePackageTitle}
                  </p>

                  <p style="margin:8px 0 0 0; color:#1d4ed8; font-size:15px;">
                    ${safePackageDuration} · ${safePackagePrice}
                  </p>
                </div>

                <div style="margin-top:16px; background:#ffffff; border:1px solid #e2e8f0; border-radius:22px; padding:20px;">
                  <h2 style="margin:0 0 12px 0; color:#0f172a; font-size:18px; letter-spacing:-0.3px;">
                    Fitness goal
                  </h2>

                  <p style="margin:0; color:#475569; font-size:15px; line-height:1.7;">
                    ${safeFitnessGoal}
                  </p>

                  <div style="height:1px; background:#e2e8f0; margin:18px 0;"></div>

                  <h2 style="margin:0 0 12px 0; color:#0f172a; font-size:18px; letter-spacing:-0.3px;">
                    Message
                  </h2>

                  <p style="margin:0; color:#475569; font-size:15px; line-height:1.7;">
                    ${safeMessage}
                  </p>
                </div>

                <div style="margin-top:24px;">
                  <a
                    href="${safeDashboardRequestsUrl}"
                    style="display:inline-block; background:#2563eb; color:#ffffff; padding:14px 22px; border-radius:999px; text-decoration:none; font-size:15px; font-weight:700;"
                  >
                    View inquiry in dashboard
                  </a>
                </div>

                <p style="margin:24px 0 0 0; color:#64748b; font-size:13px; line-height:1.6;">
                  This message was sent from your FitLink profile. You can reply directly to this email to contact the client.
                </p>
              </div>
            </div>

            <p style="margin:18px 0 0 0; text-align:center; color:#94a3b8; font-size:12px;">
              © FitLink · Train. Connect. Grow.
            </p>
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
      packageId: selectedPackage.id,
      emailSent: true,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Something went wrong.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}