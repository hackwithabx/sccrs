import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
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
    await transporter.sendMail({
      from: `"SecureCodeReviews" <${process.env.SMTP_USER || "support@securecodereviews.com"}>`,
      to: "support@securecodereviews.com",
      replyTo: email,
      subject: `[SCR Contact] ${cleanSubject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #10b981; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 20px;">🔒 New Contact Form Submission</h1>
          </div>
          <div style="background: #1a1a2e; padding: 24px; border: 1px solid #333; border-top: none; border-radius: 0 0 8px 8px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #888; width: 100px;">Name:</td>
                <td style="padding: 8px 0; color: #fff;">${cleanName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #888;">Email:</td>
                <td style="padding: 8px 0; color: #10b981;"><a href="mailto:${email}" style="color: #10b981;">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #888;">Subject:</td>
                <td style="padding: 8px 0; color: #fff;">${cleanSubject}</td>
              </tr>
            </table>
            <hr style="border: none; border-top: 1px solid #333; margin: 16px 0;">
            <h3 style="color: #ddd; margin: 0 0 8px 0;">Message:</h3>
            <div style="background: #111; padding: 16px; border-radius: 6px; color: #ccc; white-space: pre-wrap; line-height: 1.6;">
${cleanMessage}
            </div>
            <hr style="border: none; border-top: 1px solid #333; margin: 16px 0;">
            <p style="color: #666; font-size: 12px; margin: 0;">
              Sent from SecureCodeReviews.com Contact Form • ${new Date().toISOString()}
            </p>
          </div>
        </div>
      `,
      text: `New Contact Form Submission\n\nName: ${cleanName}\nEmail: ${email}\nSubject: ${cleanSubject}\n\nMessage:\n${cleanMessage}\n\n---\nSent from SecureCodeReviews.com Contact Form`,
    });

    // Send auto-reply to the user
    await transporter.sendMail({
      from: `"SecureCodeReviews" <${process.env.SMTP_USER || "support@securecodereviews.com"}>`,
      to: email,
      subject: `Re: ${cleanSubject} — We've received your message`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #10b981; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 20px;">🔒 SecureCodeReviews</h1>
          </div>
          <div style="background: #1a1a2e; padding: 24px; border: 1px solid #333; border-top: none; border-radius: 0 0 8px 8px;">
            <p style="color: #ddd; line-height: 1.6;">Hi ${cleanName},</p>
            <p style="color: #ccc; line-height: 1.6;">
              Thank you for contacting SecureCodeReviews. We've received your message and our security team will review it promptly.
            </p>
            <p style="color: #ccc; line-height: 1.6;">
              You can expect a response within 24 hours during business days. For urgent security matters, please indicate &quot;URGENT&quot; in your subject line.
            </p>
            <hr style="border: none; border-top: 1px solid #333; margin: 16px 0;">
            <p style="color: #888; font-size: 13px;">
              Best regards,<br>
              <strong style="color: #10b981;">SecureCodeReviews Team</strong><br>
              <a href="https://securecodereviews.com" style="color: #10b981;">https://securecodereviews.com</a>
            </p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again later." },
      { status: 500 }
    );
  }
}
