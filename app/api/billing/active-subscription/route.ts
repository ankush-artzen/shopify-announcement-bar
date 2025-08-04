import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { findSessionsByShop } from "@/lib/db/session-storage";

const SHOPIFY_API_VERSION = "2025-07";

// ─── GET: Fetch Active Subscription ─────────────────────────────────────────
export async function GET(req: NextRequest) {
  const shop = req.nextUrl.searchParams.get("shop");

  if (!shop) {
    console.error("❌ Missing shop in query params");
    return NextResponse.json({ error: "Missing shop" }, { status: 400 });
  }

  let token = cookies().get("accessToken")?.value;
  console.log("🧪 Access token from cookies:", token);

  if (!token) {
    const sessions = await findSessionsByShop(shop);
    token = sessions?.[0]?.accessToken;
    console.log("📦 Access token from DB:", token);
  }

  if (!token) {
    console.error("❌ Missing access token");
    return NextResponse.json({ error: "Missing token" }, { status: 401 });
  }

  const query = `
    {
      currentAppInstallation {
        activeSubscriptions {
          id
          name
          status
        }
      }
    }
  `;

  const res = await fetch(
    `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": token,
      },
      body: JSON.stringify({ query }),
    }
  );

  const result = await res.json();
  console.log("📡 Shopify GraphQL raw response:", JSON.stringify(result, null, 2));

  const activeSubscriptions = result?.data?.currentAppInstallation?.activeSubscriptions || [];
  if (activeSubscriptions.length > 0) {
    console.log("✅ Found active subscription:", activeSubscriptions[0]);
    return NextResponse.json({ subscriptionId: activeSubscriptions[0].id });
  }

  console.warn("⚠️ No active subscription found. Full response logged above.");
  return NextResponse.json(
    { error: "No active subscription found", raw: result },
    { status: 404 }
  );
}

// ─── POST: Cancel Subscription ─────────────────────────────────────────────
// export async function POST(req: NextRequest) {
//   const body = await req.json();
//   const { shop, subscriptionId } = body;

//   if (!shop || !subscriptionId) {
//     return NextResponse.json({ error: "Missing shop or subscriptionId" }, { status: 400 });
//   }

//   let token = cookies().get("accessToken")?.value;

//   if (!token) {
//     const sessions = await findSessionsByShop(shop);
//     token = sessions?.[0]?.accessToken;
//   }

//   if (!token) {
//     return NextResponse.json({ error: "Missing token" }, { status: 401 });
//   }

//   const mutation = `
//     mutation appSubscriptionCancel($id: ID!) {
//       appSubscriptionCancel(id: $id) {
//         appSubscription {
//           id
//           status
//         }
//         userErrors {
//           field
//           message
//         }
//       }
//     }
//   `;

//   const response = await fetch(`https://${shop}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "X-Shopify-Access-Token": token,
//     },
//     body: JSON.stringify({
//       query: mutation,
//       variables: { id: subscriptionId },
//     }),
//   });

//   const result = await response.json();
//   const cancelData = result?.data?.appSubscriptionCancel;

//   if (cancelData?.userErrors?.length) {
//     return NextResponse.json({ error: "Cancel failed", userErrors: cancelData.userErrors }, { status: 400 });
//   }

//   console.log("✅ Subscription cancelled:", cancelData?.appSubscription?.id);
//   return NextResponse.json({ success: true, status: cancelData.appSubscription?.status });
// }
