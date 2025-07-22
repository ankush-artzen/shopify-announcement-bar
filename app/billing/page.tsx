"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Page, Card, Layout, Text, Banner, ProgressBar } from "@shopify/polaris";
import { ArrowLeftIcon } from "@shopify/polaris-icons";

import PlanCards from "@/components/billing/PlanCards";
import BillingInfo from "@/components/billing/BillingInfo";

export default function Billing() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [shop, setShop] = useState<string | null>(null);
  const [host, setHost] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>("Premium");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setShop(searchParams.get("shop"));
    setHost(searchParams.get("host"));
  }, [searchParams]);

  const handleSubscribe = async (plan: string) => {
    if (!shop || !host) {
      setError("Missing shop or host. Please reload the page.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, shop }),
      });

      const data = await response.json();
      if (response.ok && data.confirmationUrl) {
        window.top.location.href = data.confirmationUrl;
      } else {
        throw new Error(data.error || "Failed to initiate billing");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!shop) {
      setError("Missing shop parameter");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const subRes = await fetch(`/api/billing/active-subscription?shop=${shop}`);
      const subData = await subRes.json();

      if (!subRes.ok || !subData.subscriptionId) {
        throw new Error(subData.error || "No active subscription found");
      }

      const response = await fetch("/api/billing/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shop, subscriptionId: subData.subscriptionId }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        alert("Subscription canceled successfully.");
      } else {
        throw new Error(data.error || "Failed to cancel subscription");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Page
      fullWidth
      title="Pricing a plan"
      backAction={{
        content: "Back",
        icon: ArrowLeftIcon,
        onAction: () => router.back(),
      }}
    >
      <Layout>
        {error && (
          <Layout.Section>
            <Banner title="Error" status="critical">
              <p>{error}</p>
            </Banner>
          </Layout.Section>
        )}

        <Layout.Section>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ maxWidth: "840px", width: "100%" }}>
              <Card>
                <Text as="p" variant="bodyMd">
                  You’re currently on <b>Free</b> (0 / 2000 monthly views).
                </Text>
                <div style={{ marginTop: "12px" }}>
                  <ProgressBar progress={0} size="small" />
                </div>
              </Card>
            </div>
          </div>
        </Layout.Section>

        <Layout.Section>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ maxWidth: "840px", width: "100%" }}>
              <Text variant="headingMd" as="h3">
                Select plan
              </Text>
            </div>
          </div>
        </Layout.Section>

        <Layout.Section>
          <PlanCards
            selectedPlan={selectedPlan}
            isLoading={isLoading}
            shop={shop}
            host={host}
            onSubscribe={handleSubscribe}
          />
        </Layout.Section>

        <Layout.Section>
          <BillingInfo onCancel={handleCancelSubscription} isLoading={isLoading} />
        </Layout.Section>
      </Layout>
    </Page>
  );
}
