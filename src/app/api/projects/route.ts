import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { projects } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const activeOnly = searchParams.get('activeOnly') !== 'false';
    const conditions = [];
    if (category) conditions.push(eq(projects.category, category as any));
    if (activeOnly) conditions.push(eq(projects.isActive, true));
    const result = conditions.length > 0
      ? await db.select().from(projects).where(conditions.length === 1 ? conditions[0] : and(...conditions)).orderBy(projects.createdAt)
      : await db.select().from(projects).orderBy(projects.createdAt);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as any).role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const [project] = await db.insert(projects).values(body).returning();
    return NextResponse.json(project);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
