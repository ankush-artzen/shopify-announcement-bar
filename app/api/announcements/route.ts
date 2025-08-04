import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import ShortUniqueId from "short-unique-id";
import { findSessionsByShop } from "@/lib/db/session-storage";
import { ObjectId } from "bson"; 

export async function POST(req: NextRequest) {
  try {
    const rawShop = req.nextUrl.searchParams.get("shop");
    const shop = rawShop && rawShop !== "null" ? rawShop : null;

    if (!shop) {
      console.error("❌ Missing or invalid shop param:", rawShop);
      return NextResponse.json(
        { success: false, error: "Missing shop parameter" },
        { status: 400 },
      );
    }

    console.log("🟡 Incoming request to /api/announcements");
    console.log("🛍️  shop param from URL:", shop);

    const body = await req.json();
    console.log("📦 Request body:", body);

    const { name, status = "Active", settings, groupId } = body;

    if (
      !name ||
      typeof name !== "string" ||
      !settings ||
      typeof settings !== "object" ||
      Array.isArray(settings)
    ) {
      console.error("❌ Invalid 'name' or 'settings' format");
      return NextResponse.json(
        { success: false, error: "Missing or invalid 'name' or 'settings'" },
        { status: 400 },
      );
    }

    console.log("🔍 Finding sessions for shop:", shop);
    const sessions = await findSessionsByShop(shop);
    console.log("📂 Sessions found:", sessions);

    let token = sessions?.[0]?.accessToken;

    if (!token && process.env.NODE_ENV === "development") {
      console.warn("⚠️ No token found, using fallback token for dev");
      token = process.env.SHOPIFY_FAKE_TOKEN || "dev-dummy-token";
    }

    if (!token) {
      console.error("❌ Missing access token in DB for shop:", shop);
      return NextResponse.json(
        { success: false, error: "Missing access token in DB" },
        { status: 401 },
      );
    }

    console.log("🔄 Looking for shop record in DB...");
    let shopRecord = await prisma.shop.findUnique({
      where: { name: shop },
      select: { id: true },
    });

    let shopId: string;

    if (!shopRecord) {
      console.log("🆕 Creating new shop record");
      shopId = new ObjectId().toString(); // ✅ Generate ID manually
      shopRecord = await prisma.shop.create({
        data: {
          id: shopId,
          name: shop,
        },
      });
    } else {
      shopId = shopRecord.id;
    }

    const uid = new ShortUniqueId({ length: 10 });
    const customId = uid.rnd();

    // Group ID logic
    let finalGroupId: string;
    if (typeof groupId === "string" && groupId.trim() !== "") {
      finalGroupId = groupId.trim();
    } else {
      const existing = await prisma.announcement.findFirst({
        where: {
          shopId,
          groupId: {
            not: null,
          },
        },
        select: {
          groupId: true,
        },
      });
      finalGroupId = existing?.groupId || uid.rnd();
    }

    // Create announcement
    // ✅ Auto-rename if name already exists
    let finalName = name;
    let counter = 1;

    while (
      await prisma.announcement.findFirst({
        where: { name: finalName, shopId },
      })
    ) {
      finalName = `${name} (${counter})`;
      counter++;
    }

    // ✅ Save announcement with auto-renamed title
    const announcement = await prisma.announcement.create({
      data: {
        id: customId,
        name: finalName,
        status,
        settings,
        groupId: finalGroupId,
        shopId,
      },
    });

    console.log("✅ Announcement saved:", announcement);

    return NextResponse.json({
      success: true,
      message: "Announcement created successfully",
      announcementId: announcement.id,
      savedSettings: announcement.settings,
      data: {
        _id: announcement.id,
        ...announcement,
      },
    });
  } catch (err: any) {
    console.error("❌ Unhandled error saving announcement:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
