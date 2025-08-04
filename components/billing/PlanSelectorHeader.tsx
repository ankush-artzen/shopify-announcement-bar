"use client";

import { Card, Text, InlineStack } from "@shopify/polaris";

export default function PlanSelectorHeader({
  activePlan,
  planExpiresOn,
}: {
  activePlan: string;
  planExpiresOn?: Date | null;
}) {
  const isFreePlan = activePlan === "Free";
  const isPremiumPlan = activePlan === "Premium";

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div style={{ maxWidth: "840px", width: "100%" }}>
        <Text variant="headingMd" as="h3">
          Select plan
        </Text>

        <div style={{ marginTop: "12px" }}>
          <Card>
            <InlineStack align="space-between" blockAlign="center">
              <div>
                <Text variant="headingSm" as="h4">
                  You’re currently on <b>{activePlan}</b>
                </Text>

                {isFreePlan && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "12px",
                      marginTop: "8px",
                    }}
                  >
                    <Text as="span" variant="bodySm">
                      ✔ Up to <b>500</b> monthly views
                    </Text>
                    <Text as="span" variant="bodySm">
                      ✔ Unlimited simple bars
                    </Text>
                    <Text as="span" variant="bodySm">
                      ✔ Unlimited rotating bars
                    </Text>
                  </div>
                )}

                {isPremiumPlan && (
                  <div style={{ marginTop: "6px", display: "block" }}>
                    <Text as="span" variant="bodySm" tone="subdued">
                      You can access all premium features with Unlimited plan
                    </Text>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "12px",
                        marginTop: "8px",
                      }}
                    >
                      <Text as="span" variant="bodySm">
                        ✔ Up to <b>10,000</b> monthly views
                      </Text>
                      <Text as="span" variant="bodySm">
                        ✔ Unlimited simple bars
                      </Text>
                      <Text as="span" variant="bodySm">
                        ✔ Unlimited rotating bars
                      </Text>
                      <Text as="span" variant="bodySm">
                        ✔ Premium carousel bars
                      </Text>
                      <Text as="span" variant="bodySm">
                        ✔ View limiter & countdown
                      </Text>
                    </div>
                  </div>
                )}

                {/* Uncomment if needed to show plan expiration
                {planExpiresOn && (
                  <div style={{ marginTop: "16px" }}>
                    <Text alignment="center" variant="bodySm" tone="subdued">
                      ⏳ Your plan will expire on{" "}
                      <strong>{planExpiresOn.toLocaleDateString()}</strong>.
                    </Text>
                  </div>
                )} */}
              </div>
            </InlineStack>
          </Card>
        </div>
      </div>
    </div>
  );
}
