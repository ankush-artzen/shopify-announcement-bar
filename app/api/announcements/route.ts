import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, status, settings } = body;

    if (!name || !settings) {
      return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
    }

    const announcement = await prisma.announcement.create({
      data: {
        name,
        status,
        settings,
      },
    });

    return NextResponse.json({ success: true, announcement });
  } catch (err) {
    console.error("❌ Error saving announcement:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Unknown Error" },
      { status: 500 }
    );
  }
}
