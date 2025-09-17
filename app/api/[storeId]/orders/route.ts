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
    console.log('Order POST request body:', body);

    const { 
      orderItems,
      phone,
      address,
      isPaid
    } = body;

    if (!userId) {
      return new NextResponse('Unauthenticated', { status: 403 });
    }

    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return new NextResponse('Order items are required', { status: 400 });
    }

    if (!phone) {
      return new NextResponse('Phone is required', { status: 400 });
    }

    if (!address) {
      return new NextResponse('Address is required', { status: 400 });
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

    const order = await prismadb.order.create({
      data: {
        phone,
        address,
        isPaid: isPaid ? true : false,
        storeId: params.storeId,
        orderItems: {
          create: orderItems.map((orderItem: { productId: string }) => ({
            productId: orderItem.productId,
          })),
        },
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.log('[ORDERS_POST]', error);
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

    const orders = await prismadb.order.findMany({
      where: {
        storeId: params.storeId,
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.log('[ORDERS_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
