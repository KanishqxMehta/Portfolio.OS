import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Log the submission regardless
    console.log("=== CONTACT FORM ===");
    console.log("From:", name, "<" + email + ">");
    console.log("Subject:", subject);
    console.log("Message:", message);

    // Attempt to send email — never fails the request
    const smtpPass = process.env.SMTP_PASS;
    const smtpUser = process.env.SMTP_USER;
    if (smtpPass?.length && smtpUser?.length) {
      try {
        const nodemailer = await import("nodemailer");
        const transporter = nodemailer.default.createTransport({
          host: process.env.SMTP_HOST || "smtp.gmail.com",
          port: Number(process.env.SMTP_PORT) || 587,
          secure: false,
          auth: { user: smtpUser, pass: smtpPass },
        });

        await transporter.sendMail({
          from: `"Portfolio.os Contact" <${smtpUser}>`,
          to: process.env.CONTACT_EMAIL,
          replyTo: email,
          subject: `[Portfolio.os] ${subject}`,
          text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <p style="font-size: 14px; color: #555;"><strong>Name:</strong> ${name}</p>
              <p style="font-size: 14px; color: #555;"><strong>Email:</strong> ${email}</p>
              <p style="font-size: 14px; color: #555;"><strong>Subject:</strong> ${subject}</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="font-size: 14px; color: #333; line-height: 1.6;">${message.replace(/\n/g, "<br/>")}</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="font-size: 12px; color: #999;">Sent via Portfolio.os contact form</p>
            </div>
          `,
        });
      } catch (mailError) {
        // Email failed but don't break the request
        console.error("EMAIL_SEND_FAILED (non-blocking):", mailError);
      }
    }

    return NextResponse.json(
      { message: "Message sent successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("CONTACT_FORM_ERROR:", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again later." },
      { status: 500 }
    );
  }
}
