import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prismadb from '@/lib/prismadb';

export async function PATCH(
  req: Request,
  context: { params: Promise<{ orderId: string; storeId: string }> }
) {
  try {
    const { userId } = await auth();
    const { orderId, storeId } = await context.params;

    if (!userId) {
      return new NextResponse('Unauthenticated', { status: 401 });
    }

    if (!orderId) {
      return new NextResponse('Order ID is required', { status: 400 });
    }

    if (!storeId) {
      return new NextResponse('Store ID is required', { status: 400 });
    }

    // Verify user owns the store
    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: storeId,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    // Update order to paid
    const order = await prismadb.order.update({
      where: {
        id: orderId,
        storeId: storeId,
      },
      data: {
        isPaid: true,
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.log('[MARK_ORDER_PAID]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
