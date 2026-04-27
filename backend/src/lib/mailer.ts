import nodemailer from 'nodemailer';
import { config } from '../config/config.js';

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.port === 465,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
});


const resetPasswordTemplate = (employeeName: string, resetLink: string): string => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
    <h2>Hello, ${employeeName}</h2>
    <p>You requested a password reset.</p>
    <a href="${resetLink}"
       style="display:inline-block;padding:12px 24px;background:#4F46E5;color:#fff;text-decoration:none;border-radius:6px;">
      Reset Password
    </a>
    <p>This link expires in <b>30 minutes</b>.</p>
    <p>If you didn't request this, ignore this email.</p>
    <hr />
    <small style="color: #888;">Exit Management System</small>
  </div>
`;

const accountSetupTemplate = (employeeName: string, username: string, setupLink: string): string => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
    <h2>Welcome, ${employeeName}!</h2>
    <p>Your account has been created. Your username is:</p>
    <div style="background:#f4f4f4;padding:16px;border-radius:8px;margin:16px 0;">
      <b>${username}</b>
    </div>
    <p>Please click the button below to set your password:</p>
    <a href="${setupLink}"
       style="display:inline-block;padding:12px 24px;background:#4F46E5;color:#fff;text-decoration:none;border-radius:6px;">
      Set My Password
    </a>
    <p>This link expires in <b>24 hours</b>.</p>
    <hr />
    <small style="color: #888;">Exit Management System</small>
  </div>
`;


export const sendResetEmail = async (
  toEmail: string,
  employeeName: string,
  resetToken: string
): Promise<void> => {
  const resetLink = `${config.clientUrl}/reset-password?token=${resetToken}`;
  await transporter.sendMail({
    from: config.smtp.from,
    to: toEmail,
    subject: 'Password Reset Request',
    html: resetPasswordTemplate(employeeName, resetLink),
  });
};

export const sendAccountSetupEmail = async (
  toEmail: string,
  employeeName: string,
  username: string,
  token: string
): Promise<void> => {
  const setupLink = `${config.clientUrl}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: config.smtp.from,
    to: toEmail,
    subject: 'Your Account Has Been Created',
    html: accountSetupTemplate(employeeName, username, setupLink),
  });
};