import "@shopify/shopify-api/adapters/node";
import { shopifyApi, DeliveryMethod } from "@shopify/shopify-api";
import { findAllSessions } from "../../../../lib/db/session-storage";

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY!,
  apiSecretKey: process.env.SHOPIFY_SECRET!,
  scopes: process.env.SCOPES!.split(","),
  hostName: process.env.HOST!.replace(/^https?:\/\//, ""),
  apiVersion: "2025-07", 
  isEmbeddedApp: true,
});

const billingTopics = [
  "APP_SUBSCRIPTIONS_UPDATE",
  "APP_SUBSCRIPTIONS_CANCELLED",
  "APP_SUBSCRIPTIONS_APPROACHING_CAPPED_AMOUNT",
  "APP_SUBSCRIPTIONS_RENEWED",
  "APP_USAGE_CHARGES_CREATE",
];

export async function GET() {
  const allSessions = await findAllSessions();

  for (const session of allSessions) {
    for (const topic of billingTopics) {
      const webhookRes = await shopify.webhooks.register({
        shop: session.shop,
        accessToken: session.accessToken,
        path: "/api/webhooks/billing",
        topic,
        deliveryMethod: DeliveryMethod.Http,
      });

      console.log(`[${session.shop}] → ${topic}: ${webhookRes.success ? "✅" : "❌"}`);
    }
  }

  return new Response("Webhook setup complete");
}
