import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prismadb from '@/lib/prismadb';

export async function GET(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    if (!params.orderId) {
      return new NextResponse('Order id is required', { status: 400 });
    }

    const order = await prismadb.order.findUnique({
      where: {
        id: params.orderId,
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.log('[ORDER_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { orderId: string; storeId: string } }
) {
  try {
    const { userId } = await auth();

    const body = await req.json();
    console.log('Order PATCH request body:', body);

    const { 
      orderItems,
      phone,
      address,
      isPaid
    } = body;

    if (!userId) {
      return new NextResponse('Unauthenticated', { status: 403 });
    }

    if (!phone) {
      return new NextResponse('Phone is required', { status: 400 });
    }

    if (!address) {
      return new NextResponse('Address is required', { status: 400 });
    }

    if (!params.orderId) {
      return new NextResponse('Order id is required', { status: 400 });
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

    await prismadb.order.update({
      where: {
        id: params.orderId,
      },
      data: {
        phone,
        address,
        isPaid: isPaid ? true : false,
        orderItems: {
          deleteMany: {},
        },
      },
    });

    const order = await prismadb.order.update({
      where: {
        id: params.orderId,
      },
      data: {
        orderItems: {
          create: orderItems?.map((orderItem: { productId: string }) => ({
            productId: orderItem.productId,
          })) || [],
        },
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.log('[ORDER_PATCH]', error);
    console.log('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { orderId: string; storeId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse('Unauthenticated', { status: 403 });
    }

    if (!params.orderId) {
      return new NextResponse('Order id is required', { status: 400 });
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

    const order = await prismadb.order.delete({
      where: {
        id: params.orderId,
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.log('[ORDER_DELETE]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
