import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const original = await prisma.announcement.findUnique({
      where: { id: params.id },
    });

    if (!original) {
      return NextResponse.json(
        { success: false, error: "Announcement not found" },
        { status: 404 }
      );
    }

    let baseName = original.name;
    const copyIndex = baseName.indexOf(" (Copy");
    if (copyIndex !== -1) {
      baseName = baseName.slice(0, copyIndex);
    }

    const existing = await prisma.announcement.findMany({
      where: {
        name: {
          startsWith: baseName,
        },
      },
      select: { name: true },
    });

    let nextName = `${baseName} (Copy)`;
    let count = 1;

    const existingNames = existing.map((a) => a.name);
    while (existingNames.includes(nextName)) {
      nextName = `${baseName} (Copy ${count})`;
      count++;
    }

    const duplicated = await prisma.announcement.create({
      data: {
        name: nextName,
        status: "Paused",
        settings: original.settings ?? {}, // Use optional chaining and default empty
      },
    });

    return NextResponse.json({ success: true, announcement: duplicated });
  } catch (error: any) {
    console.error("❌ Duplicate error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
