import nodemailer from "nodemailer";

const domain = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

// Standard SMTP configuration
const port = Number(process.env.SMTP_PORT) || 587;
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: port,
  secure: port === 465,
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendPasswordResetEmail = async (
  email: string,
  token: string,
) => {
  const resetLink = `${domain}/reset-password?token=${token}`;

  try {
    // For seamless local testing, if SMTP is not configured, just log the link
    if (!process.env.SMTP_HOST) {
      console.log("=========================================");
      console.log("🚧 LOCAL TESTING MODE: Password Reset Link 🚧");
      console.log(resetLink);
      console.log("=========================================");
      return true;
    }

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"Portfolio.OS" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Reset your password",
      html: `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>You recently requested to reset your password for your Portfolio.OS account.</p>
          <p>Click the link below to reset it. This link will expire in 1 hour.</p>
          <div style="margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">If you didn't request a password reset, you can safely ignore this email.</p>
          <hr style="border-top: 1px solid #eaeaea; margin: 30px 0;" />
          <p style="color: #888; font-size: 12px;">Alternatively, paste this URL into your browser:<br/>${resetLink}</p>
        </div>
      `,
    });
    console.log("Message sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return false;
  }
};
