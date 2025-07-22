import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { findSessionsByShop } from "@/lib/db/session-storage";

import { prisma } from "@/lib/prisma";

const SHOPIFY_API_VERSION = "2025-07";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { shop, subscriptionId } = body;

    if (!shop || !subscriptionId) {
      return NextResponse.json(
        { error: "Missing shop or subscriptionId" },
        { status: 400 },
      );
    }

    let token = cookies().get("accessToken")?.value;
    if (!token) {
      const sessions = await findSessionsByShop(shop);
      token = sessions?.[0]?.accessToken;
    }

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 401 });
    }

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

    const response = await fetch(
      `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": token,
        },
        body: JSON.stringify({
          query: mutation,
          variables: { id: subscriptionId },
        }),
      },
    );

    const result = await response.json();
    const cancelData = result?.data?.appSubscriptionCancel;

    if (cancelData?.userErrors?.length) {
      return NextResponse.json(
        { error: "Cancel failed", userErrors: cancelData.userErrors },
        { status: 400 },
      );
    }

    console.log("✅ Subscription cancelled:", cancelData?.appSubscription?.id);

    const updateResult = await prisma.billing.updateMany({
      where: { shop },
      data: {
        billingStatus: "cancelled",
        planName: null,
        price: null,
      },
    });

    console.log("🔄 Billing update count:", updateResult.count);

    return NextResponse.json({
      success: true,
      updated: updateResult.count,
      status: cancelData.appSubscription?.status,
    });
  } catch (err) {
    console.error("❌ Cancel API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";

// export async function DELETE(req: NextRequest) {
//   const { searchParams } = new URL(req.url);
//   const shop = searchParams.get("shop");

//   if (!shop) {
//     return NextResponse.json(
//       { error: "Missing shop in query params" },
//       { status: 400 }
//     );
//   }

//   try {
//     const billing = await prisma.billing.updateMany({
//       where: { shop },
//       data: {
//         billingStatus: "cancelled",
//       },
//     });

//     return NextResponse.json({ message: "Billing cancelled", billing });
//   } catch (error: any) {
//     console.error("❌ Billing cancel error:", error);
//     return NextResponse.json(
//       { error: "Failed to cancel billing", details: error?.message },
//       { status: 500 }
//     );
//   }
// }
