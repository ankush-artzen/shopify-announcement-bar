"use client";

import { Card, Text, Link, Button } from "@shopify/polaris";

export default function BillingInfo({
  onCancel,
  isLoading,
}: {
  onCancel: () => void;
  isLoading: boolean;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "20px 0" }}>
      <div style={{ maxWidth: "840px", width: "100%" }}>
        <Card sectioned title="Billing Information">
          <Text as="p" variant="bodyMd">
            You’ll be redirected to Shopify to complete your subscription. Your plan will automatically renew until canceled.
          </Text>
          <Text as="p" variant="bodyMd">
            By subscribing, you agree to our{" "}
            <Link url="/terms" external>Terms of Service</Link> and{" "}
            <Link url="/privacy" external>Privacy Policy</Link>.
          </Text>

          <div style={{ marginTop: "16px", textAlign: "center" }}>
            <Button
              tone="critical"
              variant="tertiary"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel Subscription
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
