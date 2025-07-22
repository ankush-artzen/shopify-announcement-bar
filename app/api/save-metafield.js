import { shopifyApi } from "@shopify/shopify-api";
import shopify from "../../../shopify.server"; // your Shopify setup

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Only POST allowed");

  const { namespace, key, value } = req.body;
  const session = await shopify.session.getCurrent({ isOnline: true, rawRequest: req });

  const client = new shopify.api.clients.Rest({ session });

  await client.put({
    path: "metafields",
    data: {
      metafield: {
        namespace,
        key,
        type: "json",
        value: JSON.stringify(value),
        owner_resource: "shop",
        owner_id: session.shop,
      },
    },
    type: "application/json",
  });

  res.status(200).json({ success: true });
}
