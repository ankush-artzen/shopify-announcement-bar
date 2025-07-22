import verifyShopifyWebhook from "@/utils/verifyWebhook";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const verified = verifyShopifyWebhook(req);
  if (!verified) return res.status(401).end();

  console.log("Customer Redacted:", req.body);

  res.status(200).send("OK");
}
