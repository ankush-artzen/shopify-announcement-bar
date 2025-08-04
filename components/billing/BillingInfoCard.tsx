"use client";

import { Card, Text, Link } from "@shopify/polaris";

export default function BillingInfoCard() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "20px 0" }}>
      <div style={{ maxWidth: "840px", width: "100%" }}>
        <Card >
        <Text as="h2" variant="bodyMd">
        Billing Information      </Text>
          <Text as="p" variant="bodyMd">
            You’ll be redirected to Shopify to complete your subscription. Your plan will automatically renew until canceled.
          </Text>
          <Text as="p" variant="bodyMd">
            By subscribing, you agree to our{" "}
            <Link url="/terms" external>Terms of Service</Link>{" "}
            and{" "}
            <Link url="/privacy" external>Privacy Policy</Link>.
          </Text>
        </Card>
      </div>
    </div>
  );
}
