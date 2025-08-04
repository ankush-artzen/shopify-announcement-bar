import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { findSessionsByShop } from "@/lib/db/session-storage";

const SHOPIFY_API_VERSION = "2025-07";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ error: "Missing session token" }, { status: 401 });
  }

  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString("utf8"));
    const shop = payload.dest.replace(/^https:\/\//, "");
    console.log("🔓 Shop from token:", shop);

    // 🧠 Get access token
    let accessToken = req.cookies.get("accessToken")?.value || null;
    if (!accessToken) {
      console.log("🔍 Access token not in cookies. Checking session store...");
      const sessions = await findSessionsByShop(shop);
      accessToken = sessions?.[0]?.accessToken || null;
    }

    if (!accessToken) {
      return NextResponse.json({ error: "Missing access token" }, { status: 401 });
    }

    // 🔍 Get subscription from Shopify
    const query = `
      query {
        currentAppInstallation {
          activeSubscriptions {
            id
            name
            status
            test
          }
        }
      }
    `;
    const response = await fetch(
      `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
        body: JSON.stringify({ query }),
      }
    );
    const result = await response.json();
    const subscriptions = result?.data?.currentAppInstallation?.activeSubscriptions || [];
    console.log("📦 Subscriptions from Shopify:", subscriptions);

    const activeSub = subscriptions.find(
      (sub: any) => sub.status?.toLowerCase() === "active"
    );
    if (activeSub) {
      console.log("✅ Active subscription found:", activeSub);
    }

    // 📦 Get billing info from DB
    const billing = await prisma.billing.findFirst({
      where: { shop },
      orderBy: { billingOn: "desc" },
    });
    console.log("💾 Billing record from DB:", billing);

    const today = new Date();
    const trialEndsOn = billing?.trialEndsOn ? new Date(billing.trialEndsOn) : null;
    const planExpiresOn = billing?.planExpiresOn ? new Date(billing.planExpiresOn) : null;
    const isTrialActive = trialEndsOn ? trialEndsOn > today : false;
    const isPlanValid = planExpiresOn ? planExpiresOn > today : false;
    const relevantDate = isTrialActive ? trialEndsOn : planExpiresOn;
    const daysLeft = relevantDate
      ? Math.max(0, Math.ceil((relevantDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))
      : null;

    console.log("📆 Trial ends on:", trialEndsOn);
    console.log("📆 Plan expires on:", planExpiresOn);
    console.log("📈 Trial active:", isTrialActive, "Plan valid:", isPlanValid);
    console.log("📅 Days left:", daysLeft);

    // 🧠 ✅ CASE 1: Only allow Premium if billing exists + activeSub
    if (activeSub && billing) {
      console.log("🚀 CASE 1: Premium plan (Shopify + DB billing)");
      return NextResponse.json({
        plan: "Premium",
        subscriptionId: activeSub.id,
        billingStatus: activeSub.status,
        chargeId: billing?.chargeId ?? null,
        billingOn: billing?.billingOn?.toISOString() ?? null,
        trialEndsOn: billing?.trialEndsOn?.toISOString() ?? null,
        planExpiresOn: billing?.planExpiresOn?.toISOString() ?? null,
        isTrialActive,
        daysLeft,
      });
    }

    // ✅ CASE 2: DB says cancelled but still in valid trial/expiry = Pending
    if ((isTrialActive || isPlanValid) && billing?.billingStatus === "cancelled") {
      console.log("⚠️ CASE 2: Cancelled billing but still in trial/valid => Pending");
      return NextResponse.json({
        plan: "Pending",
        subscriptionId: null,
        billingStatus: "cancelled",
        chargeId: billing?.chargeId ?? null,
        billingOn: billing?.billingOn?.toISOString() ?? null,
        trialEndsOn: billing?.trialEndsOn?.toISOString() ?? null,
        planExpiresOn: billing?.planExpiresOn?.toISOString() ?? null,
        isTrialActive,
        daysLeft,
      });
    }

    // ❌ CASE 3: Nothing valid = Free or Cancelled
    console.log("🚫 CASE 3: Free plan (no active sub or billing)");
    return NextResponse.json({
      plan: billing?.billingStatus === "cancelled" ? "Cancelled" : "Free",
      subscriptionId: null,
      billingStatus: "inactive",
      chargeId: null,
      billingOn: null,
      trialEndsOn: null,
      planExpiresOn: null,
      isTrialActive: false,
      daysLeft: null,
    });
  } catch (error) {
    console.error("❌ Billing error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
