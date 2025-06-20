"use client";

import { useEffect, useState } from "react";
import {
  Page,
  Layout,
  LegacyCard as Card,
  Text,
  Button,
  InlineStack,
  Divider,
  MediaCard,
} from "@shopify/polaris";
import Link from "next/link";
import { graphql } from "@/lib/gql";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useGraphQL } from "./hooks/useGraphQL";

interface Data {
  name: string;
  height: string;
}

const GET_SHOP = graphql(`
  query getShop {
    shop {
      name
    }
  }
`);

export default function Home() {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [editorurl, setEditorurl] = useState<string>("");

  const app = useAppBridge();

  const {
    data: graphqlData,
    isLoading: graphqlLoading,
    error: graphqlError,
  } = useGraphQL(GET_SHOP);

  useEffect(() => {
    if (!app) return;
    setIsMounted(true);
    const shop = app.config?.shop;
    if (!shop) return;

    const url = `https://${shop}/admin/themes/current/editor?context=app`;
    setEditorurl(url);
  }, [app]);

  return (
    <Page title="Shopify App Dashboard">
      <div className="bg-gradient-to-r from-green-200 via-blue-300 to-purple-300 p-4 rounded-xl shadow text-gray-800 text-center">
        <h1 className="text-2xl font-semibold">Welcome to your Admin Panel</h1>
        <p className="text-sm mt-1">Built with ❤️ using Shopify & Next.js</p>
      </div>

      {/* Media Card Welcome */}
      <Layout.Section>
        <MediaCard
          title="Getting Started"
          description="Discover how Shopify can power up your entrepreneurial journey."
          primaryAction={{
            content: "Learn More",
            onAction: () => {
              window.open("https://shopify.dev", "_blank");
            },
          }}
          popoverActions={[{ content: "Dismiss", onAction: () => {} }]}
        >
          <img
            alt="Business woman smiling"
            width="100%"
            height="100%"
            style={{ objectFit: "cover", objectPosition: "center" }}
            src="https://burst.shopifycdn.com/photos/one-arm-push-up.jpg?width=1200"
          />
        </MediaCard>
      </Layout.Section>
      <Layout.Section>
        <Card title="📊 App Insights Overview" sectioned>
          <div className="bg-gradient-to-r from-green-200 via-blue-300 to-purple-300 p-4 rounded-xl shadow text-gray-800">
            <Text variant="bodyMd" as="p" className="mb-3">
              Here’s a quick snapshot of your app activity.
            </Text>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                🚀 <strong>Shop:</strong>{" "}
                {graphqlData?.shop?.name ? graphqlData.shop.name : "Loading..."}
              </li>
              <li>
                📦 Version: <strong>v1.0.0</strong>
              </li>
            </ul>
          </div>
        </Card>
      </Layout.Section>

      <Layout.Section>
        <MediaCard
          title="Boost your product visibility"
          description="Enable SEO tags, add beautiful images, and highlight special offers to increase conversions."
          primaryAction={{
            content: "Optimize Now",
            onAction: () => router.push("/products"),
          }}
          popoverActions={[{ content: "Dismiss", onAction: () => {} }]}
        >
          <img
            alt="Product promo image"
            width="100%"
            height="100%"
            style={{ objectFit: "cover", objectPosition: "center" }}
            src="https://burst.shopifycdn.com/photos/resting-on-basketball-court.jpg?width=500"
          />
        </MediaCard>
      </Layout.Section>
      <Layout.Section>
        <Card title="Customize Your Theme Extension" sectioned>
          <Text as="p" variant="bodyMd" className="mb-4">
            Open your store’s Theme Editor directly to the section where your
            extension is installed.
          </Text>

          {isMounted && editorurl ? (
            <Link href={editorurl} target="_blank">
              <Button>Open Theme Editor</Button>
            </Link>
          ) : (
            <Button disabled>Loading...</Button>
          )}
        </Card>
      </Layout.Section>

      {/* Navigation Link */}
      <Layout.Section>
        <Card title="Navigation" sectioned>
          <InlineStack gap="200" align="start">
            <Text as="p">Explore another page using Next.js routing.</Text>
            <Link
              className="text-indigo-600 hover:underline font-medium"
              href="/new"
            >
              Go to /new page →
            </Link>
          </InlineStack>
        </Card>
      </Layout.Section>
    </Page>
  );
}
