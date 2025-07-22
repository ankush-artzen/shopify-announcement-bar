"use client";

import { useEffect } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { getSessionToken } from "@shopify/app-bridge-utils";
import { doWebhookRegistration, storeToken } from "../actions";

export default function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const app = useAppBridge();

  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      try {
        const token = await getSessionToken(app); 

        if (!token) {
          console.warn("No token returned from getSessionToken(app)");
          return;
        }

        await storeToken(token);
        console.log("✅ Token stored");

        await doWebhookRegistration(token);
        console.log("✅ Webhook registered");
      } catch (error) {
        console.error("❌ SessionProvider error:", error);
      }
    }

    if (isMounted && app) initSession();

    return () => {
      isMounted = false;
    };
  }, [app]);

  return <>{children}</>;
}
