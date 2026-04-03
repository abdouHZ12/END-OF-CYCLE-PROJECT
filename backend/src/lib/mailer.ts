import nodemailer from "nodemailer";
import { config } from "../config/config.js";


export const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.port === 465,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
});


export const sendResetEmail = async (
  toEmail: string,
  employeeName: string,
  resetToken: string
) => {
  const resetLink = `${config.clientUrl}/reset-password?token=${resetToken}`;

  await transporter.sendMail({
    from: config.smtp.from,
    to: toEmail,
    subject: "🔐 Password Reset Request",
    html: resetPasswordTemplate(employeeName, resetLink),
  });
};


const resetPasswordTemplate = (
  employeeName: string,
  resetLink: string
) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
    <h2>Hello, ${employeeName}</h2>

    <p>You requested a password reset.</p>

    <a href="${resetLink}"
       style="display:inline-block;padding:12px 24px;background:#4F46E5;color:#fff;text-decoration:none;border-radius:6px;">
      Reset Password
    </a>

    <p>This link expires in <b>1 hour</b>.</p>

    <p>If you didn't request this, ignore this email.</p>

    <hr />
    <small style="color: #888;">Exit Management System</small>
  </div>
`;