import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { projectMedia } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { cloudinary } from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as any).role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const [media] = await db.insert(projectMedia).values(body).returning();
  return NextResponse.json(media);
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as any).role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id, publicId } = await req.json();
  if (publicId) await cloudinary.uploader.destroy(publicId).catch(console.error);
  await db.delete(projectMedia).where(eq(projectMedia.id, id));
  return NextResponse.json({ success: true });
}
