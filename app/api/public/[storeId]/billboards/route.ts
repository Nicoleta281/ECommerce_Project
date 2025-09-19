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

    const billboards = await prismadb.billboard.findMany({
      where: { 
        storeId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(billboards);
  } catch (error) {
    console.log('[PUBLIC_BILLBOARDS_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
