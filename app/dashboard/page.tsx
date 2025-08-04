"use client";

import React, { useEffect, useState } from "react";
import {
  Page,
  Card,
  Layout,
  Text,
  Button,
  Badge,
  Spinner,
  Toast,
  Frame,
  Tooltip,
} from "@shopify/polaris";
import { useRouter } from "next/navigation";
import { useAppBridge } from "@shopify/app-bridge-react";

// ----------------------
// Types
// ----------------------

interface Announcement {
  id: string;
  status: "Active" | "Paused" | string;
  [key: string]: any;
}

interface PlanStatus {
  plan: string;
  subscriptionId?: string | null;
  planExpiresOn?: string | null;
  trialEndsOn?: string | null;
}

// ----------------------
// Component
// ----------------------

export default function CustomBanner() {
  const router = useRouter();
  const app = useAppBridge();

  const [shop, setShop] = useState<string>("");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [plan, setPlan] = useState<string>("Free");
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [toastActive, setToastActive] = useState<boolean>(false);
  const [toastContent, setToastContent] = useState<string>("");
  const [toastError, setToastError] = useState<boolean>(false);
  const [planExpiresOn, setPlanExpiresOn] = useState<string | null>(null);
  const [trialEndsOn, setTrialEndsOn] = useState<string | null>(null);
  const [totalViews, setTotalViews] = useState<number>(0);


  const dismissToast = () => setToastActive(false);
  const showToast = (msg: string, isError = false) => {
    setToastContent(msg);
    setToastError(isError);
    setToastActive(true);
  };

  const today = new Date();
  const expiry = planExpiresOn ? new Date(planExpiresOn) : null;
  const trialEnd = trialEndsOn ? new Date(trialEndsOn) : null;

  const isInTrial = trialEnd && today < trialEnd;
  const hasPremiumAccess =
    plan === "Premium" || isInTrial || (expiry && today < expiry);

  // ----------------------
  // Fetch shop from AppBridge or localStorage
  // ----------------------

  useEffect(() => {
    const shopFromApp = (app as any)?.config?.shop as string | undefined;
    if (shopFromApp) {
      setShop(shopFromApp);
      localStorage.setItem("shop", shopFromApp);
    } else {
      const storedShop = localStorage.getItem("shop");
      if (storedShop) setShop(storedShop);
    }
  }, [app]);

  // ----------------------
  // Fetch announcements & plan
  // ----------------------

  useEffect(() => {
    if (!shop) return;

    async function fetchAllData() {
      const minLoadingTime = new Promise((resolve) =>
        setTimeout(resolve, 2000),
      );

      const fetchAnnouncements = async () => {
        if (!shop) {
          showToast("Shop not found", true);
          return;
        }

        try {
          const tokenRes = await fetch(`/api/token?shop=${shop}`);
          const tokenData = await tokenRes.json();

          if (!tokenData?.hasAccessToken) {
            showToast("No access token found for this shop", true);
            return;
          }

          // Now fetch announcements
          const res = await fetch(`/api/getannouncements?shop=${shop}`);

          if (!res.ok) {
            const errorText = await res.text();
            console.error("Failed to fetch announcements:", errorText);
            showToast("Failed to fetch announcements", true);
            return;
          }

          const data = await res.json();

          const announcementsData = Array.isArray(data)
            ? data
            : data?.announcements || [];

          setAnnouncements(announcementsData);
        } catch (error) {
          console.error("❌ Error fetching announcements:", error);
          showToast("Failed to fetch announcements", true);
        }
      };
      const fetchTotalViews = async () => {
        try {
          const res = await fetch(`/api/announcements/getviews?shop=${shop}`);
          const data = await res.json();
      
          if (res.ok) {
            setTotalViews(data.totalViews || 0);
          } else {
            console.error("Failed to fetch views:", data.error);
          }
        } catch (err) {
          console.error("Error fetching views:", err);
        }
      };

      const fetchPlanStatus = async () => {
        try {
          const res = await fetch(`/api/billing/status?shop=${shop}`);
          const data: PlanStatus = await res.json();

          if (res.ok && data.plan) {
            setPlan(data.plan);
            setSubscriptionId(data.subscriptionId || null);
            setPlanExpiresOn(data.planExpiresOn || null);
            setTrialEndsOn(data.trialEndsOn || null);
          } else {
            showToast("Failed to fetch plan", true);
          }
        } catch (err) {
          showToast("Error fetching plan status", true);
        }
      };

      await Promise.all([
        fetchAnnouncements(),
        fetchPlanStatus(),
        fetchTotalViews(),
        minLoadingTime,
      ]);

      setIsLoading(false);
    }

    fetchAllData();
  }, [shop]);
 
  

  // ----------------------
  // JSX
  // ----------------------

  return (
    <Frame>
      {toastActive && (
        <Toast
          content={toastContent}
          error={toastError}
          onDismiss={dismissToast}
        />
      )}

      <Page
        title="Dashboard"
        primaryAction={{
          content: "Saved Announcements",
          onAction: () => router.push("/custombar"),
        }}
      >
        {isLoading ? (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(255, 255, 255, 0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
            }}
          >
            <Spinner size="large" accessibilityLabel="Loading dashboard" />
          </div>
        ) : (
          <Layout>
            {/* Summary Cards */}
            <Layout.Section>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                  gap: "16px",
                }}
              >
                <Card>
                  <div style={{ padding: "16px" }}>
                    <Text as="h6" variant="headingSm" tone="subdued">
                      Active bars
                    </Text>
                    <Text as="p" variant="bodyLg" fontWeight="semibold">
                      {
                        announcements.filter((a) => a.status === "Active")
                          .length
                      }
                    </Text>
                  </div>
                </Card>

                <Card>
                  <div style={{ padding: "16px" }}>
                    <Text as="h6" variant="headingSm" tone="subdued">
                      Views
                    </Text>
                    <Text as="p" variant="bodyLg" fontWeight="semibold">
                    {totalViews}
                    </Text>
                  </div>
                </Card>

                <Card>
                  <div style={{ padding: "16px" }}>
                    <Text as="h6" variant="headingSm" tone="subdued">
                      Plan Status
                    </Text>
                    <Badge
                      tone={
                        plan === "Free"
                          ? "attention"
                          : isInTrial
                            ? "warning"
                            : "success"
                      }
                    >
                      {isInTrial ? "Trial Active" : plan}
                    </Badge>
                  </div>
                </Card>
              </div>
            </Layout.Section>

            {/* Plan Overview */}
            <Layout.Section>
              <Card>
                <div style={{ padding: "16px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text as="h2" variant="headingSm" fontWeight="bold">
                      Plan Overview
                    </Text>
                  </div>

                  <div style={{ marginTop: "12px" }}>
                    {hasPremiumAccess ? (
                      <>
                        <Text as="p" variant="bodySm" tone="subdued">
                          You’re on the{" "}
                          <strong>
                            {isInTrial ? "Premium Trial" : "Premium Plan"}
                          </strong>
                          . Enjoy all features with full customization and
                          control.
                        </Text>

                        {isInTrial && trialEndsOn && (
                          <div style={{ marginTop: "8px" }}>
                            <Badge tone="info">
                              {`Trial ends on ${new Date(trialEndsOn!).toLocaleDateString()}`}
                            </Badge>
                          </div>
                        )}
                      </>
                    ) : (
                      <Text as="p" variant="bodySm" tone="subdued">
                        You’re currently on the <strong>Free Plan</strong>.
                        Upgrade to unlock powerful features and maximize
                        engagement.
                      </Text>
                    )}
                  </div>

                  {!hasPremiumAccess && (
                    <>
                      <div style={{ marginTop: "16px" }}>
                        <Text as="h2" variant="headingSm" fontWeight="bold">
                          Free Plan Includes:
                        </Text>
                        <ul style={{ marginLeft: "18px" }}>
                          <li>Use multiple Announcement Bar</li>
                          <li>Basic View</li>
                        </ul>
                      </div>

                      <div style={{ marginTop: "16px" }}>
                        <Text as="h2" variant="headingSm" fontWeight="bold">
                          Premium Plan Features
                        </Text>
                        <ul style={{ marginLeft: "18px" }}>
                          <li>
                            <Tooltip content="Enable more than one bar at a time.">
                              Multiple Active Bars
                            </Tooltip>
                          </li>
                          <li>
                            <Tooltip content="Target based on country, device, or page.">
                              Advanced Targeting
                            </Tooltip>
                          </li>
                          <li>
                            <Tooltip content="Automatically rotate or schedule bars.">
                              Bar Scheduling
                            </Tooltip>
                          </li>
                          <li>
                            <Tooltip content="Priority access to customer support.">
                              Priority Support
                            </Tooltip>
                          </li>
                          <li>
                            <Tooltip content="Remove Powered by branding from bars.">
                              Remove Branding
                            </Tooltip>
                          </li>
                        </ul>
                      </div>
                    </>
                  )}

                  {hasPremiumAccess && (
                    <div style={{ marginTop: "16px" }}>
                      <Text as="h2" variant="headingSm" fontWeight="bold">
                        Premium Plan Benefits:
                      </Text>
                      <ul style={{ marginLeft: "18px" }}>
                        <li>Unlimited active announcement bars</li>
                        <li>Advanced targeting by country, device, and page</li>
                        <li>Schedule bars and automate visibility</li>
                        <li>Priority customer support</li>
                        <li>Unlimited views</li>
                      </ul>
                      <div style={{ marginTop: "12px" }}>
                        <Badge tone="success">
                          All premium features are active
                        </Badge>
                      </div>
                    </div>
                  )}

                  {plan === "Cancelled" && hasPremiumAccess && (
                    <div style={{ marginTop: "8px" }}>
                      <Text as="h2" variant="headingSm" fontWeight="bold">
                        Your subscription is cancelled but still active until{" "}
                        {new Date(planExpiresOn!).toLocaleDateString()}.
                      </Text>
                    </div>
                  )}

                  {!hasPremiumAccess && (
                    <div style={{ marginTop: "20px" }}>
                      <Button
                        fullWidth
                        variant="primary"
                        onClick={() => router.push("/billing")}
                      >
                        Upgrade to Premium
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </Layout.Section>
          </Layout>
        )}
      </Page>
    </Frame>
  );
}
