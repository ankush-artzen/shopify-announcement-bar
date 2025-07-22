import "@shopify/shopify-api/adapters/node";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { shopifyApi } from "@shopify/shopify-api";
import { findSessionsByShop } from "@/lib/db/session-storage";

const SHOPIFY_API_VERSION = "2025-07";

const billingConfig = {
  Premium: {
    amount: 499.0,
    currencyCode: "INR",
    interval: "EVERY_30_DAYS",
  },
} as const;

type BillingPlan = keyof typeof billingConfig;

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY!,
  apiSecretKey: process.env.SHOPIFY_SECRET!,
  scopes: process.env.SCOPES!.split(","),
  hostName: process.env.HOST!.replace(/^https?:\/\//, ""),
  apiVersion: SHOPIFY_API_VERSION,
  isEmbeddedApp: true,
});

export async function POST(req: NextRequest) {
  try {
    console.log("📥 Billing API triggered");

    const body = await req.json();
    const plan = body?.plan;
    const bodyShop = body?.shop;
    const { searchParams } = new URL(req.url);
    console.log("incoming request body:", body);
    const host = searchParams.get("host"); // ✅ Extract 'host' from URL


    const validPlans = Object.keys(billingConfig) as BillingPlan[];
    if (!plan || !validPlans.includes(plan as BillingPlan)) {
      return NextResponse.json(
        {
          error: `Invalid or missing plan. Valid plans: ${validPlans.join(", ")}`,
        },
        { status: 400 },
      );
    }

    const cookieStore = cookies();
    const cookieShop = cookieStore.get("shop")?.value;
    const tokenFromCookie = cookieStore.get("accessToken")?.value;
    const queryShop = new URL(req.url).searchParams.get("shop");

    let shop = bodyShop || cookieShop || queryShop;
    let token = tokenFromCookie;

    console.log("🔍 Resolved shop:", shop);
    console.log("🔐 Access token:", token ? "✅ Present" : "❌ Missing");

    if (!shop) {
      return NextResponse.json(
        { error: "Missing 'shop' in body, cookie, or query param" },
        { status: 400 },
      );
    }

    if (!token) {
      console.log("🧠 Attempting session fallback...");
      const sessions = await findSessionsByShop(shop);
      token = sessions?.[0]?.accessToken || null;
      console.log("🔄 Token from DB:", token ? "✅ Found" : "❌ Not found");
    }

    if (!token) {
      return NextResponse.json(
        {
          error:
            "Missing access token. Ensure the app has been installed correctly.",
        },
        { status: 401 },
      );
    }

    const config = billingConfig[plan as BillingPlan];
    const returnUrl = `https://${shop}/admin/apps/${process.env.SHOPIFY_API_KEY}/billing?shop=${shop}&host=${host}`;
    console.log("🔁 Return URL:", returnUrl);

    const mutation = `
    mutation AppSubscriptionCreate(
      $name: String!,
      $lineItems: [AppSubscriptionLineItemInput!]!,
      $returnUrl: URL!
    ) {
      appSubscriptionCreate(
        name: $name,
        returnUrl: $returnUrl,
        test: ${process.env.NODE_ENV !== "production"},
        lineItems: $lineItems
      ) {
        confirmationUrl
        userErrors {
          field
          message
        }
        appSubscription {
          id
        }
      }
    }
  `;

  const variables = {
    name: `${plan} Plan`,
    returnUrl,
    lineItems: [
      {
        plan: {
          appRecurringPricingDetails: {
            price: {
              amount: config.amount,
              currencyCode: config.currencyCode,
            },
            interval: config.interval,
          },
        },
      },
    ],
  };
  

    const apiUrl = `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`;
    console.log("📡 Sending GraphQL request to:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": token,
      },
      body: JSON.stringify({ query: mutation, variables }),
    });

    const rawResponse = await response.text();

    if (!rawResponse.trim().startsWith("{")) {
      return NextResponse.json(
        { error: "Shopify response is not JSON", response: rawResponse },
        { status: 502 },
      );
    }

    const result = JSON.parse(rawResponse);
    const { confirmationUrl, userErrors } =
      result?.data?.appSubscriptionCreate || {};

    if (result.errors) {
      return NextResponse.json(
        { error: "GraphQL error", details: result.errors },
        { status: 400 },
      );
    }

    if (userErrors?.length) {
      return NextResponse.json(
        { error: "Billing failed", userErrors },
        { status: 400 },
      );
    }

    if (!confirmationUrl) {
      return NextResponse.json(
        { error: "Missing confirmation URL from Shopify" },
        { status: 500 },
      );
    }

    console.log("✅ Confirmation URL received:", confirmationUrl);
    return NextResponse.json({ confirmationUrl });
  } catch (err: any) {
    console.error("❌ Billing error:", err.message, "\nStack:", err.stack);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: err.message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
      },
      { status: 500 },
    );
  }
}
