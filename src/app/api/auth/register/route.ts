import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '@/db';
import { users, emailVerifications } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { signSession, setSessionCookie } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, password, code, inviteCode } = await req.json();

    if (!email || !password || !code) {
      return NextResponse.json({ error: 'Missing email, password, or verification code' }, { status: 400 });
    }

    // Verify code
    const verification = await db.query.emailVerifications.findFirst({
      where: and(
        eq(emailVerifications.email, email),
        eq(emailVerifications.code, code)
      ),
    });

    if (!verification) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
    }

    if (new Date() > verification.expiresAt) {
      return NextResponse.json({ error: 'Verification code expired' }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    // Find inviter if invite code is provided
    let invitedBy: number | null = null;
    if (inviteCode) {
      const inviter = await db.query.users.findFirst({
        where: eq(users.invitationCode, inviteCode),
      });
      if (inviter) {
        invitedBy = inviter.id;
      }
    }

    // Generate unique invitation code for new user
    const newInvitationCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    // Hash password
    const passwordHash = await hash(password, 10);

    // Create user
    const [newUser] = await db.insert(users).values({
      email,
      password: passwordHash,
      creditBalance: 10, // Default credits
      creditsExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days validity
      invitationCode: newInvitationCode,
      invitedBy: invitedBy,
    }).returning();

    // Delete verification code after successful registration
    await db.delete(emailVerifications).where(eq(emailVerifications.email, email));

    // Reward inviter if exists
    if (invitedBy) {
      await db.update(users)
        .set({
          creditBalance: sql`${users.creditBalance} + 10`
        })
        .where(eq(users.id, invitedBy));
    }

    // Create session
    const token = await signSession({ userId: newUser.id, email: newUser.email });
    setSessionCookie(token);

    return NextResponse.json({
      user: {
        id: newUser.id,
        email: newUser.email,
        creditBalance: newUser.creditBalance,
        plan: newUser.plan,
        aiReadingsUsage: newUser.aiReadingsUsage,
        consultationUsage: newUser.consultationUsage,
        invitationCode: newUser.invitationCode,
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
