import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withdrawalRequests, brokers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { sendWithdrawalRequestToAdmin } from '@/lib/resend';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const sessionRole = (session.user as any).role;
  const sessionId = session.user?.id;
  try {
    if (sessionRole === 'admin') {
      const all = await db.select({
        id: withdrawalRequests.id, amount: withdrawalRequests.amount, status: withdrawalRequests.status,
        note: withdrawalRequests.note, requestedAt: withdrawalRequests.requestedAt,
        processedAt: withdrawalRequests.processedAt, brokerId: withdrawalRequests.brokerId,
        brokerName: brokers.name, brokerEmail: brokers.email,
      }).from(withdrawalRequests).leftJoin(brokers, eq(withdrawalRequests.brokerId, brokers.id)).orderBy(withdrawalRequests.requestedAt);
      return NextResponse.json(all);
    } else {
      const myRequests = await db.select().from(withdrawalRequests).where(eq(withdrawalRequests.brokerId, Number(sessionId))).orderBy(withdrawalRequests.requestedAt);
      return NextResponse.json(myRequests);
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch withdrawals' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as any).role !== 'broker') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const brokerId = Number(session.user?.id);
  try {
    const body = await req.json();
    const { amount, note } = body;
    if (!amount || Number(amount) <= 0) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    const [request] = await db.insert(withdrawalRequests).values({ brokerId, amount: String(amount), note }).returning();
    const [broker] = await db.select().from(brokers).where(eq(brokers.id, brokerId)).limit(1);
    if (broker) sendWithdrawalRequestToAdmin({ brokerName: broker.name || broker.email, brokerEmail: broker.email, amount: Number(amount) }).catch(console.error);
    return NextResponse.json(request);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create withdrawal request' }, { status: 500 });
  }
}
