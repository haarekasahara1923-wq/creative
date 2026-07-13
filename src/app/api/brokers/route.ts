import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { brokers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { generateAffiliateCode } from '@/lib/utils';
import { sendBrokerWelcomeEmail } from '@/lib/resend';

export async function GET() {
  try {
    const allBrokers = await db.select().from(brokers).orderBy(brokers.createdAt);
    return NextResponse.json(allBrokers);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch brokers' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;
    if (!email || !password) return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    if (password.length < 6) return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    const [existing] = await db.select().from(brokers).where(eq(brokers.email, email)).limit(1);
    if (existing) return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    const passwordHash = await bcrypt.hash(password, 12);
    const affiliateCode = generateAffiliateCode();
    const [broker] = await db.insert(brokers).values({ email, passwordHash, affiliateCode }).returning();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    sendBrokerWelcomeEmail({ brokerEmail: broker.email, brokerName: broker.name || 'Partner', affiliateCode: broker.affiliateCode, appUrl }).catch(console.error);
    return NextResponse.json({ success: true, brokerId: broker.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create broker account' }, { status: 500 });
  }
}
