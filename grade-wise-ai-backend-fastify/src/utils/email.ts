import nodemailer from "nodemailer";

function createTransport() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env["EMAIL_USER"],
      pass: process.env["EMAIL_PASS"],
    },
  });
}

export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string
): Promise<void> {
  const frontendUrl = process.env["FRONTEND_URL"]?.split(",")[0] ?? "http://localhost:3000";
  const verifyUrl = `${frontendUrl}/verify-email?token=${token}`;

  const transporter = createTransport();
  await transporter.sendMail({
    from: `"GradeWise AI" <${process.env["EMAIL_USER"]}>`,
    to: email,
    subject: "Verify your GradeWise AI account",
    html: `
      <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#4f46e5">Welcome to GradeWise AI, ${name}!</h2>
        <p>Click the button below to verify your email address.</p>
        <a href="${verifyUrl}"
           style="display:inline-block;padding:12px 24px;background:#4f46e5;color:#fff;
                  border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">
          Verify Email
        </a>
        <p style="color:#6b7280;font-size:14px">
          Or copy this link: <a href="${verifyUrl}">${verifyUrl}</a>
        </p>
        <p style="color:#6b7280;font-size:12px">This link expires in 24 hours.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetId: string
): Promise<void> {
  const frontendUrl = process.env["FRONTEND_URL"]?.split(",")[0] ?? "http://localhost:3000";
  const resetUrl = `${frontendUrl}/reset-password/${resetId}`;

  const transporter = createTransport();
  await transporter.sendMail({
    from: `"GradeWise AI" <${process.env["EMAIL_USER"]}>`,
    to: email,
    subject: "Reset your GradeWise AI password",
    html: `
      <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#4f46e5">Password Reset Request</h2>
        <p>Hi ${name}, click below to set a new password.</p>
        <a href="${resetUrl}"
           style="display:inline-block;padding:12px 24px;background:#4f46e5;color:#fff;
                  border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">
          Reset Password
        </a>
        <p style="color:#6b7280;font-size:14px">
          Or copy this link: <a href="${resetUrl}">${resetUrl}</a>
        </p>
        <p style="color:#6b7280;font-size:12px">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
}
