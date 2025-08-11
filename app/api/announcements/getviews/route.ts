import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const shop = searchParams.get("shop");

  if (!shop) {
    return NextResponse.json(
      { success: false, error: "Missing shop parameter" },
      { status: 400 }
    );
  }

  try {
    // Fetch shop views directly from persistent field
    const shopData = await prisma.shop.findUnique({
      where: { name: shop },
      select: { views: true },
    });

    if (!shopData) {
      return NextResponse.json(
        { success: false, error: "Shop not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      shop,
      totalViews: shopData.views || 0,
    });
  } catch (err) {
    console.error("❌ Error fetching total views for shop:", shop, err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
