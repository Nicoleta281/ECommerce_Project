import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prismadb from '@/lib/prismadb';

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = await auth();

    const body = await req.json();
    console.log('Product POST request body:', body);

    const { 
      name, 
      images, 
      price, 
      categoryId, 
      colorId, 
      sizeId, 
      isFeatured, 
      isArchived 
    } = body;

    if (!userId) {
      return new NextResponse('Unauthenticated', { status: 403 });
    }

    if (!name) {
      return new NextResponse('Name is required', { status: 400 });
    }

    if (!images || !Array.isArray(images) || images.length === 0) {
      return new NextResponse('Images are required', { status: 400 });
    }

    if (!price) {
      return new NextResponse('Price is required', { status: 400 });
    }

    if (!categoryId) {
      return new NextResponse('Category ID is required', { status: 400 });
    }

    if (!colorId) {
      return new NextResponse('Color ID is required', { status: 400 });
    }

    if (!sizeId) {
      return new NextResponse('Size ID is required', { status: 400 });
    }

    if (!params.storeId) {
      return new NextResponse('Store id is required', { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse('Unauthorized', { status: 405 });
    }

    const product = await prismadb.product.create({
      data: {
        name,
        price: parseFloat(price),
        isFeatured: isFeatured ? true : false,
        isArchived: isArchived ? true : false,
        categoryId,
        colorId,
        sizeId,
        storeId: params.storeId,
        images: {
          create: images.map((image: { url: string }) => ({
            url: image.url,
          })),
        },
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.log('[PRODUCTS_POST]', error);
    console.log('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    if (!params.storeId) {
      return new NextResponse('Store id is required', { status: 400 });
    }

    const products = await prismadb.product.findMany({
      where: {
        storeId: params.storeId,
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
    console.log('[PRODUCTS_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
