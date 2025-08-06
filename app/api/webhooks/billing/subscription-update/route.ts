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

    // 🔐 Validate HMAC
    if (!verifyHMAC(rawBody, hmac)) {
      console.warn("❌ Invalid HMAC");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = JSON.parse(rawBody);

    switch (topic) {
      case "app_subscriptions/update": {
        const subscription = body?.app_subscription;
        const subId = String(subscription?.id);
        const newStatus = subscription?.status?.toLowerCase();
        const newExpiry = subscription?.current_period_end
          ? new Date(subscription.current_period_end)
          : null;

        console.log(`📬 Subscription Update [${shop}]:`, subscription?.status);

        const latestBilling = await prisma.billing.findFirst({
          where: { shop },
          orderBy: { createdAt: "desc" },
        });

        if (!latestBilling) {
          console.warn("⚠️ No billing record found for", shop);
          return new NextResponse("No billing record", { status: 200 });
        }

        // 🛑 Skip if no change in status or subscription
        if (
          latestBilling.billingStatus === newStatus &&
          latestBilling.subscriptionId === subId
        ) {
          console.log("⏩ No change in billing. Skipping update.");
          return new NextResponse("No change detected", { status: 200 });
        }

        // ❌ Subscription Cancelled
        if (newStatus === "cancelled") {
          await prisma.billing.update({
            where: { id: latestBilling.id },
            data: { billingStatus: "cancelled" },
          });
          console.log("✅ Marked billing as cancelled");
        }

        // ✅ Subscription Active
        if (newStatus === "active") {
          await prisma.billing.update({
            where: { id: latestBilling.id },
            data: {
              billingStatus: "active",
              planExpiresOn: newExpiry,
              subscriptionId: subId,
            },
          });
          console.log("✅ Subscription activated and updated in DB");
        }

        // 🔁 Trial expired but not cancelled — upgrade to active
        if (
          latestBilling.billingStatus === "pending" &&
          latestBilling.trialEndsOn &&
          new Date(latestBilling.trialEndsOn) <= new Date() && // Trial has ended
          newStatus !== "cancelled"
        ) {
          const fallbackExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          await prisma.billing.update({
            where: { id: latestBilling.id },
            data: {
              billingStatus: "active",
              planExpiresOn: newExpiry || fallbackExpiry,
              subscriptionId: subId,
            },
          });
          console.log("✅ Trial ended — Billing upgraded to active manually.");
        }

        break;
      }

      case "recurring_application_charges/update": {
        const charge = body?.recurring_application_charge;
        const status = charge?.status?.toLowerCase();

        console.log(`📬 Charge Update [${shop}]:`, charge?.status);

        if (status === "cancelled") {
          await prisma.billing.updateMany({
            where: {
              shop,
              chargeId: String(charge.id),
            },
            data: {
              billingStatus: "cancelled",
            },
          });
          console.log("✅ Recurring charge marked as cancelled");
        }

        break;
      }

      default:
        console.warn("❓ Unknown webhook topic:", topic);
        break;
    }

    return new NextResponse("Webhook processed", { status: 200 });
  } catch (err: any) {
    console.error("❌ Webhook error:", err?.message || err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
