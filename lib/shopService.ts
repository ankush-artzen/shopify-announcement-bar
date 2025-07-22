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
export async function updateShopBillingStatus(shop: string, billingInfo: any) {
  return await prisma.session.updateMany({
    where: { shop },
    data: {
      billingStatus: billingInfo.status,
      chargeId: billingInfo.chargeId,
      planName: billingInfo.planName,
      price: billingInfo.price,
      billingOn: billingInfo.billingOn,
    },
  });
}
