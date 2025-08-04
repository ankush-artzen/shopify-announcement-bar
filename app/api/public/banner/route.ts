import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ✅ Add CORS headers for public access
function withCors(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}

// ✅ GET /api/public/banner?id=<bannerId>
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const bannerId = searchParams.get("id");

  if (!bannerId || typeof bannerId !== "string" || bannerId.trim() === "") {
    console.warn("⚠️ Missing or invalid banner ID:", bannerId);
    return withCors(
      NextResponse.json(
        { success: false, error: "Missing or invalid banner ID" },
        { status: 400 }
      )
    );
  }

  try {
    console.log("📣 Fetching banner with ID:", bannerId);

    const banner = await prisma.announcement.findUnique({
      where: { id: bannerId },
    });

    if (!banner) {
      return withCors(
        NextResponse.json(
          { success: false, error: "Banner not found" },
          { status: 404 }
        )
      );
    }

    if (banner.status !== "Active") {
      return withCors(
        NextResponse.json(
          { success: false, error: "Banner is inactive" },
          { status: 403 }
        )
      );
    }

    return withCors(
      NextResponse.json({
        success: true,
        data: {
          id: banner.id,
          name: banner.name,
          status: banner.status,
          settings: banner.settings,
          createdAt: banner.createdAt,
          updatedAt: banner.updatedAt,
        },
      })
    );
  } catch (error: any) {
    console.error("❌ Error fetching banner:", error);

    const isPrismaError = error?.code === "P2023";
    return withCors(
      NextResponse.json(
        {
          success: false,
          error: isPrismaError
            ? "Invalid banner ID format"
            : error?.message || "Internal server error",
        },
        { status: isPrismaError ? 400 : 500 }
      )
    );
  }
}

// ✅ Handle CORS preflight
export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}
