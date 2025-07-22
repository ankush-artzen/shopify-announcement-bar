export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });
  
    try {
      const { metafields } = req.body;
  
      const shop = req.headers['x-shopify-shop']; // e.g., your-app.myshopify.com
      const accessToken = req.headers['x-shopify-access-token']; // Get from session or headers
  
      if (!shop || !accessToken) {
        return res.status(401).json({ error: "Missing shop or access token" });
      }
  
      const saved = [];
  
      for (const meta of metafields) {
        const resMeta = await fetch(`https://${shop}/admin/api/2024-04/metafields.json`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": accessToken,
          },
          body: JSON.stringify({
            metafield: {
              namespace: meta.namespace,
              key: meta.key,
              value: meta.value,
              type: meta.type,
              owner_resource: "shop",
            },
          }),
        });
  
        const data = await resMeta.json();
        if (!resMeta.ok) throw new Error(data.errors?.message || JSON.stringify(data));
        saved.push(data.metafield);
      }
  
      return res.status(200).json({ success: true, metafields: saved });
    } catch (err) {
      console.error("Metafield Save Error:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }
  