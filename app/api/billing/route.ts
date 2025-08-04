import "@shopify/shopify-api/adapters/node";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { shopifyApi } from "@shopify/shopify-api";
import { findSessionsByShop } from "@/lib/db/session-storage";
import { ApiVersion } from "@shopify/shopify-api";

const SHOPIFY_API_VERSION = ApiVersion.July23;
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

    const rawHost = searchParams.get("host");
    const queryShop = searchParams.get("shop");

    const encodedHost = rawHost || Buffer.from(`${bodyShop || queryShop}/admin`, "utf8").toString("base64").replace(/=/g, "");
    console.log("🔍 Parsed input:", { bodyShop, queryShop, rawHost, encodedHost, plan });

    const validPlans = Object.keys(billingConfig) as BillingPlan[];
    if (!plan || !validPlans.includes(plan as BillingPlan)) {
      console.warn("❌ Invalid or missing plan", { received: plan, validPlans });
      return NextResponse.json(
        {
          error: `Invalid or missing plan. Valid plans: ${validPlans.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const cookieStore = cookies();
    const cookieShop = cookieStore.get("shop")?.value;
    const tokenFromCookie = cookieStore.get("accessToken")?.value;

    let shop = bodyShop || cookieShop || queryShop;
    let token = tokenFromCookie;

    console.log("🍪 Cookies:", { cookieShop, tokenFromCookie });

    if (!shop) {
      console.warn("❌ Missing shop in body, cookie, or query param");
      return NextResponse.json(
        { error: "Missing 'shop' in body, cookie, or query param" },
        { status: 400 }
      );
    }

    if (!token) {
      console.log("🧠 Attempting session fallback...");
      const sessions = await findSessionsByShop(shop);
      console.log("🗃️ Sessions from DB:", sessions);
      token = sessions?.[0]?.accessToken ;
      console.log("🔄 Token from DB:", token ? "✅ Found" : "❌ Not found");
    }

    if (!token) {
      console.error("🚫 No token found. Aborting.");
      return NextResponse.json(
        {
          error: "Missing access token. Ensure the app has been installed correctly.",
        },
        { status: 401 }
      );
    }

    const config = billingConfig[plan as BillingPlan];
    console.log("📦 Billing config:", config);

    const returnUrl = `${process.env.HOST}/api/auth/callback?shop=${shop}`;
    console.log("🔁 Return URL:", returnUrl);

    const mutation = `
    mutation AppSubscriptionCreate(
      $name: String!,
      $lineItems: [AppSubscriptionLineItemInput!]!,
      $returnUrl: URL!,
      $trialDays: Int
    ) {
      appSubscriptionCreate(
        name: $name,
        returnUrl: $returnUrl,
        test: ${process.env.NODE_ENV !== "production"},
        trialDays: $trialDays,
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
    trialDays: 1, 
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
  
    console.log("📤 Sending GraphQL request:", { apiUrl: `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`, variables });

    const response = await fetch(`https://${shop}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": token,
      },
      body: JSON.stringify({ query: mutation, variables }),
    });

    const rawResponse = await response.text();

    if (!rawResponse.trim().startsWith("{")) {
      console.error("🛑 Shopify response not JSON:", rawResponse);
      return NextResponse.json(
        { error: "Shopify response is not JSON", response: rawResponse },
        { status: 502 }
      );
    }

    const result = JSON.parse(rawResponse);
    const { confirmationUrl, userErrors } = result?.data?.appSubscriptionCreate || {};
    console.log("📬 Shopify response parsed:", result);

    if (result.errors) {
      console.error("❌ Shopify GraphQL errors:", result.errors);
      return NextResponse.json(
        { error: "GraphQL error", details: result.errors },
        { status: 400 }
      );
    }

    if (userErrors?.length) {
      console.warn("⚠️ Shopify user errors:", userErrors);
      return NextResponse.json(
        { error: "Billing failed", userErrors },
        { status: 400 }
      );
    }

    if (!confirmationUrl) {
      console.error("❌ Missing confirmation URL");
      return NextResponse.json(
        { error: "Missing confirmation URL from Shopify" },
        { status: 500 }
      );
    }

    console.log("✅ Billing setup success — confirmation URL:", confirmationUrl);
    return NextResponse.json({ confirmationUrl });
  } catch (err: any) {
    console.error("❌ Billing error:", err.message, "\nStack:", err.stack);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: err.message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
      },
      { status: 500 }
    );
  }
}
