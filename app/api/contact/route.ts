import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import connectDB from "@/lib/mongodb";
import Contact from "@/models/Contact";
import { rateLimit, getClientIP } from "@/lib/rate-limit";

// Check if MongoDB is configured
const isMongoConfigured = !!process.env.MONGODB_URI;
const isSmtpConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_PASSWORD);

export async function POST(request: Request) {
  try {
    // Rate limiting: 5 submissions per 10 minutes per IP
    const clientIP = getClientIP(request);
    const rateLimitResult = rateLimit(`contact:${clientIP}`, {
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

    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validate input
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitize = (str: string) =>
      str.replace(/<[^>]*>/g, "").trim().slice(0, 5000);

    const cleanName = sanitize(name);
    const cleanSubject = sanitize(subject);
    const cleanMessage = sanitize(message);

    // Check MongoDB configuration
    if (!isMongoConfigured) {
      console.error("MongoDB not configured - MONGODB_URI missing");
      // Fall through to email-only mode if SMTP is configured
      if (!isSmtpConfigured) {
        return NextResponse.json(
          { error: "Contact form is not configured. Please email us directly at support@securecodereviews.com" },
          { status: 503 }
        );
      }
    }

    let contactDoc = null;
    
    // Save to MongoDB if configured
    if (isMongoConfigured) {
      try {
        await connectDB();
        contactDoc = await Contact.create({
          name: cleanName,
          email,
          subject: cleanSubject,
          message: cleanMessage,
          status: "new",
        });
      } catch (dbError) {
        console.error("Database error:", dbError);
        // Continue without DB if email is configured
        if (!isSmtpConfigured) {
          return NextResponse.json(
            { error: "Failed to save your message. Please try again." },
            { status: 500 }
          );
        }
      }
    }

    // Configure SMTP transport
    // For Hostinger: use Hostinger's SMTP settings
    // smtp.hostinger.com, port 465 (SSL) or 587 (TLS)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.hostinger.com",
      port: parseInt(process.env.SMTP_PORT || "465"),
      secure: process.env.SMTP_SECURE !== "false", // true for 465
      auth: {
        user: process.env.SMTP_USER || "support@securecodereviews.com",
        pass: process.env.SMTP_PASSWORD || "",
      },
    });

    // Send email notification to admin
    let emailSent = false;
    let emailError = null;

    try {
      await transporter.sendMail({
        from: `"SecureCodeReviews" <${process.env.SMTP_USER || "support@securecodereviews.com"}>`,
        to: "support@securecodereviews.com",
        replyTo: email,
        subject: `[SCR Contact] ${cleanSubject}`,
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
          <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Segoe UI', Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background: #ffffff;">
              <div style="background: #0f172a; padding: 20px 24px; border-radius: 8px 8px 0 0;">
                <table style="width: 100%;">
                  <tr>
                    <td>
                      <img src="https://securecodereviews.com/android-chrome-192x192.png" alt="SCR" width="36" height="36" style="border-radius: 6px; vertical-align: middle; margin-right: 12px;" />
                      <span style="color: #10b981; font-size: 18px; font-weight: 700; vertical-align: middle;">New Contact Submission</span>
                    </td>
                    <td style="text-align: right;">
                      <span style="background: #10b981; color: white; font-size: 11px; font-weight: 600; padding: 4px 12px; border-radius: 12px;">NEW</span>
                    </td>
                  </tr>
                </table>
              </div>
              <div style="height: 3px; background: #10b981;"></div>
              <div style="padding: 24px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 10px 0; color: #64748b; font-size: 13px; width: 80px; border-bottom: 1px solid #f1f5f9;">Name:</td>
                    <td style="padding: 10px 0; color: #1e293b; font-size: 14px; font-weight: 600; border-bottom: 1px solid #f1f5f9;">${cleanName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #64748b; font-size: 13px; border-bottom: 1px solid #f1f5f9;">Email:</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;"><a href="mailto:${email}" style="color: #10b981; font-size: 14px; font-weight: 600; text-decoration: none;">${email}</a></td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #64748b; font-size: 13px; border-bottom: 1px solid #f1f5f9;">Subject:</td>
                    <td style="padding: 10px 0; color: #1e293b; font-size: 14px; font-weight: 600; border-bottom: 1px solid #f1f5f9;">${cleanSubject}</td>
                  </tr>
                </table>
                <h3 style="color: #0f172a; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; margin: 20px 0 8px;">Message:</h3>
                <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; color: #334155; font-size: 14px; white-space: pre-wrap; line-height: 1.6;">
${cleanMessage}
                </div>
                <div style="margin-top: 20px; text-align: center;">
                  <a href="mailto:${email}?subject=Re: ${encodeURIComponent(cleanSubject)}" style="display: inline-block; background: #10b981; color: white; text-decoration: none; padding: 10px 28px; border-radius: 6px; font-size: 13px; font-weight: 600;">↩ Reply to ${cleanName}</a>
                </div>
                <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 16px 0 0;">
                  Received: ${new Date().toISOString()} · SecureCodeReviews Contact Form
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `New Contact Form Submission\n\nName: ${cleanName}\nEmail: ${email}\nSubject: ${cleanSubject}\n\nMessage:\n${cleanMessage}\n\n---\nSent from SecureCodeReviews.com Contact Form`,
      });

      // Send auto-reply to the user
      await transporter.sendMail({
        from: `"SecureCodeReviews" <${process.env.SMTP_USER || "support@securecodereviews.com"}>`,
        to: email,
        subject: `Re: ${cleanSubject} — We've received your message`,
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
          <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Segoe UI', Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background: #ffffff;">
              <!-- Header with logo -->
              <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 32px 24px; text-align: center;">
                <img src="https://securecodereviews.com/android-chrome-192x192.png" alt="SecureCodeReviews" width="64" height="64" style="border-radius: 12px; margin-bottom: 12px;" />
                <h1 style="color: #10b981; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">SecureCodeReviews</h1>
                <p style="color: #94a3b8; margin: 4px 0 0; font-size: 13px;">Application Security Platform</p>
              </div>

              <!-- Green accent line -->
              <div style="height: 3px; background: linear-gradient(90deg, #10b981, #059669);"></div>

              <!-- Body -->
              <div style="padding: 32px 24px;">
                <p style="color: #1e293b; font-size: 16px; line-height: 1.5; margin: 0 0 8px;">Hi ${cleanName},</p>
                
                <p style="color: #475569; font-size: 14px; line-height: 1.7; margin: 0 0 20px;">
                  Thank you for reaching out to <strong style="color: #10b981;">SecureCodeReviews</strong>. We've successfully received your message and our security team is reviewing it.
                </p>

                <!-- Message summary card -->
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 0 0 24px;">
                  <h3 style="color: #0f172a; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
                    📋 Your Message Summary
                  </h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 6px 0; color: #64748b; font-size: 13px; width: 80px; vertical-align: top;">Subject:</td>
                      <td style="padding: 6px 0; color: #1e293b; font-size: 13px; font-weight: 600;">${cleanSubject}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #64748b; font-size: 13px; vertical-align: top;">Date:</td>
                      <td style="padding: 6px 0; color: #1e293b; font-size: 13px;">${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #64748b; font-size: 13px; vertical-align: top;">Status:</td>
                      <td style="padding: 6px 0;">
                        <span style="background: #dcfce7; color: #166534; font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 12px;">✓ Received</span>
                      </td>
                    </tr>
                  </table>
                </div>

                <!-- What to expect -->
                <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 0 0 24px;">
                  <h4 style="color: #166534; font-size: 14px; margin: 0 0 8px;">⏱ What to Expect</h4>
                  <ul style="color: #475569; font-size: 13px; line-height: 1.8; margin: 0; padding-left: 18px;">
                    <li>Our team will respond within <strong>24 hours</strong> during business days</li>
                    <li>For urgent security matters, reply with <strong>"URGENT"</strong> in the subject</li>
                    <li>Complex security inquiries may take up to 48 hours</li>
                  </ul>
                </div>

                <p style="color: #475569; font-size: 13px; line-height: 1.6; margin: 0 0 24px;">
                  While you wait, explore our free security resources:
                </p>

                <!-- CTA buttons -->
                <div style="text-align: center; margin: 0 0 24px;">
                  <a href="https://securecodereviews.com/tools" style="display: inline-block; background: #10b981; color: #ffffff; text-decoration: none; padding: 10px 24px; border-radius: 6px; font-size: 13px; font-weight: 600; margin: 0 6px 8px;">🛡 Security Tools</a>
                  <a href="https://securecodereviews.com/blog" style="display: inline-block; background: #0f172a; color: #ffffff; text-decoration: none; padding: 10px 24px; border-radius: 6px; font-size: 13px; font-weight: 600; margin: 0 6px 8px;">📖 Security Blog</a>
                  <a href="https://securecodereviews.com/owasp/top-10" style="display: inline-block; background: #1e40af; color: #ffffff; text-decoration: none; padding: 10px 24px; border-radius: 6px; font-size: 13px; font-weight: 600; margin: 0 6px 8px;">🔟 OWASP Top 10</a>
                </div>
              </div>

              <!-- Footer -->
              <div style="background: #0f172a; padding: 24px; text-align: center;">
                <img src="https://securecodereviews.com/android-chrome-192x192.png" alt="SCR" width="32" height="32" style="border-radius: 6px; margin-bottom: 8px;" />
                <p style="color: #94a3b8; font-size: 12px; margin: 0 0 4px;">
                  <strong style="color: #10b981;">SecureCodeReviews</strong> — Application Security Platform
                </p>
                <p style="color: #64748b; font-size: 11px; margin: 0 0 12px;">
                  <a href="https://securecodereviews.com" style="color: #10b981; text-decoration: none;">securecodereviews.com</a>
                  &nbsp;·&nbsp;
                  <a href="mailto:support@securecodereviews.com" style="color: #10b981; text-decoration: none;">support@securecodereviews.com</a>
                </p>
                <div style="border-top: 1px solid #1e293b; padding-top: 12px; margin-top: 4px;">
                  <p style="color: #475569; font-size: 10px; margin: 0; line-height: 1.5;">
                    This is an automated confirmation email. Please do not reply to this message directly.<br>
                    © ${new Date().getFullYear()} SecureCodeReviews. All rights reserved.
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
      const errMsg = err instanceof Error ? err.message : "SMTP connection failed";
      console.error("Email sending error:", errMsg);
      emailError = errMsg;
      // Continue anyway - message is already saved to DB
    }

    // Update contact document with email status (only if saved to DB)
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

    // Return success if message is saved (even if email failed)
    return NextResponse.json({
      success: true,
      message: emailSent 
        ? "Message sent successfully" 
        : "Message received but email notification failed. Your message has been saved and we'll get back to you.",
      emailSent,
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to process your message. Please try again or email us directly at support@securecodereviews.com" },
      { status: 500 }
    );
  }
}
