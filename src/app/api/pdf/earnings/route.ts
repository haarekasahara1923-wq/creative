import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { commissions, projects, brokers } from '@/lib/db/schema';
import { eq, sum } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const sessionRole = (session.user as any).role;
  const sessionId = session.user?.id;
  const { searchParams } = new URL(req.url);
  const brokerId = searchParams.get('brokerId');
  if (!brokerId) return NextResponse.json({ error: 'brokerId required' }, { status: 400 });
  if (sessionRole === 'broker' && sessionId !== brokerId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  try {
    const [broker] = await db.select().from(brokers).where(eq(brokers.id, Number(brokerId))).limit(1);
    if (!broker) return NextResponse.json({ error: 'Broker not found' }, { status: 404 });
    const earningsData = await db.select({
      projectName: projects.name,
      commissionRate: projects.commissionRate,
      totalAmount: sum(commissions.amount),
      status: commissions.status,
    }).from(commissions)
      .leftJoin(projects, eq(commissions.projectId, projects.id))
      .where(eq(commissions.brokerId, Number(brokerId)))
      .groupBy(projects.name, projects.commissionRate, commissions.status);
    const totalEarned = earningsData.reduce((acc, row) => acc + Number(row.totalAmount || 0), 0);
    // Return JSON for client-side PDF generation
    return NextResponse.json({
      broker: { id: broker.id, name: broker.name, email: broker.email },
      earnings: earningsData,
      totalEarned,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}
