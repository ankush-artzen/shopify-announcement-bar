// import { NextResponse } from "next/server";
// import prisma from "@/lib/prisma"; 

// export async function GET(req: Request) {
//   const { searchParams } = new URL(req.url);
//   const shop = searchParams.get("shop");

//   if (!shop) {
//     return NextResponse.json({ error: "Missing shop parameter" }, { status: 400 });
//   }

//   try {
//     const session = await prisma.session.findUnique({
//       where: { shop },
//       select: {
//         billingStatus: true,
//         planName: true,
//         chargeId: true,
//       },
//     });

//     if (!session) {
//       return NextResponse.json(
//         { error: "Shop session not found" },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json({
//       shop,
//       billingStatus: session.billingStatus,
//       planName: session.planName,
//       chargeId: session.chargeId,
//     });
//   } catch (error) {
//     console.error("❌ Failed to get billing status:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }
// /app/api/billing/status/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const shop = searchParams.get("shop");

  if (!shop) {
    return NextResponse.json({ error: "Missing shop parameter" }, { status: 400 });
  }

  try {
    const billing = await prisma.billing.findFirst({
      where: { shop },
      orderBy: { createdAt: "desc" }, // in case multiple
    });

    if (!billing) {
      return NextResponse.json({ billingStatus: "inactive", billing: null });
    }

    return NextResponse.json({
      billingStatus: billing.billingStatus || "inactive",
      billing,
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch billing info" }, { status: 500 });
  }
}
