import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ✅ Add CORS headers
function withCors(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}

// ✅ GET /api/public/banner/group?id=<groupId>
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const groupId = searchParams.get("id");

  if (!groupId || typeof groupId !== "string" || groupId.trim() === "") {
    console.warn("⚠️ Missing or invalid group ID:", groupId);
    return withCors(
      NextResponse.json(
        { success: false, error: "Missing or invalid group ID" },
        { status: 400 }
      )
    );
  }

  try {
    console.log("📣 Fetching announcements with group ID:", groupId);

    // ✅ Fetch all announcements with the same groupId
    const announcements = await prisma.announcement.findMany({
      where: {
        groupId,
        status: "Active", // remove this line if you want ALL regardless of status
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (announcements.length === 0) {
      return withCors(
        NextResponse.json(
          { success: false, error: "No announcements found for this group" },
          { status: 404 }
        )
      );
    }

    return withCors(
      NextResponse.json({
        success: true,
        count: announcements.length,
        data: announcements,
      })
    );
  } catch (error: any) {
    console.error("❌ Error fetching announcements:", error);
    return withCors(
      NextResponse.json(
        {
          success: false,
          error: error?.message || "Internal server error",
        },
        { status: 500 }
      )
    );
  }
}

// ✅ Handle CORS preflight
export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}
