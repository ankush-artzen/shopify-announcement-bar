"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppBridge } from "@shopify/app-bridge-react";
import { Spinner, Frame, Page, Layout, Text } from "@shopify/polaris";

import BillingStatusCard from "@/components/billing/Billingstatuscard";
import PlanSelectorHeader from "@/components/billing/PlanSelectorHeader";
import PlanCard from "@/components/billing/PlanCards";
import BillingInfoCard from "@/components/billing/BillingInfoCard";
import ErrorBanner from "@/components/billing/Errorstatus";
import DeleteConfirmationModal from "@/components/SaveConfirmationModal";

export default function BillingPage() {
  const router = useRouter();
  const app = useAppBridge();

  const [shop, setShop] = useState<string>("");
  const [host, setHost] = useState<string>("");
  const [selectedPlan, setSelectedPlan] = useState<string>("Premium");
  const [activePlan, setActivePlan] = useState<string>("Free");
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [planExpiresOn, setPlanExpiresOn] = useState<Date | null>(null);
  const [trialEndsOn, setTrialEndsOn] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false);

  // ✅ Load shop from App Bridge
  useEffect(() => {
    const shopFromConfig = app?.config?.shop;
    if (shopFromConfig) {
      setShop(shopFromConfig);
    } else {
      console.warn("⚠️ No shop found in App Bridge config.");
      setError("Unable to retrieve shop info. Please reload the app.");
    }
  }, [app]);

  // ✅ Set host from sessionStorage (if previously stored)
  // useEffect(() => {
  //   const storedHost = sessionStorage.getItem("host");
  //   if (storedHost) {
  //     setHost(storedHost);
  //   } else {
  //     console.warn("⚠️ Host parameter missing from sessionStorage");
  //     setError("Host info missing. Please reload the app.");
  //   }
  // }, []);

  // ✅ Fetch billing info when shop is set
  useEffect(() => {
    if (!shop) return;

    const fetchBillingStatus = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/billing/status?shop=${shop}`);
        const data = await res.json();

        if (data.plan) setActivePlan(data.plan);
        setSubscriptionId(data.subscriptionId || null);
        setPlanExpiresOn(data.planExpiresOn ? new Date(data.planExpiresOn) : null);
        setTrialEndsOn(data.trialEndsOn ? new Date(data.trialEndsOn) : null);
      } catch (err) {
        console.error("❌ Failed to fetch billing status:", err);
        setError("Failed to fetch billing status.");
      } finally {
        setIsInitializing(false);
        setIsLoading(false);
      }
    };

    fetchBillingStatus();
  }, [shop]);

  const handleSubscribe = async () => {
    if (!shop ) {
      setError("Shop or host info missing.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: selectedPlan, shop, host }),
      });

      const data = await response.json();

      if (response.ok && data.confirmationUrl) {
        window.top ? (window.top.location.href = data.confirmationUrl) : (window.location.href = data.confirmationUrl);
      } else {
        throw new Error(data.error || "Failed to initiate billing");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!shop || !subscriptionId) {
      setError("Missing shop or subscription ID");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/billing/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shop, subscriptionId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to cancel subscription");
      }

      setActivePlan("Scheduled Cancel");
    } catch (err: any) {
      setError(err.message || "Something went wrong during cancellation");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <Frame>
      {isLoading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "100px 0",
          }}
        >
          <Spinner size="large" accessibilityLabel="Loading billing page" />
        </div>
      ) : (
        <Page
          fullWidth
          title="Pricing a plan"
          backAction={{
            content: "Back",
            // icon: ArrowLeftIcon,
            onAction: () => router.back(),
          }}
        >
          <Layout>
            {error && <ErrorBanner message={error} />}
            <Layout.Section>
              <BillingStatusCard activePlan={activePlan} />
            </Layout.Section>

            <Layout.Section>
              <PlanSelectorHeader activePlan={activePlan} />
            </Layout.Section>

            <Layout.Section>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "80px",
                  justifyContent: "center",
                  paddingTop: "16px",
                  paddingBottom: "16px",
                }}
              >
                <PlanCard
                  type="Free"
                  features={[
                    "✔ Customizable labels",
                    "✔ Simple marquee",
                    "× Unlimited view count",
                    "× Basic support",
                    "× No custom messaging",
                    "× More features",
                  ]}
                  activePlan={activePlan}
                  isLoading={isLoading}
                  planExpiresOn={planExpiresOn}
                  disabled={isInitializing || !shop || !host}
                />

                <PlanCard
                  type="Premium"
                  price="₹499"
                  features={[
                    "✔ Returns portal",
                    "✔ Unlimited returns",
                    "✔ Custom messaging",
                    "✔ Customer-paid returns labels",
                    "✔ Custom email notifications",
                    "✔ Plan integration",
                  ]}
                  activePlan={activePlan}
                  isLoading={isLoading}
                  onSubscribe={() => {
                    setSelectedPlan("Premium");
                    handleSubscribe();
                  }}
                  onCancel={() => setShowCancelConfirmModal(true)}
                  subscriptionId={subscriptionId}
                  planExpiresOn={planExpiresOn}
                  trialEndsOn={trialEndsOn}
                  disabled={isInitializing || !shop || !host}
                />
              </div>
            </Layout.Section>

            <Layout.Section>
              <BillingInfoCard />
            </Layout.Section>
          </Layout>
        </Page>
      )}

      <DeleteConfirmationModal
        open={showCancelConfirmModal}
        onClose={() => setShowCancelConfirmModal(false)}
        onConfirm={async () => {
          setShowCancelConfirmModal(false);
          await handleCancel();
        }}
        loading={isLoading}
        title="Cancel Subscription?"
        message="Are you sure you want to cancel your current plan? You may lose premium features immediately."
        confirmText="Yes, Cancel"
        cancelText="Keep Plan"
      />
    </Frame>
  );
}
