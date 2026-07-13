import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { galleryMedia } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { cloudinary } from '@/lib/cloudinary';

export async function GET() {
  try {
    const media = await db.select().from(galleryMedia).orderBy(galleryMedia.createdAt);
    return NextResponse.json(media);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch gallery' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as any).role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const [media] = await db.insert(galleryMedia).values(body).returning();
  return NextResponse.json(media);
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as any).role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id, publicId } = await req.json();
  if (publicId) await cloudinary.uploader.destroy(publicId, { resource_type: 'auto' }).catch(console.error);
  await db.delete(galleryMedia).where(eq(galleryMedia.id, id));
  return NextResponse.json({ success: true });
}
