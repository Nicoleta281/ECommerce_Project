import Stripe from "stripe";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";

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
    
    // Pentru testare, doar loghează evenimentele
    console.log(`ℹ️  Event received: ${event.type} - ${event.id}`);
    
    return new NextResponse("OK", { status: 200 });
  } catch (err: any) {
    console.error("❌ Error processing webhook:", err.message);
    console.error("❌ Full error:", err);
    return new NextResponse("Internal error", { status: 500 });
  }
}
