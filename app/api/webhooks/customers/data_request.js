import verifyShopifyWebhook from "@/utils/verifyWebhook";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const verified = verifyShopifyWebhook(req);
  if (!verified) return res.status(401).end("Unauthorized");

  // Handle Data Request
  console.log("Customer Data Request:", req.body);

  res.status(200).send("OK");
}
