
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { findSessionsByShop } from "@/lib/db/session-storage";

const SHOPIFY_API_VERSION = "2025-07";

export async function GET(req: NextRequest) {
  const shop = req.nextUrl.searchParams.get("shop");

  if (!shop) {
    return NextResponse.json({ error: "Missing shop" }, { status: 400 });
  }

  let token = cookies().get("accessToken")?.value;

  if (!token) {
    const sessions = await findSessionsByShop(shop);
    token = sessions?.[0]?.accessToken;
  }

  if (!token) {
    return NextResponse.json({ error: "Missing access token" }, { status: 401 });
  }

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

  const response = await fetch(`https://${shop}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({ query }),
  });

  const result = await response.json();
  const subscriptions = result?.data?.currentAppInstallation?.activeSubscriptions || [];

  return NextResponse.json({ subscriptions });
}
