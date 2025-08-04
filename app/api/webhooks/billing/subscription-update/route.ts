import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

const SHOPIFY_SECRET = process.env.SHOPIFY_API_SECRET!;

function verifyHMAC(rawBody: string, hmac: string) {
  const generatedHash = crypto
    .createHmac("sha256", SHOPIFY_SECRET)
    .update(rawBody, "utf8")
    .digest("base64");

  return crypto.timingSafeEqual(Buffer.from(generatedHash), Buffer.from(hmac));
}

export async function POST(req: NextRequest) {
  try {
    const topic = req.headers.get("x-shopify-topic") || "";
    const hmac = req.headers.get("x-shopify-hmac-sha256") || "";
    const shop = req.headers.get("x-shopify-shop-domain") || "";

    const rawBody = await req.text();

    // 🔐 HMAC verification
    if (!verifyHMAC(rawBody, hmac)) {
      console.warn("❌ Invalid HMAC");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = JSON.parse(rawBody);

    switch (topic) {
      case "app_subscriptions/update": {
        const subscription = body?.app_subscription;
        console.log("📬 APP_SUBSCRIPTIONS_UPDATE:", subscription?.status);

        if (subscription?.status === "CANCELLED") {
          const latestBilling = await prisma.billing.findFirst({
            where: { shop },
            orderBy: { createdAt: "desc" },
          });

          if (latestBilling) {
            await prisma.billing.update({
              where: { id: latestBilling.id },
              data: { billingStatus: "cancelled" },
            });

            console.log("✅ Billing marked as cancelled for", shop);
          }
        }
        break;
      }

      case "recurring_application_charges/update": {
        const charge = body?.recurring_application_charge;
        console.log("📬 RECURRING_APPLICATION_CHARGES_UPDATE:", charge?.status);

        if (charge?.status === "cancelled") {
          await prisma.billing.updateMany({
            where: {
              shop,
              chargeId: String(charge.id),
            },
            data: {
              billingStatus: "cancelled",
            },
          });

          console.log("✅ Charge marked as cancelled:", charge.id);
        }
        break;
      }

      default:
        console.warn("❓ Unknown topic:", topic);
        break;
    }

    return new NextResponse("Webhook received", { status: 200 });
  } catch (err: any) {
    console.error("❌ Webhook error:", err?.message || err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
