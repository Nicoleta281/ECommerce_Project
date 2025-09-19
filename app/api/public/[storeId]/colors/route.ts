import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';

export async function GET(
  req: Request,
  context: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await context.params;

    if (!storeId) {
      return new NextResponse('Store id is required', { status: 400 });
    }

    const colors = await prismadb.color.findMany({
      where: { 
        storeId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(colors);
  } catch (error) {
    console.log('[PUBLIC_COLORS_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
