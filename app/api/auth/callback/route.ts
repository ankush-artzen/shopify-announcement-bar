import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getShopAccessToken } from "@/lib/shopService";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const shop = searchParams.get("shop");
  const chargeId = searchParams.get("charge_id");
  const hostParam = searchParams.get("host");

  console.log("🔍 Incoming billing callback");
  console.log("🛍️ Shop:", shop);
  console.log("💳 Charge ID:", chargeId);

  if (!shop || !chargeId || chargeId === "undefined" || chargeId === "null") {
    return NextResponse.json(
      { error: "Missing or invalid 'shop' or 'charge_id'" },
      { status: 400 },
    );
  }

  try {
    const accessToken = await getShopAccessToken(shop);
    if (!accessToken) {
      return NextResponse.json(
        { error: "Access token not found for shop" },
        { status: 401 },
      );
    }

    const API_VERSION = "2025-07";
    const chargeUrl = `https://${shop}/admin/api/${API_VERSION}/recurring_application_charges/${chargeId}.json`;

    const chargeRes = await fetch(chargeUrl, {
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    });

    if (!chargeRes.ok) {
      const error = await chargeRes.text();
      return NextResponse.json(
        { error: "Failed to fetch charge", details: error },
        { status: 500 },
      );
    }

    const { recurring_application_charge: charge } = await chargeRes.json();
    console.log("🔎 Shopify Charge Response:", {
      id: charge.id,
      status: charge.status,
      name: charge.name,
      price: charge.price,
      trial_days: charge.trial_days,
      trial_ends_on: charge.trial_ends_on,
      billing_on: charge.billing_on,
    });

    // 🔐 Activate the charge if not already
    if (charge.status === "accepted") {
      const activateUrl = `https://${shop}/admin/api/${API_VERSION}/recurring_application_charges/${chargeId}/activate.json`;

      const activateRes = await fetch(activateUrl, {
        method: "POST",
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json",
        },
      });

      if (!activateRes.ok) {
        const error = await activateRes.text();
        return NextResponse.json(
          { error: "Charge activation failed", details: error },
          { status: 500 },
        );
      }

      console.log("✅ Charge activated successfully");
    }

    if (["accepted", "active"].includes(charge.status)) {
      // 🔁 Mark all old billing plans as replaced
      await prisma.billing.updateMany({
        where: {
          shop,
          billingStatus: {
            in: ["active", "pending", "scheduled_cancelled", "freezed"],
          },
        },
        data: {
          billingStatus: "replaced",
        },
      });

      // 📅 Extract key dates
      // 📅 Determine actual billing start using created_at (not billing_on!)
      const billingStartDate = new Date(charge.created_at || Date.now());
      if (isNaN(billingStartDate.getTime())) {
        throw new Error(
          `Invalid created_at date from Shopify: ${charge.created_at}`,
        );
      }

      const trialDays =
        typeof charge.trial_days === "number" ? charge.trial_days : 0;

      // 🧪 Trial ends X days after billing start
      const trialEndsOn = new Date(
        billingStartDate.getTime() + trialDays * 86400000,
      );

      // 📆 Plan expires 30 days after trial ends
      const planExpiresOn = new Date(trialEndsOn.getTime() + 30 * 86400000);

      const now = new Date();
      const trialIsActive = trialDays > 0 && now < trialEndsOn;
      const billingStatus = trialIsActive ? "pending" : "active";

      console.log("📅 Today:", now.toISOString());
      console.log("📅 Trial Ends On:", trialEndsOn.toISOString());
      console.log("📆 Billing Starts On:", billingStartDate.toISOString());
      console.log("📆 Plan Expires On:", planExpiresOn.toISOString());
      console.log("💳 Billing Status:", billingStatus);

      // 💾 Save to database
      await prisma.billing.create({
        data: {
          shop,
          chargeId: String(charge.id),
          subscriptionId: String(charge.id),
          planName: charge.name,
          price: charge.price,
          billingOn: billingStartDate,
          billingStatus,
          trialEndsOn,
          planExpiresOn,
        },
      });

      console.log("✅ Billing record saved to database for:", shop);
    }

    // 🔁 Redirect merchant to app billing success screen
    const encodedHost =
      hostParam ||
      Buffer.from(`${shop}/admin`, "utf8").toString("base64").replace(/=/g, "");
    const redirectUrl = `https://${shop}/admin/apps/${process.env.SHOPIFY_API_KEY}/billing?shop=${shop}&host=${encodedHost}&plan_success=true`;

    console.log("🔁 Redirecting to:", redirectUrl);
    return NextResponse.redirect(redirectUrl);
  } catch (error: any) {
    console.error("❌ Callback error:", error?.message || error);
    return NextResponse.json(
      { error: "Callback failed", details: error?.message },
      { status: 500 },
    );
  }
}
