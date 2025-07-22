import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma"; // ✅ Make sure this is correct

const SHOPIFY_SECRET = process.env.SHOPIFY_SECRET!;

function verifyHMAC(body: string, hmacHeader: string) {
  const generatedHash = crypto
    .createHmac("sha256", SHOPIFY_SECRET)
    .update(body, "utf8")
    .digest("base64");
  return generatedHash === hmacHeader;
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const hmac = req.headers.get("x-shopify-hmac-sha256") || "";
  const topic = req.headers.get("x-shopify-topic") || "";
  const shop = req.headers.get("x-shopify-shop-domain") || "";

  // 🔐 Verify webhook authenticity
  if (!verifyHMAC(rawBody, hmac)) {
    console.warn("❌ Invalid HMAC - Unauthorized webhook");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  console.log(`📦 Webhook received for ${shop}:`, topic);
  console.log("➡ Payload:", payload);

  try {
    switch (topic) {
      case "APP_SUBSCRIPTIONS_UPDATE": {
        const subscription = payload.app_subscription;

        await prisma.session.update({
          where: { shop },
          data: {
            planName: subscription.name,
            billingStatus: subscription.status?.toLowerCase() || "active",
            billingOn: new Date(subscription.billing_on),
          },
        });

        console.log(`✅ Updated subscription for ${shop}`);
        break;
      }

      case "APP_SUBSCRIPTIONS_CANCELLED": {
        await prisma.session.update({
          where: { shop },
          data: {
            billingStatus: "cancelled",
          },
        });

        console.log(`❌ Subscription cancelled for ${shop}`);
        break;
      }

      case "APP_SUBSCRIPTIONS_APPROACHING_CAPPED_AMOUNT": {
        console.warn(`⚠️ ${shop} is approaching capped amount`);
        // Optional: Notify merchant if needed
        break;
      }

      case "APP_SUBSCRIPTIONS_RENEWED": {
        const subscription = payload.app_subscription;

        await prisma.session.update({
          where: { shop },
          data: {
            billingOn: new Date(subscription.billing_on),
          },
        });

        console.log(`🔁 Subscription renewed for ${shop}`);
        break;
      }

      case "APP_USAGE_CHARGES_CREATE": {
        const charge = payload.usage_charge;
        console.log(`💳 Usage charge for ${shop}: ₹${charge.price} - ${charge.description}`);
        // Optional: log this to a separate `UsageCharge` table if desired
        break;
      }

      default:
        console.log("⚠️ Unknown billing webhook topic:", topic);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ Webhook processing error:", err.message);
    return NextResponse.json({ error: "Internal error", message: err.message }, { status: 500 });
  }
}
