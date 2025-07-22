import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Settings = {
  enableViewLimit?: boolean;
  viewCount?: number;
  maxViews?: number;
  maxViewsLimit?: number;
  [key: string]: any;
};

export async function POST(req: Request) {
  try {
    const { bannerId } = await req.json();

    if (!bannerId) {
      return NextResponse.json({ error: "Missing bannerId" }, { status: 400 });
    }

    const banner = await prisma.announcement.findUnique({
      where: { id: bannerId },
    });

    if (!banner) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    }

    let settings: Settings = {};

    if (typeof banner.settings === "object" && banner.settings !== null) {
      settings = banner.settings as Settings;
    }

    const enableViewLimit = settings.enableViewLimit ?? false;
    const currentViewCount = settings.viewCount ?? 0;
    const maxViews = settings.maxViews ?? settings.maxViewsLimit ?? 5;

    if (enableViewLimit && currentViewCount >= maxViews) {
      return NextResponse.json({ hideBanner: true });
    }

    const updatedSettings = {
      ...settings,
      viewCount: currentViewCount + 1,
    };

    await prisma.announcement.update({
      where: { id: bannerId },
      data: {
        settings: updatedSettings,
      },
    });

    return NextResponse.json({
      hideBanner: false,
      updatedViewCount: updatedSettings.viewCount,
    });
  } catch (error: any) {
    console.error("❌ Banner view error:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}
