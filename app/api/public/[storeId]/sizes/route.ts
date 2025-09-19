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

    const sizes = await prismadb.size.findMany({
      where: { 
        storeId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(sizes);
  } catch (error) {
    console.log('[PUBLIC_SIZES_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
