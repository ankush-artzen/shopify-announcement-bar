import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import ShortUniqueId from "short-unique-id";
import { Prisma } from "@prisma/client";

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
    let startCount = 0;

    // ✅ Detect existing duplicate number and set startCount accordingly
    const match = baseName.match(/\(duplicate(?:\s+(\d+))?\)$/i);
    if (match) {
      // Remove the "(duplicate...)" part from baseName
      baseName = baseName.replace(/\s*\(duplicate(?:\s+\d+)?\)$/i, "");
      startCount = match[1] ? parseInt(match[1], 10) : 1;
    }

    let count = startCount;
    const uid = new ShortUniqueId({ length: 10 });

    while (true) {
      const suffix =
        count === 0
          ? " (duplicate)"
          : count === 1
          ? " (duplicate 2)"
          : ` (duplicate ${count + 1})`;

      const name = `${baseName}${suffix}`;
      const newId = uid.rnd();

      try {
        const duplicated = await prisma.announcement.create({
          data: {
            id: newId,
            name,
            status: "Paused",
            settings: original.settings ?? {},
            shopId: original.shopId,
            groupId: original.groupId,
          },
        });

        return NextResponse.json({ success: true, announcement: duplicated });
      } catch (error: any) {
        const isUniqueError =
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002";

        if (!isUniqueError) {
          console.error("❌ Unexpected error:", error);
          return NextResponse.json(
            { success: false, error: error.message || "Something went wrong" },
            { status: 500 }
          );
        }

        count++; 
      }
    }
  } catch (error: any) {
    console.error("❌ Critical error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
