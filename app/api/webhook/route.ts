import Stripe from "stripe";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import prismadb from "@/lib/prismadb";

export async function POST(req: Request) {
  console.log("🚀 Webhook endpoint called");
  
  try {
    const body = await req.text();
    console.log("📝 Body received, length:", body.length);
    
    const headersList = await headers();
    const signature = headersList.get("Stripe-Signature");
    console.log("🔐 Signature received:", signature ? "Yes" : "No");

    if (!signature) {
      console.error("❌ No Stripe signature found");
      return new NextResponse("No signature", { status: 400 });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
      console.log("✅ Event constructed successfully:", event.type);
    } catch (error: any) {
      console.error("❌ Webhook signature error:", error.message);
      return new NextResponse("Webhook error", { status: 400 });
    }

    console.log(`📨 Received webhook event: ${event.type} - ${event.id}`);
    
    // Procesează evenimentul checkout.session.completed
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("💳 Processing checkout.session.completed for order:", session?.metadata?.orderId);
      
      const address = session?.customer_details?.address;
      const addressComponents = [
        address?.line1,
        address?.line2,
        address?.city,
        address?.state,
        address?.postal_code,
        address?.country,
      ];
      const addressString = addressComponents.filter(Boolean).join(", ");

      try {
        const order = await prismadb.order.update({
          where: {
            id: session?.metadata?.orderId,
          },
          data: {
            isPaid: true,
            address: addressString,
            phone: session?.customer_details?.phone || "",
          },
          include: {
            orderItems: true,
          },
        });

        console.log("✅ Order updated successfully:", order.id, "isPaid:", order.isPaid);

        // Arhivează produsele
        const productIds = order.orderItems.map((item) => item.productId);
        await prismadb.product.updateMany({
          where: {
            id: {
              in: productIds,
            },
          },
          data: {
            isArchived: true,
          },
        });

        console.log("✅ Products archived:", productIds.length);
      } catch (dbError: any) {
        console.error("❌ Database error:", dbError.message);
        return new NextResponse("Database error", { status: 500 });
      }
    } else {
      console.log(`ℹ️  Unhandled event type: ${event.type}`);
    }
    
    return new NextResponse("OK", { status: 200 });
  } catch (err: any) {
    console.error("❌ Error processing webhook:", err.message);
    console.error("❌ Full error:", err);
    return new NextResponse("Internal error", { status: 500 });
  }
}
