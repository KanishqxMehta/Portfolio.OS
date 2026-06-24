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

    // Log regardless
    console.log("=== CONTACT FORM ===");
    console.log("From:", name, "<" + email + ">");
    console.log("Subject:", subject);
    console.log("Message:", message);

    // Send email only if SMTP is configured
    if (process.env.SMTP_PASS) {
      const nodemailer = await import("nodemailer");
      const port = Number(process.env.SMTP_PORT) || 587;
      const transporter = nodemailer.default.createTransport({
        host: process.env.SMTP_HOST,
        port: port,
        secure: port === 465, // SSL/TLS port 465 requires secure: true, STARTTLS port 587 requires secure: false
        connectionTimeout: 10000, // 10 seconds timeout for handshakes in serverless env
        greetingTimeout: 10000,
        socketTimeout: 10000,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: `"Portfolio.os Contact" <${process.env.SMTP_USER}>`,
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
