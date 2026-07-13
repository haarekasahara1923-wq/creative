import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { projects, projectMedia } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { cloudinary } from '@/lib/cloudinary';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const [project] = await db.select().from(projects).where(eq(projects.id, Number(params.id))).limit(1);
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const media = await db.select().from(projectMedia).where(eq(projectMedia.projectId, project.id)).orderBy(projectMedia.displayOrder);
    return NextResponse.json({ ...project, media });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session || (session.user as any).role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const { updatedAt, createdAt, id, ...updateData } = body;
    const [updated] = await db.update(projects).set({ ...updateData, updatedAt: new Date() }).where(eq(projects.id, Number(params.id))).returning();
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session || (session.user as any).role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const [project] = await db.select().from(projects).where(eq(projects.id, Number(params.id))).limit(1);
    if (project?.coverImagePublicId) await cloudinary.uploader.destroy(project.coverImagePublicId).catch(console.error);
    await db.delete(projects).where(eq(projects.id, Number(params.id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
