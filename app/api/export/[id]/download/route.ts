import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSessionUser } from '@/lib/server-session';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSessionUser();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  if (!id) return NextResponse.json({ error: 'Export ID required' }, { status: 400 });

  const record = await prisma.exportRecord.findUnique({ where: { id } });
  if (!record) return NextResponse.json({ error: 'Export record not found' }, { status: 404 });

  const fileData = (record as { fileData?: Buffer | null }).fileData;
  if (!fileData) {
    return NextResponse.json(
      { error: 'Binary file not retained for this export. Re-export to download again.' },
      { status: 410 },
    );
  }

  await prisma.exportRecord.update({
    where: { id },
    data: { downloadCount: { increment: 1 } } as never,
  });

  return new NextResponse(new Uint8Array(fileData), {
    status: 200,
    headers: {
      'Content-Type': record.mimeType,
      'Content-Disposition': `attachment; filename="${record.fileName}"`,
      'X-Export-Id': record.id,
      'X-File-Checksum': (record as { fileChecksum?: string | null }).fileChecksum ?? '',
      'X-File-Size': String((record as { fileSizeBytes?: number | null }).fileSizeBytes ?? fileData.length),
    },
  });
}
