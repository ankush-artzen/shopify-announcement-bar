"use client";

import { Banner, Layout, Text } from "@shopify/polaris";

export default function ErrorBanner({ message }: { message: string }) {
  return (
    <Layout.Section>
      <Banner title="Error" tone="critical">
        <Text as="p" variant="bodyMd">
          {message}
        </Text>
      </Banner>
    </Layout.Section>
  );
}
