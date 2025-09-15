import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";

// =========================
// GET all billboards for a store
// =========================
export async function GET(
  context: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await context.params;

    if (!storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const billboards = await prismadb.billboard.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        label: true,
        createdAt: true,
        updatedAt: true,
        // nu returnăm imageUrl ca să evităm payload uriaș (base64)
      },
    });

    return NextResponse.json(billboards);
  } catch (error) {
    console.log("[BILLBOARDS_GET]", error);
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
