import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { brokers, commissions, projects, leads, withdrawalRequests } from '@/lib/db/schema';
import { eq, sum } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const sessionRole = (session.user as any).role;
  const sessionId = session.user?.id;
  if (sessionRole === 'broker' && sessionId !== params.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  try {
    const [broker] = await db.select().from(brokers).where(eq(brokers.id, Number(params.id))).limit(1);
    if (!broker) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const commissionData = await db.select({
      projectId: commissions.projectId, projectName: projects.name,
      commissionRate: projects.commissionRate, totalAmount: sum(commissions.amount), status: commissions.status,
    }).from(commissions).leftJoin(projects, eq(commissions.projectId, projects.id))
      .where(eq(commissions.brokerId, Number(params.id)))
      .groupBy(commissions.projectId, projects.name, projects.commissionRate, commissions.status);
    const leadsData = await db.select().from(leads).where(eq(leads.brokerId, Number(params.id)));
    const withdrawals = await db.select().from(withdrawalRequests).where(eq(withdrawalRequests.brokerId, Number(params.id))).orderBy(withdrawalRequests.requestedAt);
    const { passwordHash, ...safebroker } = broker;
    return NextResponse.json({ ...safebroker, commissions: commissionData, leads: leadsData, withdrawals });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch broker' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const sessionRole = (session.user as any).role;
  const sessionId = session.user?.id;
  if (sessionRole === 'broker' && sessionId !== params.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  try {
    const body = await req.json();
    const { passwordHash, id, createdAt, affiliateCode, ...updateData } = body;
    const [updated] = await db.update(brokers).set(updateData).where(eq(brokers.id, Number(params.id))).returning();
    const { passwordHash: _, ...safeBroker } = updated;
    return NextResponse.json(safeBroker);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update broker' }, { status: 500 });
  }
}
