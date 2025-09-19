import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prismadb from '@/lib/prismadb';

export async function POST(
  req: Request,
  context: { params: Promise<{ storeId: string }> }
) {
  try {
    const { userId } = await auth();
    const { storeId } = await context.params;

    const body = await req.json();
    console.log('Billboard POST request body:', body);

    const { label, imageUrl } = body;

    if (!userId) {
      return new NextResponse('Unauthenticated', { status: 403 });
    }

    if (!label) {
      return new NextResponse('Label is required', { status: 400 });
    }

    if (!imageUrl) {
      return new NextResponse('Image Url is required', { status: 400 });
    }

    if (!storeId) {
      return new NextResponse('Store id is required', { status: 400 });
    }

    const storByUserId = await prismadb.store.findFirst({
      where: {
        id: storeId,
        userId,
      },
    });

    if (!storByUserId) {
      return new NextResponse('Unautorized', { status: 405 });
    }

    const billboard = await prismadb.billboard.create({
      data: {
        label,
        imageUrl,
        storeId: storeId,
      },
    });

    return NextResponse.json(billboard);
  } catch (error) {
    console.log('["BILLBOARDS_POST]', error);
    console.log('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return new NextResponse('Internal error', { status: 500 });
  }
}

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
        storeId: storeId,
      },
    });

    return NextResponse.json(billboards);
  } catch (error) {
    console.log('["BILLBOARDS_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}