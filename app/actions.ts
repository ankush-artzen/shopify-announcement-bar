"use server";

import { registerWebhooks } from "@/lib/shopify/register-webhooks";
import { handleSessionToken } from "@/lib/shopify/verify";

/**
 * Do a server action and return the shop if valid
 */
export async function doServerAction(
  sessionToken: string,
): Promise<{
  status: "success" | "error";
  data?: {
    shop: string;
  };
}> {
  try {
    const {
      session: { shop },
    } = await handleSessionToken(sessionToken, false, false); // no store

    return {
      status: "success",
      data: {
        shop,
      },
    };
  } catch (error: any) {
    console.error("❌ doServerAction error:", error.message || error);
    return {
      status: "error",
    };
  }
}

/**
 * Store the session + accessToken in the database using Prisma
 */
export async function storeToken(sessionToken: string) {
  try {
    const { session } = await handleSessionToken(sessionToken, false, true); // store = true
    console.log("✅ Token stored for shop:", session.shop);
  } catch (error: any) {
    console.error("❌ storeToken error:", error.message || error);
    throw error;
  }
}

/**
 * Register Shopify webhooks after session is validated
 */
export async function doWebhookRegistration(sessionToken: string) {
  try {
    const { session } = await handleSessionToken(sessionToken, false, true); // store = true
    await registerWebhooks(session);
    console.log("✅ Webhooks registered for:", session.shop);
  } catch (error: any) {
    console.error("❌ Webhook registration error:", error.message || error);
    throw error;
  }
}
