import { NextRequest, NextResponse } from 'next/server';
import { generateSignedUploadParams } from '@/lib/cloudinary';
import { auth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { folder } = await req.json();
  const params = await generateSignedUploadParams(folder || 'creative-group');
  return NextResponse.json(params);
}
