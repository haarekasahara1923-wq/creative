import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { leads, commissions, brokers, projects } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { sendCommissionEarnedToBroker } from '@/lib/resend';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session || (session.user as any).role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const { status, commissionAmount } = body;
    const leadId = Number(params.id);
    const [currentLead] = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);
    if (!currentLead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    const [updatedLead] = await db.update(leads).set({ status }).where(eq(leads.id, leadId)).returning();
    if (status === 'converted' && currentLead.brokerId && commissionAmount) {
      const [existingCommission] = await db.select().from(commissions).where(eq(commissions.leadId, leadId)).limit(1);
      if (!existingCommission) {
        await db.insert(commissions).values({ brokerId: currentLead.brokerId, projectId: currentLead.projectId!, leadId, amount: String(commissionAmount), status: 'pending' });
        const [broker] = await db.select().from(brokers).where(eq(brokers.id, currentLead.brokerId)).limit(1);
        const [project] = await db.select().from(projects).where(eq(projects.id, currentLead.projectId!)).limit(1);
        if (broker && project) sendCommissionEarnedToBroker({ brokerEmail: broker.email, brokerName: broker.name || 'Broker', projectName: project.name, amount: Number(commissionAmount) }).catch(console.error);
      }
    }
    return NextResponse.json(updatedLead);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session || (session.user as any).role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await db.delete(leads).where(eq(leads.id, Number(params.id)));
  return NextResponse.json({ success: true });
}
