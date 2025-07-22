import "@shopify/shopify-api/adapters/node";
import { shopifyApi, DeliveryMethod } from "@shopify/shopify-api";
import { NextRequest } from "next/server";

// 1️⃣ Initialize the Shopify API inline
const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY!,
  apiSecretKey: process.env.SHOPIFY_SECRET!,
  scopes: process.env.SCOPES!.split(","),
  hostName: process.env.HOST!.replace(/^https?:\/\//, ""),
  apiVersion: "2025-07",
  isEmbeddedApp: true,
});

// 2️⃣ Define webhook handlers
const webhookHandlers = {
  APP_SUBSCRIPTIONS_UPDATE: async (topic: string, shop: string, body: any) => {
    console.log(`📩 ${topic} for ${shop}`);
    console.log("📦 Payload:", body);
    // Optional: Update plan info in DB
  },

  APP_SUBSCRIPTIONS_CANCELLED: async (topic: string, shop: string, body: any) => {
    console.log(`❌ Subscription cancelled for ${shop}`);
    // Optional: Mark plan as cancelled in DB
  },

  APP_SUBSCRIPTIONS_RENEWED: async (topic: string, shop: string, body: any) => {
    console.log(`🔁 Subscription renewed for ${shop}`);
  },

  APP_SUBSCRIPTIONS_APPROACHING_CAPPED_AMOUNT: async (topic: string, shop: string, body: any) => {
    console.log(`⚠️ Approaching capped amount for ${shop}`);
  },

  APP_USAGE_CHARGES_CREATE: async (topic: string, shop: string, body: any) => {
    console.log(`💳 Usage charge created for ${shop}`);
    console.log("💰 Details:", body);
  },
};

// 3️⃣ Handle the webhook
export async function POST(req: NextRequest) {
  try {
    const response = await shopify.webhooks.process({
      rawBody: await req.text(),
      rawRequest: req,
      rawResponse: new Response(), // dummy response (not used)
      webhookHandlers,
    });

    if (!response.ok) {
      console.error("❌ Webhook rejected");
      return new Response("Webhook processing failed", { status: 400 });
    }

    return new Response("Webhook received", { status: 200 });
  } catch (error: any) {
    console.error("❌ Webhook error:", error.message);
    return new Response("Webhook error", { status: 500 });
  }
}
