import { NextRequest } from "next/server"; 
import shopify from "@/lib/shopify/initialize-context";
import { headers } from "next/headers";

export async function POST(req: NextRequest) { 
  const topic = headers().get("x-shopify-topic");

  const rawBody = await req.text();

  try {
    await shopify.webhooks.process({
      rawBody,
      rawRequest: req,
    });

    console.log(`✅ Webhook for topic "${topic}" processed`);
    return new Response(null, { status: 200 });
  } catch (e) {
    console.error(`❌ Webhook error for topic "${topic}":`, e);
    return new Response("Webhook Error", { status: 500 });
  }
}
