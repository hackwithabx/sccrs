import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import connectDB from "@/lib/mongodb";
import Contact from "@/models/Contact";
import { rateLimit, getClientIP } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

type SubscriptionPlan = "pro" | "enterprise";

const isMongoConfigured = !!process.env.MONGODB_URI;
const isSmtpConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_PASSWORD);
const supportEmail = process.env.ADMIN_EMAIL || "support@securecodereviews.com";
const senderEmail = process.env.SMTP_USER || supportEmail;

function sanitize(input: string) {
  return input.replace(/<[^>]*>/g, "").trim().slice(0, 5000);
}

function escapeHtml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function normalizePlan(value: unknown): SubscriptionPlan | null {
  return value === "pro" || value === "enterprise" ? value : null;
}

function inferSubscription(subject: string, message: string) {
  const combined = `${subject} ${message}`.toLowerCase();
  const mentionsShieldX = combined.includes("shieldx");
  const mentionsSubscriptionIntent =
    combined.includes("subscription") ||
    combined.includes("pricing") ||
    combined.includes("billing") ||
    combined.includes("plan request") ||
    combined.includes("start pro") ||
    combined.includes("start enterprise");

  return mentionsShieldX && mentionsSubscriptionIntent;
}

function inferPlan(subject: string, message: string): SubscriptionPlan | null {
  const combined = `${subject} ${message}`.toLowerCase();

  if (/\benterprise\b/.test(combined)) {
    return "enterprise";
  }

  if (/\bpro\b/.test(combined)) {
    return "pro";
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const clientIP = getClientIP(request);
    const rateLimitResult = await rateLimit(`contact:${clientIP}`, {
      maxRequests: 5,
      windowSeconds: 600,
    });

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many submissions. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimitResult.resetIn),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    const body = (await request.json()) as {
      name?: string;
      email?: string;
      subject?: string;
      message?: string;
      requestType?: string;
      subscriptionPlan?: string;
    };

    const { name, email, subject, message, requestType, subscriptionPlan } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const cleanName = sanitize(name);
    const cleanSubject = sanitize(subject);
    const cleanMessage = sanitize(message);
    const cleanEmail = email.trim();

    const safeName = escapeHtml(cleanName);
    const safeSubject = escapeHtml(cleanSubject);
    const safeMessage = escapeHtml(cleanMessage).replace(/\n/g, "<br />");
    const safeEmail = escapeHtml(cleanEmail);

    const explicitSubscriptionRequest = requestType === "subscription";
    const requestedPlan = normalizePlan(subscriptionPlan);
    const inferredSubscriptionRequest = inferSubscription(cleanSubject, cleanMessage);
    const resolvedPlan = requestedPlan || inferPlan(cleanSubject, cleanMessage);
    const isSubscriptionRequest =
      explicitSubscriptionRequest || inferredSubscriptionRequest;

    if (!isMongoConfigured) {
      console.error("MongoDB not configured - MONGODB_URI missing");
      if (!isSmtpConfigured) {
        return NextResponse.json(
          {
            error:
              "Contact form is not configured. Please email us directly at support@securecodereviews.com",
          },
          { status: 503 }
        );
      }
    }

    let contactDoc = null;

    if (isMongoConfigured) {
      try {
        await connectDB();
        contactDoc = await Contact.create({
          name: cleanName,
          email: cleanEmail,
          subject: cleanSubject,
          message: cleanMessage,
          status: "new",
        });
      } catch (dbError) {
        console.error("Database error:", dbError);
        if (!isSmtpConfigured) {
          return NextResponse.json(
            { error: "Failed to save your message. Please try again." },
            { status: 500 }
          );
        }
      }
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.hostinger.com",
      port: parseInt(process.env.SMTP_PORT || "465", 10),
      secure: process.env.SMTP_SECURE !== "false",
      auth: {
        user: senderEmail,
        pass: process.env.SMTP_PASSWORD || "",
      },
    });

    let emailSent = false;
    let emailError: string | null = null;

    const adminSubjectPrefix = isSubscriptionRequest
      ? "[SCR Subscription Request]"
      : "[SCR Contact]";
    const adminHeading = isSubscriptionRequest
      ? "New ShieldX Subscription Request"
      : "New Contact Submission";
    const adminBadge = isSubscriptionRequest ? "SUBSCRIPTION" : "NEW";
    const adminBadgeBackground = isSubscriptionRequest ? "#0f766e" : "#10b981";
    const requestTypeLabel = isSubscriptionRequest ? "Subscription request" : "General contact";
    const planLabel = resolvedPlan
      ? resolvedPlan === "enterprise"
        ? "Enterprise"
        : "Pro"
      : null;

    try {
      await transporter.sendMail({
        from: `"SecureCodeReviews" <${senderEmail}>`,
        to: supportEmail,
        replyTo: cleanEmail,
        subject: `${adminSubjectPrefix} ${cleanSubject}`,
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          </head>
          <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Segoe UI', Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background: #ffffff;">
              <div style="background: #0f172a; padding: 20px 24px; border-radius: 8px 8px 0 0;">
                <table style="width: 100%;">
                  <tr>
                    <td>
                      <img src="https://securecodereviews.com/android-chrome-192x192.png" alt="SCR" width="36" height="36" style="border-radius: 6px; vertical-align: middle; margin-right: 12px;" />
                      <span style="color: #10b981; font-size: 18px; font-weight: 700; vertical-align: middle;">${adminHeading}</span>
                    </td>
                    <td style="text-align: right;">
                      <span style="background: ${adminBadgeBackground}; color: white; font-size: 11px; font-weight: 600; padding: 4px 12px; border-radius: 12px;">${adminBadge}</span>
                    </td>
                  </tr>
                </table>
              </div>
              <div style="height: 3px; background: ${adminBadgeBackground};"></div>
              <div style="padding: 24px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 10px 0; color: #64748b; font-size: 13px; width: 120px; border-bottom: 1px solid #f1f5f9;">Type:</td>
                    <td style="padding: 10px 0; color: #1e293b; font-size: 14px; font-weight: 600; border-bottom: 1px solid #f1f5f9;">${requestTypeLabel}</td>
                  </tr>
                  ${
                    planLabel
                      ? `
                  <tr>
                    <td style="padding: 10px 0; color: #64748b; font-size: 13px; border-bottom: 1px solid #f1f5f9;">Plan:</td>
                    <td style="padding: 10px 0; color: #1e293b; font-size: 14px; font-weight: 600; border-bottom: 1px solid #f1f5f9;">${planLabel}</td>
                  </tr>
                  `
                      : ""
                  }
                  <tr>
                    <td style="padding: 10px 0; color: #64748b; font-size: 13px; border-bottom: 1px solid #f1f5f9;">Name:</td>
                    <td style="padding: 10px 0; color: #1e293b; font-size: 14px; font-weight: 600; border-bottom: 1px solid #f1f5f9;">${safeName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #64748b; font-size: 13px; border-bottom: 1px solid #f1f5f9;">Email:</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;"><a href="mailto:${safeEmail}" style="color: #10b981; font-size: 14px; font-weight: 600; text-decoration: none;">${safeEmail}</a></td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #64748b; font-size: 13px; border-bottom: 1px solid #f1f5f9;">Subject:</td>
                    <td style="padding: 10px 0; color: #1e293b; font-size: 14px; font-weight: 600; border-bottom: 1px solid #f1f5f9;">${safeSubject}</td>
                  </tr>
                </table>
                <h3 style="color: #0f172a; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; margin: 20px 0 8px;">Message</h3>
                <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; color: #334155; font-size: 14px; line-height: 1.6;">
                  ${safeMessage}
                </div>
                <div style="margin-top: 20px; text-align: center;">
                  <a href="mailto:${safeEmail}?subject=Re: ${encodeURIComponent(cleanSubject)}" style="display: inline-block; background: ${adminBadgeBackground}; color: white; text-decoration: none; padding: 10px 28px; border-radius: 6px; font-size: 13px; font-weight: 600;">Reply to ${safeName}</a>
                </div>
                <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 16px 0 0;">
                  Received: ${new Date().toISOString()} | SecureCodeReviews Contact Form
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: [
          adminHeading,
          "",
          `Type: ${requestTypeLabel}`,
          planLabel ? `Plan: ${planLabel}` : null,
          `Name: ${cleanName}`,
          `Email: ${cleanEmail}`,
          `Subject: ${cleanSubject}`,
          "",
          "Message:",
          cleanMessage,
          "",
          "---",
          "Sent from SecureCodeReviews.com Contact Form",
        ]
          .filter(Boolean)
          .join("\n"),
      });

      const autoReplySubject = isSubscriptionRequest
        ? `Re: ${cleanSubject} - We received your ShieldX request`
        : `Re: ${cleanSubject} - We received your message`;

      const autoReplyIntro = isSubscriptionRequest
        ? `Thank you for requesting ShieldX${planLabel ? ` ${planLabel}` : ""}. Our team is reviewing your subscription request now.`
        : "Thank you for reaching out to SecureCodeReviews. We have successfully received your message and our security team is reviewing it.";

      const autoReplyExpectations = isSubscriptionRequest
        ? [
            "We will confirm the plan and usage details you shared.",
            "We will reply with activation and billing next steps.",
            "If needed, we will suggest the best fit between Pro and Enterprise.",
          ]
        : [
            "Our team will respond within 24 hours during business days.",
            'For urgent security matters, reply with "URGENT" in the subject.',
            "Complex security inquiries may take up to 48 hours.",
          ];

      const autoReplyCtas = isSubscriptionRequest
        ? [
            {
              href: "https://securecodereviews.com/shieldx",
              label: "Open ShieldX Demo",
              background: "#10b981",
            },
            {
              href: "https://securecodereviews.com/shieldx/pricing",
              label: "Review ShieldX Plans",
              background: "#0f172a",
            },
          ]
        : [
            {
              href: "https://securecodereviews.com/tools",
              label: "Security Tools",
              background: "#10b981",
            },
            {
              href: "https://securecodereviews.com/blog",
              label: "Security Blog",
              background: "#0f172a",
            },
            {
              href: "https://securecodereviews.com/owasp/top-10",
              label: "OWASP Top 10",
              background: "#1e40af",
            },
          ];

      await transporter.sendMail({
        from: `"SecureCodeReviews" <${senderEmail}>`,
        to: cleanEmail,
        subject: autoReplySubject,
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          </head>
          <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Segoe UI', Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background: #ffffff;">
              <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 32px 24px; text-align: center;">
                <img src="https://securecodereviews.com/android-chrome-192x192.png" alt="SecureCodeReviews" width="64" height="64" style="border-radius: 12px; margin-bottom: 12px;" />
                <h1 style="color: #10b981; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">SecureCodeReviews</h1>
                <p style="color: #94a3b8; margin: 4px 0 0; font-size: 13px;">Application Security Platform</p>
              </div>
              <div style="height: 3px; background: linear-gradient(90deg, #10b981, #059669);"></div>
              <div style="padding: 32px 24px;">
                <p style="color: #1e293b; font-size: 16px; line-height: 1.5; margin: 0 0 8px;">Hi ${safeName},</p>
                <p style="color: #475569; font-size: 14px; line-height: 1.7; margin: 0 0 20px;">
                  ${autoReplyIntro}
                </p>
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 0 0 24px;">
                  <h3 style="color: #0f172a; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
                    Your Message Summary
                  </h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 6px 0; color: #64748b; font-size: 13px; width: 80px; vertical-align: top;">Subject:</td>
                      <td style="padding: 6px 0; color: #1e293b; font-size: 13px; font-weight: 600;">${safeSubject}</td>
                    </tr>
                    ${
                      planLabel
                        ? `
                    <tr>
                      <td style="padding: 6px 0; color: #64748b; font-size: 13px; vertical-align: top;">Plan:</td>
                      <td style="padding: 6px 0; color: #1e293b; font-size: 13px; font-weight: 600;">${planLabel}</td>
                    </tr>
                    `
                        : ""
                    }
                    <tr>
                      <td style="padding: 6px 0; color: #64748b; font-size: 13px; vertical-align: top;">Date:</td>
                      <td style="padding: 6px 0; color: #1e293b; font-size: 13px;">${new Date().toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #64748b; font-size: 13px; vertical-align: top;">Status:</td>
                      <td style="padding: 6px 0;">
                        <span style="background: #dcfce7; color: #166534; font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 12px;">Received</span>
                      </td>
                    </tr>
                  </table>
                </div>
                <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 0 0 24px;">
                  <h4 style="color: #166534; font-size: 14px; margin: 0 0 8px;">What to Expect</h4>
                  <ul style="color: #475569; font-size: 13px; line-height: 1.8; margin: 0; padding-left: 18px;">
                    ${autoReplyExpectations
                      .map((item) => `<li>${escapeHtml(item)}</li>`)
                      .join("")}
                  </ul>
                </div>
                <div style="text-align: center; margin: 0 0 24px;">
                  ${autoReplyCtas
                    .map(
                      (cta) => `
                    <a href="${cta.href}" style="display: inline-block; background: ${cta.background}; color: #ffffff; text-decoration: none; padding: 10px 24px; border-radius: 6px; font-size: 13px; font-weight: 600; margin: 0 6px 8px;">${cta.label}</a>
                  `
                    )
                    .join("")}
                </div>
              </div>
              <div style="background: #0f172a; padding: 24px; text-align: center;">
                <img src="https://securecodereviews.com/android-chrome-192x192.png" alt="SCR" width="32" height="32" style="border-radius: 6px; margin-bottom: 8px;" />
                <p style="color: #94a3b8; font-size: 12px; margin: 0 0 4px;">
                  <strong style="color: #10b981;">SecureCodeReviews</strong> - Application Security Platform
                </p>
                <p style="color: #64748b; font-size: 11px; margin: 0 0 12px;">
                  <a href="https://securecodereviews.com" style="color: #10b981; text-decoration: none;">securecodereviews.com</a>
                  &nbsp;|&nbsp;
                  <a href="mailto:${supportEmail}" style="color: #10b981; text-decoration: none;">${supportEmail}</a>
                </p>
                <div style="border-top: 1px solid #1e293b; padding-top: 12px; margin-top: 4px;">
                  <p style="color: #475569; font-size: 10px; margin: 0; line-height: 1.5;">
                    This is an automated confirmation email. Please do not reply to this message directly.<br />
                    &copy; ${new Date().getFullYear()} SecureCodeReviews. All rights reserved.
                  </p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      emailSent = true;
    } catch (err) {
      emailError = err instanceof Error ? err.message : "SMTP connection failed";
      console.error("Email sending error:", emailError);
    }

    if (contactDoc) {
      try {
        await Contact.findByIdAndUpdate(
          contactDoc._id,
          {
            emailSent,
            emailError: emailError || null,
          },
          { new: true }
        );
      } catch (err) {
        console.error("Failed to update contact status:", err);
      }
    }

    return NextResponse.json({
      success: true,
      message: emailSent
        ? "Message sent successfully"
        : "Message received but email notification failed. Your message has been saved and we will get back to you.",
      emailSent,
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      {
        error:
          "Failed to process your message. Please try again or email us directly at support@securecodereviews.com",
      },
      { status: 500 }
    );
  }
}
