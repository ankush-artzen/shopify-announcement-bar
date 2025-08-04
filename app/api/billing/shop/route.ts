
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ error: "Missing session token" }, { status: 401 });
  }

  try {
    const payloadBase64 = token.split(".")[1];
    const decoded = JSON.parse(Buffer.from(payloadBase64, "base64").toString("utf8"));
    const shop = decoded.dest?.replace(/^https:\/\//, "");

    if (!shop) {
      return NextResponse.json({ error: "Invalid token payload" }, { status: 400 });
    }

    return NextResponse.json({ shop });
  } catch (error) {
    console.error("❌ Failed to decode session token:", error);
    return NextResponse.json({ error: "Invalid session token" }, { status: 400 });
  }
}
