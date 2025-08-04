import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ----------------------------------
// 🔍 GET /api/announcements/[id]
// ----------------------------------
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const announcement = await prisma.announcement.findUnique({
      where: { id: params.id },
    });

    if (!announcement) {
      return NextResponse.json(
        { success: false, error: "Announcement not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: true, data: announcement },
      { status: 200 },
    );
  } catch (error) {
    console.error("❌ GET error:", error);
    return handleError(error, "Failed to fetch announcement");
  }
}

// ----------------------------------
// ✏️ PATCH /api/announcements/[id]
// ----------------------------------
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await req.json();
    console.log("🛠 PATCH body:", body);

    const { name, status, settings } = body;
    const updateData: Record<string, any> = {};

    if (name !== undefined) updateData.name = name;
    if (status !== undefined) updateData.status = status;

    if (settings !== undefined) {
      try {
        updateData.settings =
          typeof settings === "string" ? JSON.parse(settings) : settings;
      } catch {
        return NextResponse.json(
          { success: false, error: "Invalid JSON in settings" },
          { status: 400 },
        );
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid fields to update" },
        { status: 400 },
      );
    }

    const existing = await prisma.announcement.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Announcement not found" },
        { status: 404 },
      );
    }

    // 🔁 Check for name conflict
    if (name && name !== existing.name) {
      const duplicate = await prisma.announcement.findFirst({
        where: {
          name,
          shopId: existing.shopId,
          NOT: { id: params.id },
        },
      });

      if (duplicate) {
        return NextResponse.json(
          {
            success: false,
            error: `Another announcement with the name "${name}" already exists for this shop.`,
          },
          { status: 409 },
        );
      }
    }

    const updated = await prisma.announcement.update({
      where: { id: params.id },
      data: updateData,
    });

    console.log("✅ Announcement updated:", updated);
    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        {
          success: false,
          error: "Announcement name must be unique for this shop.",
        },
        { status: 409 },
      );
    }

    console.error("❌ PATCH error:", error);
    return handleError(error, "Failed to update announcement");
  }
}
// ----------------------------------
// ❌ DELETE /api/announcements/[id]
// ----------------------------------
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const deleted = await prisma.announcement.delete({
      where: { id: params.id },
    });

    console.log("🗑️ Deleted announcement:", deleted);

    return NextResponse.json({ success: true, data: deleted }, { status: 200 });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { success: false, error: "Announcement not found" },
        { status: 404 },
      );
    }

    console.error("❌ DELETE error:", error);
    return handleError(error, "Failed to delete announcement");
  }
}

// ----------------------------------
// 🔁 Shared error handler
// ----------------------------------
function handleError(error: unknown, fallbackMsg: string) {
  return NextResponse.json(
    {
      success: false,
      error: error instanceof Error ? error.message : fallbackMsg,
    },
    { status: 500 },
  );
}
