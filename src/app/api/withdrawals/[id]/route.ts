import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withdrawalRequests, brokers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { sendWithdrawalStatusToBroker } from '@/lib/resend';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session || (session.user as any).role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const { status } = body;
    const [updated] = await db.update(withdrawalRequests).set({ status, processedAt: ['approved','paid','rejected'].includes(status) ? new Date() : undefined }).where(eq(withdrawalRequests.id, Number(params.id))).returning();
    const [broker] = await db.select().from(brokers).where(eq(brokers.id, updated.brokerId)).limit(1);
    if (broker && ['approved','paid','rejected'].includes(status)) {
      sendWithdrawalStatusToBroker({ brokerEmail: broker.email, brokerName: broker.name || 'Broker', amount: Number(updated.amount), status }).catch(console.error);
    }
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update withdrawal' }, { status: 500 });
  }
}
