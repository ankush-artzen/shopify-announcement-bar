"use client";

import { Layout, Card, Text, ProgressBar } from "@shopify/polaris";

export default function CurrentPlanCard({ activePlan }: { activePlan: string }) {
  return (
    <Layout.Section>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{ maxWidth: "840px", width: "100%" }}>
          <Card>
            <Text as="p" variant="bodyMd">
              You’re currently on <b>{activePlan}</b> (0 / 2000 monthly views). One visitor can have multiple views per session.
            </Text>
            <div style={{ marginTop: "12px" }}>
              <ProgressBar progress={0} size="small" />
            </div>
          </Card>
        </div>
      </div>
    </Layout.Section>
  );
}
