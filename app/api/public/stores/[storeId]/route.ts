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

    const store = await prismadb.store.findUnique({
      where: { 
        id: storeId,
      },
    });

    if (!store) {
      return new NextResponse('Store not found', { status: 404 });
    }

    return NextResponse.json(store);
  } catch (error) {
    console.log('[PUBLIC_STORE_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
