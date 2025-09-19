import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';

export async function GET(
  req: Request,
  context: { params: Promise<{ productId: string; storeId: string }> }
) {
  try {
    const { productId, storeId } = await context.params;

    if (!productId) {
      return new NextResponse('Product id is required', { status: 400 });
    }

    if (!storeId) {
      return new NextResponse('Store id is required', { status: 400 });
    }

    const product = await prismadb.product.findUnique({
      where: {
        id: productId,
        storeId: storeId,
        isArchived: false,
      },
      include: {
        images: true,
        category: true,
        color: true,
        size: true,
      },
    });

    if (!product) {
      return new NextResponse('Product not found', { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.log('[PUBLIC_PRODUCT_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
