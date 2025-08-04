import { NextRequest, NextResponse } from "next/server";
import { getShopAccessToken } from "@/lib/shopService";

export async function GET(req: NextRequest) {
  const shop = req.nextUrl.searchParams.get("shop")?.trim();

  if (!shop) {
    return NextResponse.json(
      { success: false, error: "Missing shop parameter" },
      { status: 400 }
    );
  }

  const accessToken = await getShopAccessToken(shop); 

  return NextResponse.json({
    success: true,
    hasAccessToken: !!accessToken,
  });
}
