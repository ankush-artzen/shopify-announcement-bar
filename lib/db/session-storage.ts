import { Session as PrismaSession } from "@prisma/client";
import { Session as ShopifySession } from "@shopify/shopify-api";
import prisma from "./prisma-connect";

const apiKey = process.env.SHOPIFY_API_KEY || "";

/**
 * Store or update a Shopify session in the database
 */
export async function storeSession(session: ShopifySession) {
  await prisma.session.upsert({
    where: { id: session.id },
    update: {
      shop: session.shop,
      accessToken: session.accessToken,
      scope: session.scope,
      expires: session.expires,
      isOnline: session.isOnline,
      state: session.state,
      apiKey,
    },
    create: {
      id: session.id,
      shop: session.shop,
      accessToken: session.accessToken,
      scope: session.scope,
      expires: session.expires,
      isOnline: session.isOnline,
      state: session.state,
      apiKey,
    },
  });

  // Handle online access info and associated user
  if (session.onlineAccessInfo) {
    const onlineAccessInfo = await prisma.onlineAccessInfo.upsert({
      where: { sessionId: session.id },
      update: {
        expiresIn: session.onlineAccessInfo.expires_in,
        associatedUserScope: session.onlineAccessInfo.associated_user_scope,
      },
      create: {
        sessionId: session.id,
        expiresIn: session.onlineAccessInfo.expires_in,
        associatedUserScope: session.onlineAccessInfo.associated_user_scope,
      },
    });

    const { associated_user } = session.onlineAccessInfo;
    if (associated_user) {
      await prisma.associatedUser.upsert({
        where: { onlineAccessInfoId: onlineAccessInfo.id },
        update: {
          firstName: associated_user.first_name,
          lastName: associated_user.last_name,
          email: associated_user.email,
          emailVerified: associated_user.email_verified,
          accountOwner: associated_user.account_owner,
          locale: associated_user.locale,
          collaborator: associated_user.collaborator,
          userId: associated_user.id,
        },
        create: {
          onlineAccessInfoId: onlineAccessInfo.id,
          firstName: associated_user.first_name,
          lastName: associated_user.last_name,
          email: associated_user.email,
          emailVerified: associated_user.email_verified,
          accountOwner: associated_user.account_owner,
          locale: associated_user.locale,
          collaborator: associated_user.collaborator,
          userId: associated_user.id,
        },
      });
    }
  }
}

/**
 * Load a single session by ID
 */
export async function loadSession(id: string): Promise<ShopifySession> {
  const session = await prisma.session.findUnique({
    where: { id },
  });

  if (!session) {
    throw new SessionNotFoundError();
  }

  return generateShopifySessionFromDB(session);
}

/**
 * Delete a session by ID
 */
export async function deleteSession(id: string) {
  await prisma.session.delete({
    where: { id },
  });
}

/**
 * Delete multiple sessions by IDs
 */
export async function deleteSessions(ids: string[]) {
  await prisma.session.deleteMany({
    where: { id: { in: ids } },
  });
}

/**
 * Remove all sessions for a specific shop + access token
 */
export async function cleanUpSession(shop: string, accessToken: string) {
  await prisma.session.deleteMany({
    where: { shop, accessToken, apiKey },
  });
}

/**
 * Find all stored sessions for a given shop
 */
export async function findSessionsByShop(shop: string): Promise<ShopifySession[]> {
  const sessions = await prisma.session.findMany({
    where: { shop, apiKey },
    include: {
      onlineAccessInfo: {
        include: {
          associatedUser: true,
        },
      },
    },
  });

  return sessions.map((session) => generateShopifySessionFromDB(session));
}

/**
 * Convert Prisma session to a Shopify-compatible Session object
 */
function generateShopifySessionFromDB(session: PrismaSession): ShopifySession {
  return new ShopifySession({
    id: session.id,
    shop: session.shop,
    accessToken: session.accessToken ?? undefined,
    scope: session.scope ?? undefined,
    state: session.state,
    isOnline: session.isOnline,
    expires: session.expires ?? undefined,
  });
}

/**
 * Custom error class for missing session
 */
export class SessionNotFoundError extends Error {
  constructor() {
    super("Session not found");
    this.name = "SessionNotFoundError";
  }
}

export async function findAllSessions() {
  const sessions = await prisma.session.findMany({
    select: {
      shop: true,
      accessToken: true,
    },
    where: {
      accessToken: {
        not: null,
      },
    },
  });

  return sessions;
}
