"use client";

import React from "react";
import {
  Page,
  Layout,
  Card,
  Text,
  MediaCard,
  Banner,
  BlockStack,
} from "@shopify/polaris";
import { useRouter } from "next/navigation";
import { StarFilledIcon } from "@shopify/polaris-icons";



export default function LandingPage() {
  const router = useRouter();

  return (
    <Page fullWidth>
      <Layout>
        {/* Hero Section */}
        <Layout.Section>
          <Card
            padding={{ xs: "400", sm: "500" }}
            background="bg-surface"
            roundedAbove="sm"
          >
            <BlockStack gap="400" align="center">
              <Text variant="headingLg" as="h1" alignment="center">
                Welcome to Announcement Pro
              </Text>
              <Text variant="headingMd" as="h2" alignment="center">
                Your all-in-one app for publishing powerful, on-brand store
                banners
              </Text>
              <Text as="p" variant="headingSm" alignment="center">
                Create, manage, and schedule announcements that drive engagement
                and increase conversions — all from a simple, intuitive
                dashboard.
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Feature Section */}
        <Layout.Section>
          <Card
            padding={{ xs: "400", sm: "500" }}
            background="bg-surface"
            roundedAbove="sm"
          >
            <BlockStack gap="300">
              <Text as="h2" variant="headingLg">
                Why Choose Announcement Pro?
              </Text>

              <BlockStack gap="200">
                <div>
                  <Text variant="headingMd" as="h3">
                    Instant Setup
                  </Text>
                  <Text as="p">
                    Easily design attention-grabbing banners, target specific
                    audiences, and track performance — with no coding required.
                  </Text>
                </div>

                <div>
                  <Text variant="headingMd" as="h3">
                    Targeted Display
                  </Text>
                  <Text as="p">
                    Show banners based on behavior, region, or schedule. Reach
                    the right people at the right time.
                  </Text>
                </div>

                <div>
                  <Text variant="headingMd" as="h3">
                    Built for Merchants
                  </Text>
                  <Text as="p">
                    Whether you are running a flash sale or sharing store
                    updates, Announcement Pro helps you broadcast the right
                    message  effortlessly.
                  </Text>
                </div>
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Media Preview Section */}
        <Layout.Section>
          <MediaCard
            title="Live Preview"
            description="Customize your banner and see exactly how it will appear in your storefront."
            primaryAction={{
              content: "Preview Now",
              onAction: () => router.push("/custombar"),
            }}
            portrait
          >
            <></>
          </MediaCard>
        </Layout.Section>

        {/* Testimonials Section */}
        <Layout.Section>
          <Card
            padding={{ xs: "400", sm: "500" }}
            background="bg-surface"
            roundedAbove="sm"
          >
            <BlockStack gap="300" align="center">
              <Text as="h2" variant="headingLg">
                What Merchants Say
              </Text>
              <Text as="p" alignment="center">
                “This app made our promotions feel polished and professional.
                Our click-through rates improved by 35%!”
                <br />—  Founder @ Artzen
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Footer */}
        {/* <Layout.Section>
          <Banner title="Built for Shopify merchants" tone="info">
            <p>100% customizable · Works with all themes · Free to start</p>
          </Banner>
        </Layout.Section> */}
      </Layout>
    </Page>
  );
}
