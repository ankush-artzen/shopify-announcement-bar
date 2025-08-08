"use client";

import {
  Page,
  Layout,
  BlockStack,
  Card,
  Text,
  InlineStack,
  Box,
  Icon,
} from "@shopify/polaris";

export default function HowToUsePage() {
  const steps = [
    {
      title: "Setup Guide",
      description:
        "Go to the Announcements tab and adjust settings according to your requirements.",
    },
    {
      title: "Create Announcement",
      description:
        "After creating the new announcements, activate the announcements.",
    },
    {
      title: "Add Banner ID to Theme App Extension",
      description:
        "Copy the Banner ID from the Custombar page and paste it into your Shopify Theme App Extension settings.",
    },
  ];

  return (
    <Page title="How to Use Announcement Bar">
      <Layout>
        <Layout.Section>
          <BlockStack gap="0">
            {/* Title Card with spacing below */}
            <Box paddingBlockEnd="500">
              <Card padding="500">
                <BlockStack gap="200">
                  <Text variant="headingLg" as="h1">
                    Get Started in 3 Simple Steps
                  </Text>
                  <Text as="p" tone="subdued">
                    Follow these steps to integrate and display your custom
                    announcement banner in your Shopify store.
                  </Text>
                </BlockStack>
              </Card>
            </Box>

            {/* Step Cards */}
            {steps.map((step, index) => (
              <Box key={index} paddingBlockEnd="500">
                <Card padding="500">
                  <BlockStack gap="400">
                    <InlineStack align="start" gap="400">
                      <InlineStack align="center" blockAlign="center">
                        <Box
                          padding="400"
                          borderRadius="200"
                          background="bg-surface-secondary"
                          minWidth="40px"
                          minHeight="40px"                        >
                          <Text as="p" fontWeight="semibold">
                            {index + 1}
                          </Text>
                        </Box>
                      </InlineStack>

                      <BlockStack gap="100">
                        <Text variant="headingMd" as="h2">
                          {step.title}
                        </Text>
                        <Text as="p">{step.description}</Text>
                      </BlockStack>
                    </InlineStack>
                  </BlockStack>
                </Card>
              </Box>
            ))}

            {/* Optional Final Message Card */}
            {/* <Box paddingBlockStart="400">
              <Card padding="400" background="bg-success-subdued" border="base">
                <InlineStack gap="3" align="start">
                  <Icon source={CircleTickMajor} tone="success" />
                  <Text as="p" fontWeight="medium">
                    You're now ready to launch your Announcement Bar!
                  </Text>
                </InlineStack>
              </Card>
            </Box> */}
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
