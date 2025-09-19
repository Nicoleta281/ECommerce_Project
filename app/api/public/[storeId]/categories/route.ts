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

    const categories = await prismadb.category.findMany({
      where: { 
        storeId,
      },
      include: {
        billboard: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.log('[PUBLIC_CATEGORIES_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
