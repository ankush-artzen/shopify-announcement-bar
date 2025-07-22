import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Handles PUT request: Save settings for the logged-in user
export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await req.json();
    const email = session.user.email;

    const user = await User.findOneAndUpdate(
      { email },
      { settings: body },
      { new: true, upsert: true }
    );

    return NextResponse.json({ message: "Settings saved", settings: user.settings }, { status: 200 });
  } catch (err) {
    console.error("Error saving settings:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
