import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";


export async function GET(
  context: { params: Promise<{ sizeId: string }> }
) {
  try {
    const { sizeId } = await context.params;

    if (!sizeId) {
      return new NextResponse("Size id is required", { status: 400 });
    }

    const size = await prismadb.size.findMany({
      where: { id: sizeId },
    
    });

    return NextResponse.json(size);
  } catch (error) {
    console.log("[SIZES_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
export async function PATCH(
  req: Request,
  {params}: { params: { sizeId: string, storeId: string}}
){
  try{
    const { userId } = await auth();
    const body = await req.json();

    const {name, value} = body;

    if(!userId){
      return new NextResponse("Unauthenticated", {status: 401})
    }
    if(!name){
      return new NextResponse("Name is required", {status: 400})
    }
    if(!value){
      return new NextResponse("Value is required", {status: 400})
    }
    if(!params.sizeId){
      return new NextResponse("Size ID is required", {status: 400})
    }
    if(!params.storeId){
      return new NextResponse("Store ID is required", {status: 400})
    }
    const storeByUserId = await prismadb.store.findFirst({
      where: {id: params.storeId, userId}
    })
    if(!storeByUserId){
      return new NextResponse("Unauthorized", {status: 403})
    }
    const size = await prismadb.size.updateMany({
      where: {id: params.sizeId},
      data: {name, value}
    })
    return NextResponse.json(size);
  } catch (error) {
    console.error("[SIZE_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
// =========================
// POST create new billboard
// =========================
export async function POST(
  req: Request,
  context: { params: Promise<{ storeId: string }> }
) {
  try {
    console.log("[BILLBOARDS_POST] Starting...");
    const { userId: authedUserId } = await auth();
    const body = await req.json();
    const { label, imageUrl } = body;

    const { storeId } = await context.params;
    console.log("[BILLBOARDS_POST] Data received:", { label, imageUrl, storeId });

    const userId = authedUserId ?? process.env.DEV_FAKE_USER_ID ?? "dev-user";
    console.log("[BILLBOARDS_POST] User ID:", userId);

    if (!label) {
      console.log("[BILLBOARDS_POST] Label missing");
      return new NextResponse("Label is required", { status: 400 });
    }

    if (!imageUrl) {
      console.log("[BILLBOARDS_POST] Image URL missing");
      return new NextResponse("Image URL is required", { status: 400 });
    }

    if (!storeId) {
      console.log("[BILLBOARDS_POST] Store ID missing");
      return new NextResponse("Store id is required", { status: 400 });
    }

    console.log("[BILLBOARDS_POST] Checking store ownership...");
    const storeByUserId = await prismadb.store.findFirst({
      where: { id: storeId, userId },
    });

    if (!storeByUserId) {
      console.log("[BILLBOARDS_POST] Store not found or unauthorized");
      return new NextResponse("Unauthorized", { status: 403 });
    }

    console.log("[BILLBOARDS_POST] Creating billboard...");
    const billboard = await prismadb.billboard.create({
      data: { label, imageUrl, storeId },
    });

    console.log("[BILLBOARDS_POST] Billboard created successfully:", billboard);
    return NextResponse.json(billboard);
  } catch (error) {
    console.error("[BILLBOARDS_POST] Error:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
