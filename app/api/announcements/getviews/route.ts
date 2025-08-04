import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const shop = searchParams.get("shop");

  if (!shop) {
    return NextResponse.json({ success: false, error: "Missing shop parameter" }, { status: 400 });
  }

  try {
    const banners = await prisma.announcement.findMany({
      where: { shop: { name: shop } },
      select: { views: true },
    });

    const totalViews = banners.reduce((sum, banner) => sum + (banner.views || 0), 0);

    return NextResponse.json({ success: true, shop, totalViews });
  } catch (err) {
    console.error("❌ Error fetching total views for shop:", shop, err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
