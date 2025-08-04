import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { PLAN_VIEW_LIMITS } from "@/lib/constants";

// CORS preflight handler
export async function OPTIONS() {
  return NextResponse.json({}, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const { bannerId } = await req.json();
    console.log("📩 Received banner view request for ID:", bannerId);

    if (!bannerId) {
      console.warn("⚠️ Missing bannerId in request body");
      return NextResponse.json(
        { success: false, error: "Missing bannerId" },
        {
          status: 400,
          headers: { "Access-Control-Allow-Origin": "*" },
        }
      );
    }

    const banner = await prisma.announcement.findUnique({
      where: { id: bannerId },
      include: { shop: true },
    });

    if (!banner || !banner.shop || !banner.shop.name) {
      console.warn("❌ Announcement or associated shop not found");
      return NextResponse.json(
        { success: false, error: "Announcement not found" },
        {
          status: 404,
          headers: { "Access-Control-Allow-Origin": "*" },
        }
      );
    }

    const shopDomain = banner.shop.name;
    const shopId = banner.shopId;
    console.log("✅ Banner and Shop found:", { bannerId, shopId, shopDomain });

    const billing = await prisma.billing.findFirst({
      where: { shop: shopDomain },
      orderBy: { billingOn: "desc" },
    });

    const now = new Date();
    let plan: "Free" | "Trial" | "Premium" = "Free";

    if (billing) {
      console.log("🧾 Billing found:", {
        billingId: billing.id,
        trialEndsOn: billing.trialEndsOn,
        planExpiresOn: billing.planExpiresOn,
        billingStatus: billing.billingStatus,
      });

      const isTrial = billing.trialEndsOn && billing.trialEndsOn > now;
      const isActive =
        billing.planExpiresOn &&
        billing.planExpiresOn > now &&
        ["active", "pending"].includes(billing.billingStatus || "");

      if (isTrial) plan = "Trial";
      else if (isActive) plan = "Premium";

      console.log("📦 Plan determined:", plan);
    } else {
      console.log("ℹ️ No billing info — defaulting to Free plan");
    }

    const planLimit = PLAN_VIEW_LIMITS[plan] ?? 1;
    const maxViews = banner.viewLimit ?? planLimit;

    console.log("📊 View Limit Info:", {
      planLimit,
      customLimit: banner.viewLimit,
      maxViews,
      currentViews: banner.views,
    });

    if (maxViews !== Infinity && banner.views >= maxViews) {
      console.warn("🚫 View limit exceeded for banner:", banner.views);

      const totalShopViews = await prisma.announcement.aggregate({
        _sum: { views: true },
        where: { shopId },
      });

      console.log("📉 Returning early due to view cap:", {
        totalShopViews: totalShopViews._sum.views || 0,
      });

      return NextResponse.json(
        {
          success: true,
          hideBanner: true,
          plan,
          currentViews: banner.views,
          maxViews,
          totalShopViews: totalShopViews._sum.views || 0,
        },
        {
          status: 200,
          headers: { "Access-Control-Allow-Origin": "*" },
        }
      );
    }

    const updatedBanner = await prisma.announcement.update({
      where: { id: bannerId },
      data: { views: { increment: 1 } },
    });

    console.log("➕ Incremented view count:", {
      updatedViews: updatedBanner.views,
    });

    const totalShopViews = await prisma.announcement.aggregate({
      _sum: { views: true },
      where: { shopId },
    });

    const totalViews = totalShopViews._sum.views || 0;
    const shouldHide = updatedBanner.views >= maxViews;

    console.log("✅ Final response:", {
      success: true,
      plan,
      currentViews: updatedBanner.views,
      maxViews,
      hideBanner: shouldHide,
      totalShopViews: totalViews,
    });

    return NextResponse.json(
      {
        success: true,
        hideBanner: shouldHide,
        plan,
        currentViews: updatedBanner.views,
        maxViews,
        totalShopViews: totalViews,
      },
      {
        status: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
      }
    );
  } catch (error) {
    console.error("❌ banner-view error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      {
        status: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
      }
    );
  }
}
