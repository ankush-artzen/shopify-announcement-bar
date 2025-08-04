import { prisma } from "@/lib/prisma";

/**
 * Gets the most recent access token for a given shop
 */
export async function getShopAccessToken(shop: string): Promise<string | null> {
  const session = await prisma.session.findFirst({
    where: { shop },
    orderBy: { updatedAt: "desc" },
  });

  return session?.accessToken ?? null;
}

/**
 * Optional: Store billing info in Session (or another model)
 */
// export async function updateShopBillingStatus(shop: string, billingInfo: any) {
//   return await prisma.session.updateMany({
//     where: { shop },
//     data: {
//       billingStatus: billingInfo.status,
//       chargeId: billingInfo.chargeId,
//       planName: billingInfo.planName,
//       price: billingInfo.price,
//       billingOn: billingInfo.billingOn,
//     },
//   });
// }
export async function storeShopifySession(session: any) {
  const existing = await prisma.session.findFirst({
    where: { shop: session.shop },
    orderBy: { updatedAt: "desc" },
  });

  if (existing) {
    console.log("🔁 Updating session for:", session.shop);
    await prisma.session.update({
      where: { id: existing.id },
      data: {
        accessToken: session.accessToken,
        updatedAt: new Date(),
        ...session,
      },
    });
  } else {
    console.log("💾 Creating session for:", session.shop);
    await prisma.session.create({ data: session });
  }
}

