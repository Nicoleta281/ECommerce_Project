import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';

export async function POST(
  req: Request,
  context: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await context.params;
    const body = await req.json();

    const { 
      orderItems,
      phone,
      address,
    } = body;

    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return new NextResponse('Order items are required', { status: 400 });
    }

    if (!phone) {
      return new NextResponse('Phone is required', { status: 400 });
    }

    if (!address) {
      return new NextResponse('Address is required', { status: 400 });
    }

    if (!storeId) {
      return new NextResponse('Store id is required', { status: 400 });
    }

    const order = await prismadb.order.create({
      data: {
        phone,
        address,
        isPaid: false,
        storeId: storeId,
        orderItems: {
          create: orderItems.map((orderItem: { productId: string }) => ({
            productId: orderItem.productId,
          })),
        },
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.log('[PUBLIC_ORDERS_POST]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
