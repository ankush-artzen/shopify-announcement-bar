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

  if (!shop || !chargeId) {
    return NextResponse.json(
      { error: "Missing 'shop' or 'charge_id'" },
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

    // Fetch charge details
    const chargeRes = await fetch(
      `https://${shop}/admin/api/2023-10/recurring_application_charges/${chargeId}.json`,
      {
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json",
        },
      },
    );

    if (!chargeRes.ok) {
      const error = await chargeRes.text();
      return NextResponse.json(
        { error: "Failed to fetch charge", details: error },
        { status: 500 },
      );
    }

    const { recurring_application_charge: charge } = await chargeRes.json();

    // Activate if accepted
    if (charge.status === "accepted") {
      const activateRes = await fetch(
        `https://${shop}/admin/api/2023-10/recurring_application_charges/${chargeId}/activate.json`,
        {
          method: "POST",
          headers: {
            "X-Shopify-Access-Token": accessToken,
            "Content-Type": "application/json",
          },
        },
      );

      if (!activateRes.ok) {
        const error = await activateRes.text();
        return NextResponse.json(
          { error: "Charge activation failed", details: error },
          { status: 500 },
        );
      }

      console.log("✅ Charge activated successfully");
    }

    // Save or update billing info
    if (charge.status === "accepted" || charge.status === "active") {
      await prisma.billing.upsert({
        where: { shop },
        update: {
          chargeId: String(charge.id),
          planName: charge.name,
          price: charge.price,
          billingOn: charge.billing_on
            ? new Date(charge.billing_on)
            : undefined,
          billingStatus: charge.status,
        },
        create: {
          shop,
          chargeId: String(charge.id),
          planName: charge.name,
          price: charge.price,
          billingOn: charge.billing_on
            ? new Date(charge.billing_on)
            : undefined,
          billingStatus: charge.status,
        },
      });

      console.log("📦 Billing info stored for", shop);
    }

    // Redirect to embedded app
    const host =
      hostParam || Buffer.from(`${shop}/admin`, "utf-8").toString("base64");

    // const redirectUrl = `https://${shop}/admin/apps/${process.env.SHOPIFY_API_KEY}?shop=${shop}&host=${host}`;
    const redirectUrl = `https://${shop}/admin/apps/${API_KEY}/billing?shop=${shop}&host=${host}`;

    return NextResponse.redirect(redirectUrl);
  } catch (error: any) {
    console.error("❌ Callback error:", error?.message || error);
    return NextResponse.json(
      { error: "Callback failed", details: error?.message },
      { status: 500 },
    );
  }
}
