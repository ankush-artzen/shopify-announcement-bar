import { NextRequest, NextResponse } from 'next/server';
zimport { findSessionsByShop } from '@/lib/db/session-storage';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { shop, settings } = body;

  if (!shop || !settings) {
    return NextResponse.json({ error: "Missing shop or settings" }, { status: 400 });
  }

  try {
    const [session] = await findSessionsByShop(shop); 
    if (!session) {
      return NextResponse.json({ error: "No active session found for this shop" }, { status: 404 });
    }

    const client = new shopify.clients.Rest({ session }); // ✅ correctly configured client

    const metafield = await client.post({
      path: 'metafields',
      data: {
        metafield: {
          namespace: 'countdown_banner',
          key: 'settings',
          type: 'json',
          value: JSON.stringify(settings),
        },
      },
      type: 'application/json',
    });

    return NextResponse.json({ success: true, metafield: metafield.body.metafield });
  } catch (error) {
    console.error("Failed to save metafield:", error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
