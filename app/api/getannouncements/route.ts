import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    console.log("🟡 GET /api/getannouncements called");

    const rawShop = req.nextUrl.searchParams.get("shop");
    const shop = rawShop && rawShop !== "null" ? rawShop : null;

    console.log("🔍 shop param from URL:", rawShop);
    if (!shop) {
      console.error("❌ Missing or invalid shop parameter");
      return NextResponse.json({ error: "Missing shop parameter" }, { status: 400 });
    }

    console.log("🔄 Looking for shop record in DB...");
    const shopRecord = await prisma.shop.findUnique({
      where: { name: shop },
      select: { id: true },
    });

    if (!shopRecord) {
      console.warn(`⚠️ No shop record found for "${shop}", returning empty list`);
      return NextResponse.json([], { status: 200 });
    }

    console.log("✅ Shop record found:", shopRecord.id);
    console.log("📦 Fetching announcements for shopId:", shopRecord.id);

    const announcements = await prisma.announcement.findMany({
      where: {
        shopId: shopRecord.id,
      },
      select: {
        id: true,
        name: true,
        status: true,
        settings: true,
        groupId: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(`📣 Found ${announcements.length} announcements for shop: ${shop}`);
    return NextResponse.json(announcements);
  } catch (error) {
    console.error("❌ GET /api/getannouncements error:", error);
    return NextResponse.json(
      { error: "Failed to fetch announcements" },
      { status: 500 }
    );
  }
}
