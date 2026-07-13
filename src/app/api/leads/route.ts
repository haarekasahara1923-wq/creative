import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { leads, brokers, projects } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import {
  sendLeadConfirmationToCustomer,
  sendNewLeadToAdmin,
  sendLeadAttributedToBroker,
} from '@/lib/resend';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, contactNo, residence, projectId, affiliateCode, customerEmail } = body;
    if (!name || !contactNo) {
      return NextResponse.json({ error: 'Name and contact are required' }, { status: 400 });
    }
    let brokerId: number | null = null;
    let brokerData: any = null;
    if (affiliateCode) {
      const [broker] = await db.select().from(brokers).where(eq(brokers.affiliateCode, affiliateCode)).limit(1);
      if (broker && broker.status === 'active') { brokerId = broker.id; brokerData = broker; }
    }
    let projectName = 'General Enquiry';
    if (projectId) {
      const [project] = await db.select().from(projects).where(eq(projects.id, Number(projectId))).limit(1);
      if (project) projectName = project.name;
    }
    const [lead] = await db.insert(leads).values({ name, contactNo, residence, projectId: projectId ? Number(projectId) : null, brokerId, status: 'new' }).returning();
    Promise.all([
      sendLeadConfirmationToCustomer({ customerName: name, customerEmail, projectName, contactNo }),
      sendNewLeadToAdmin({ customerName: name, contactNo, residence, projectName, brokerName: brokerData?.name }),
      brokerData ? sendLeadAttributedToBroker({ brokerEmail: brokerData.email, brokerName: brokerData.name || 'Broker', customerName: name, projectName }) : Promise.resolve(),
    ]).catch(console.error);
    return NextResponse.json({ success: true, leadId: lead.id });
  } catch (error) {
    console.error('Lead submission error:', error);
    return NextResponse.json({ error: 'Failed to submit lead' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const allLeads = await db.select({
      id: leads.id, name: leads.name, contactNo: leads.contactNo, residence: leads.residence,
      status: leads.status, createdAt: leads.createdAt, projectName: projects.name,
      brokerName: brokers.name, brokerEmail: brokers.email, projectId: leads.projectId, brokerId: leads.brokerId,
    }).from(leads)
      .leftJoin(projects, eq(leads.projectId, projects.id))
      .leftJoin(brokers, eq(leads.brokerId, brokers.id))
      .orderBy(leads.createdAt);
    return NextResponse.json(allLeads);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}
