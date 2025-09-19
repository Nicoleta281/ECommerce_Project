import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';

export async function GET(
  req: Request,
  context: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await context.params;
    const { searchParams } = new URL(req.url);
    
    const categoryId = searchParams.get('categoryId') || undefined;
    const colorId = searchParams.get('colorId') || undefined;
    const sizeId = searchParams.get('sizeId') || undefined;
    const isFeatured = searchParams.get('isFeatured') || undefined;

    if (!storeId) {
      return new NextResponse('Store id is required', { status: 400 });
    }

    const products = await prismadb.product.findMany({
      where: {
        storeId: storeId,
        categoryId: categoryId,
        colorId: colorId,
        sizeId: sizeId,
        isFeatured: isFeatured ? true : undefined,
        isArchived: false,
      },
      include: {
        images: true,
        category: true,
        color: true,
        size: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.log('[PUBLIC_PRODUCTS_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
