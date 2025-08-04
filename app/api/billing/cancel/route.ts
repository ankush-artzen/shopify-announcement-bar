import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { findSessionsByShop } from "@/lib/db/session-storage";
import { prisma } from "@/lib/prisma";

const SHOPIFY_API_VERSION = "2025-07";

export async function POST(req: NextRequest) {
  try {
    console.log("📥 Incoming cancel subscription request");

    const body = await req.json();
    const { shop, subscriptionId } = body;

    if (!shop || !subscriptionId) {
      console.warn("❗ Missing shop or subscriptionId in request body");
      return NextResponse.json(
        { error: "Missing shop or subscriptionId" },
        { status: 400 },
      );
    }

    // 🔐 Get token from cookie/session fallback
    let token = cookies().get("accessToken")?.value;
    if (!token) {
      const sessions = await findSessionsByShop(shop);
      token = sessions?.[0]?.accessToken ;
    }

    if (!token) {
      console.error("🚫 Missing token — cannot cancel");
      return NextResponse.json({ error: "Missing token" }, { status: 401 });
    }

    // 🚀 GraphQL Mutation to cancel subscription
    const mutation = `
      mutation appSubscriptionCancel($id: ID!) {
        appSubscriptionCancel(id: $id) {
          appSubscription {
            id
            status
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const graphqlUrl = `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`;

    const response = await fetch(graphqlUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": token,
      },
      body: JSON.stringify({
        query: mutation,
        variables: { id: subscriptionId },
      }),
    });

    const result = await response.json();
    const cancelData = result?.data?.appSubscriptionCancel;

    if (cancelData?.userErrors?.length) {
      console.warn("⚠️ Shopify user errors:", cancelData.userErrors);
      return NextResponse.json(
        { error: "Cancel failed", userErrors: cancelData.userErrors },
        { status: 400 },
      );
    }

    const cancelledSubId = cancelData?.appSubscription?.id;
    const cancelledStatus = cancelData?.appSubscription?.status;

    console.log("✅ Subscription cancelled on Shopify:", cancelledSubId);

    // 🧾 Update latest billing record (active or pending)
    const existing = await prisma.billing.findFirst({
      where: {
        shop,
        billingStatus: {
          in: ["active", "pending"],
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "No active billing record found for this shop" },
        { status: 404 },
      );
    }

    // Set scheduled_cancelled (access remains till planExpiresOn)
    const updated = await prisma.billing.update({
      where: { id: existing.id },
      data: {
        billingStatus: "scheduled_cancelled",
      },
    });

    console.log("📄 Updated billing record:", updated.id);

    return NextResponse.json({
      success: true,
      status: cancelledStatus,
    });
  } catch (err: any) {
    console.error("❌ Cancel API error:", err?.message || err);
    return NextResponse.json(
      { error: "Internal server error", details: err?.message },
      { status: 500 },
    );
  }
}
