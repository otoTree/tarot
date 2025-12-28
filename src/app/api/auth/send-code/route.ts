import { NextResponse } from 'next/server';
import { db } from '@/db';
import { emailVerifications, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { randomInt } from 'crypto';
import nodemailer from 'nodemailer';

// Initialize SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    // Check rate limit (10 minutes)
    const existingVerification = await db.query.emailVerifications.findFirst({
      where: eq(emailVerifications.email, email),
    });

    if (existingVerification) {
      const now = new Date();
      const lastSent = new Date(existingVerification.sentAt);
      const diff = now.getTime() - lastSent.getTime();
      
      // 10 minutes in milliseconds
      if (diff < 10 * 60 * 1000) {
        return NextResponse.json({ error: 'Please wait 10 minutes before sending another code' }, { status: 429 });
      }
    }

    // Generate 6-digit code
    const code = randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes validity

    // Upsert verification code
    await db.insert(emailVerifications).values({
      email,
      code,
      sentAt: new Date(),
      expiresAt,
    }).onConflictDoUpdate({
      target: emailVerifications.email,
      set: {
        code,
        sentAt: new Date(),
        expiresAt,
      },
    });

    // Send email using Nodemailer
    const mailOptions = {
      from: process.env.SMTP_FROM || '"Lumin Tarot" <noreply@example.com>',
      to: email,
      subject: 'Your Verification Code - Lumin Tarot',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Welcome to Lumin Tarot</h1>
          <p>Your verification code is:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #000;">${code}</span>
          </div>
          <p>This code will expire in 30 minutes.</p>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">If you didn't request this code, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    console.log(`[Email Service] Verification code sent to ${email}`);

    return NextResponse.json({ success: true, message: 'Verification code sent' });
  } catch (error) {
    console.error('Send code error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
