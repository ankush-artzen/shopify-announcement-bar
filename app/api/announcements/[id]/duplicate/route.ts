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

    const uid = new ShortUniqueId({ length: 10 });
    const newId = uid.rnd();

    let baseName = original.name;
    const copyIndex = baseName.indexOf(" (Copy");
    if (copyIndex !== -1) {
      baseName = baseName.slice(0, copyIndex);
    }

    let count = 0;

    while (true) {
      const suffix = count === 0 ? " (Copy)" : ` (Copy ${count + 1})`;
      const name = `${baseName}${suffix}`;

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
          error.code === "P2002" &&
          error.meta?.target === "Announcement_name_shopId_key";

        if (!isUniqueError) {
          console.error("❌ Unexpected error:", error);
          return NextResponse.json(
            { success: false, error: error.message || "Something went wrong" },
            { status: 500 }
          );
        }

        // Duplicate name, retry with next
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
