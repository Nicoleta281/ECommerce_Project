import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";

 
export async function GET(
  context: { params: Promise<{ categoryId: string; storeId: string }> }
) {
  try {
    const { categoryId, storeId } = await context.params;
    
    if (!categoryId) {
      return new NextResponse("Category id is required", { status: 400 });
    }

    if (!storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const category = await prismadb.category.findUnique({
      where: {
        id: categoryId,
        storeId: storeId,
      },
      include: {
        billboard: true,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.log("[CATEGORIES_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ categoryId: string; storeId: string }> }
){
  try{
    const { userId } = await auth();
    const body = await req.json();
    const { categoryId, storeId } = await context.params;

    const {name, billboardId} = body;

    if(!userId){
      return new NextResponse("Unauthenticated", {status: 401})
    }
    if(!name){
      return new NextResponse("Name is required", {status: 400})
    }
    if(!billboardId){
      return new NextResponse("Billboard ID is required", {status: 400})
    }
    if(!categoryId){
      return new NextResponse("Category ID is required", {status: 400})
    }
    if(!storeId){
      return new NextResponse("Store ID is required", {status: 400})
    }
    const storeByUserId = await prismadb.store.findFirst({
      where: {id: storeId, userId}
    })
    if(!storeByUserId){
      return new NextResponse("Unauthorized", {status: 403})
    }
    const category = await prismadb.category.update({
      where: {id: categoryId},
      data: {name, billboardId}
    })
    return NextResponse.json(category);
  } catch (error) {
    console.error("[CATEGORY_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ categoryId: string; storeId: string }> }
 ){
  try{
    const { userId } = await auth();
    const { categoryId, storeId } = await context.params;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!categoryId) {
      return new NextResponse("Category ID is required", { status: 400 });
    }

    if (!storeId) {
      return new NextResponse("Store ID is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: { id: storeId, userId }
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const category = await prismadb.category.delete({
      where: { id: categoryId }
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("[CATEGORY_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

