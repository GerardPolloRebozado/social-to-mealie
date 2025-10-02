import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const GET = async () => {
  try {
    const [history, count] = await Promise.all([
      prisma.processedUrl.findMany({
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.processedUrl.count()
    ]);

    return NextResponse.json({ history, count });
  } catch (error) {
    console.error('Failed to fetch history:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch history' },
      { status: 500 }
    );
  }
};

export const DELETE = async (request: Request) => {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await prisma.processedUrl.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete history entry:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete history entry' },
      { status: 500 }
    );
  }
};
