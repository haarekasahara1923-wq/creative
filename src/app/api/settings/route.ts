import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { siteSettings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const [settings] = await db.select().from(siteSettings).limit(1);
    return NextResponse.json(settings || {});
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as any).role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const [existing] = await db.select().from(siteSettings).limit(1);
    let result;
    if (existing) {
      [result] = await db.update(siteSettings).set({ ...body, updatedAt: new Date() }).where(eq(siteSettings.id, existing.id)).returning();
    } else {
      [result] = await db.insert(siteSettings).values(body).returning();
    }
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
