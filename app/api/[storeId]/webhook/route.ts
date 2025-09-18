import Stripe from "stripe";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("Stripe-Signature") as string;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error("❌ Webhook signature error:", error.message);
    return new NextResponse("Webhook error", { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
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

      console.log("✅ Order updated:", order.id);
    } else {
      // 🔎 aici loghezi evenimentele ca să vezi ce trimite Stripe
      console.log(`Unhandled event type: ${event.type}`);
    }

    return new NextResponse("OK", { status: 200 });
  } catch (err: any) {
    console.error("❌ Error processing webhook:", err.message);
    return new NextResponse("Internal error", { status: 500 });
  }
}
