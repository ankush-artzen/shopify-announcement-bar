"use client";

import { useEffect, useState } from "react";
import {
  Page,
  Layout,
  Card,
  Text,
  Button,
  Banner,
  Badge,
} from "@shopify/polaris";
import { useAppBridge } from "@shopify/app-bridge-react";
import { ExternalMinor } from "@shopify/polaris-icons";

export default function ExtensionPage() {
  const [extensionUrl, setExtensionUrl] = useState("");
  const app = useAppBridge();

  useEffect(() => {
    if (app?.config?.shop) {
      setExtensionUrl(`https://${app.config.shop}/admin/extensions`);
    }
  }, [app]);

  return (
    <Page title="Extensions Dashboard">
      <div
        className="max-w-4xl mx-auto px-6 py-12 rounded-3xl shadow-2xl border border-gray-200 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://livesquare.in/wp-content/uploads/2014/07/Top-10-best-Simple-Awesome-Background-Images-for-Your-Website-or-Blog3.jpg')",
        }}
      >
        
        <div className="bg-white bg-opacity-90 backdrop-blur-sm p-8 rounded-2xl">

          
          <h1 className="text-2xl font-bold text-center mb-12 text-indigo-800 tracking-tight leading-tight">
            Welcome to My Extension Page
          </h1>

          <Layout>

            {/* Info Banner */}
            <Layout.Section>
              <div className="mb-8">
                <Banner title="Our Extensions" status="info">
                  <p>
                    Extensions from the Shopify App Store allow you to enhance your store's functionality with custom features 
                  </p>
                </Banner>
              </div>
            </Layout.Section>

            {/* Features List */}
            <Layout.Section>
              <Card title="Available Features" sectioned>
                <div className="space-y-4">
                  <Text as="p" variant="bodyMd" className="text-gray-700">
                    Announcement banner extension supports:
                  </Text>

                  <ul className="list-disc pl-6 space-y-2 text-gray-800 text-sm leading-relaxed">
                    <li>
                      <strong>Announcement Types:</strong>{" "}
                      <Badge status="info">Simple</Badge>,{" "}
                      <Badge status="attention">Marquee / Carousel</Badge>
                    </li>
                    <li>
                      <strong>Message Control:</strong> Static or scrolling messages
                    </li>
                    <li>
                      <strong>Countdown Timer:</strong> User can add a countdown timer
                    </li>
                    <li>
                      <strong>Scrolling Speed:</strong> Adjustable marquee speed
                    </li>
                    <li>
                      <strong>Styling:</strong> Custom background & text colors
                      <div className="mt-2 flex space-x-4">
                        <div className="w-10 h-6 rounded shadow-inner border bg-indigo-600" title="Sample BG"></div>
                        <div className="w-10 h-6 rounded shadow-inner border bg-white text-black flex items-center justify-center text-xs font-semibold">
                          Aa
                        </div>
                      </div>
                    </li>
                    <li>
                      <strong>Call to Action Button:</strong> Custom label, URL & position
                    </li>
                    <li>
                      <strong>View Limiting:</strong> Max views toggle with limit
                    </li>
                    <li>
                      <strong>Live Date Control:</strong> Set end date & time
                    </li>
                  </ul>
                </div>
              </Card>
            </Layout.Section>

            {/* Quick Actions */}
            <Layout.Section>
              <div className="my-8">
                <Card title="Extension Quick Actions" sectioned>
                  <div className="space-y-3">
                    <Text as="p" variant="bodySm" className="text-gray-600">
                      Manage your extensions directly in the Shopify admin.
                    </Text>

                    <Text as="p" variant="bodyMd" className="font-medium">
                      Access  extensionS from this dashboard:
                    </Text>

                    {extensionUrl ? (
                      <Button
                        primary
                        icon={ExternalMinor}
                        url={extensionUrl}
                        target="_blank"
                      >
                       Click here to open Extensions
                      </Button>
                    ) : (
                      <Button disabled>Loading extension URL...</Button>
                    )}
                  </div>
                </Card>
              </div>
            </Layout.Section>

          </Layout>
        </div>
      </div>
    </Page>
  );
}
