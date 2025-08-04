"use client";

import { Text, Button, Spinner } from "@shopify/polaris";
import { useMemo, useEffect } from "react";

export default function PlanCard({
  type,
  price,
  features,
  activePlan,
  onSubscribe,
  onCancel,
  isLoading,
  subscriptionId,
  planExpiresOn,
  trialEndsOn,
  disabled,
}: {
  type: "Free" | "Premium";
  price?: string;
  features: string[];
  activePlan: string;
  onSubscribe?: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
  subscriptionId?: string | null;
  planExpiresOn?: Date | string | null;
  trialEndsOn?: Date | string | null;
  disabled?: boolean;
}) {
  const isPremium = type === "Premium";
  const today = new Date();

  const expiryDate = planExpiresOn ? new Date(planExpiresOn) : null;
  const trialEndDate = trialEndsOn ? new Date(trialEndsOn) : null;

  const isTrialValid =
    trialEndDate instanceof Date && !isNaN(trialEndDate.getTime());
  const isPlanValid =
    expiryDate instanceof Date && !isNaN(expiryDate.getTime());

  const isInTrial = isTrialValid && today < trialEndDate;
  const hasPremiumAccess = isInTrial || (isPlanValid && today < expiryDate);
  const normalizedPlan = activePlan?.toLowerCase().replace(" plan", "").trim();

  const isSubscribed = ["premium", "pending", "scheduled cancel"].includes(
    normalizedPlan,
  );
  const isCancelled = normalizedPlan === "scheduled cancel";

  useEffect(() => {
    const expiryDate = planExpiresOn ? new Date(planExpiresOn) : null;
    const trialEndDate = trialEndsOn ? new Date(trialEndsOn) : null;

    console.log("🧠 PlanCard Rendered:");
    console.log("👉 type:", type);
    console.log("👉 activePlan:", activePlan);
    console.log("👉 isSubscribed:", isSubscribed);
    console.log("👉 isCancelled:", isCancelled);
    console.log("👉 subscriptionId:", subscriptionId);
    console.log("👉 planExpiresOn:", expiryDate?.toISOString());
    console.log("👉 trialEndsOn:", trialEndDate?.toISOString());
    console.log("👉 isInTrial:", isInTrial);
    console.log("👉 hasPremiumAccess:", hasPremiumAccess);
    console.log("👉 isLoading:", isLoading);
  }, [
    type,
    activePlan,
    subscriptionId,
    planExpiresOn,
    trialEndsOn,
    isInTrial,
    isSubscribed,
    isCancelled,
    isLoading,
    hasPremiumAccess,
  ]);

  const shouldHighlight = useMemo(() => {
    const result =
      (isPremium && hasPremiumAccess) || (!isPremium && !hasPremiumAccess);
    console.log("🎨 shouldHighlight:", result);
    return result;
  }, [isPremium, hasPremiumAccess]);

  const renderButton = () => {
    const trialExpired = isTrialValid && today >= trialEndDate;
    const planExpired = isPlanValid && today >= expiryDate;

    if (isPremium) {
      if (isSubscribed && subscriptionId) {
        if (isCancelled && isInTrial) {
          return (
            <Button fullWidth size="medium" variant="primary" disabled>
              Trial active until {trialEndDate?.toLocaleDateString()}
            </Button>
          );
        }

        if (isCancelled && !isInTrial) {
          return (
            <Button fullWidth size="medium" variant="primary" disabled>
              {`Plan active until ${expiryDate?.toLocaleDateString() ?? "Unknown date"}`}
            </Button>
          );
        }

        if (isInTrial) {
          return (
            <Button
              fullWidth
              size="medium"
              variant="primary"
              tone="critical"
              onClick={() => onCancel?.()}
              disabled={isLoading}
              loading={isLoading}
            >
              Cancel Trial
            </Button>
          );
        }

        return (
          <Button
            fullWidth
            size="medium"
            variant="tertiary"
            tone="critical"
            onClick={() => onCancel?.()}
            disabled={isLoading}
            loading={isLoading}
          >
            Cancel Subscription
          </Button>
        );
      }
      if (hasPremiumAccess) {
        return (
          <Button fullWidth size="medium" variant="primary" disabled>
            {isInTrial
              ? `Trial active until ${trialEndDate?.toLocaleDateString() ?? "Unknown"}`
              : `Plan active until ${expiryDate?.toLocaleDateString() ?? "Unknown"}`}
          </Button>
        );
      }

      return (
        <Button
          fullWidth
          size="medium"
          variant="primary"
          onClick={() => onSubscribe?.()}
          disabled={isLoading}
          loading={isLoading}
        >
          Start Free with 7 Day Trial
        </Button>
      );
    }

    // Free Plan fallback
    let label = "You're on Free Plan";

    if (hasPremiumAccess) {
      label = "Using All Features";
    } else if (isCancelled && isPlanValid && expiryDate && today < expiryDate) {
      label = `Premium active until ${expiryDate.toLocaleDateString()}`;
    }

    return (
      <Button fullWidth size="medium" variant="primary" disabled>
        {label}
      </Button>
    );
  };

  return (
    <div
      style={{
        flex: "1 1 300px",
        maxWidth: "380px",
        minWidth: "280px",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <div
        style={{
          flex: 1,
          borderRadius: "12px",
          backgroundColor: shouldHighlight ? "#c9f3e1" : "#ffffff",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxShadow: shouldHighlight ? "0 0 0 2px #008060" : "0 0 0 1px #ccc",
        }}
      >
        <div>
          <Text variant="headingMd" as="h3">
            {type === "Free" ? "Beginner" : "Advanced"}
          </Text>
          <Text variant="headingLg" as="h2" fontWeight="bold">
            {price || "Free"}
            {price && (
              <Text as="span" variant="bodySm">
                {" "}
                / month
              </Text>
            )}
          </Text>

          <div style={{ marginTop: "16px", marginBottom: "12px" }}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              {renderButton()}
            </div>
          </div>

          <ul
            style={{
              paddingLeft: "5px",
              listStyleType: "none",
              fontWeight: 300,
              marginTop: "8px",
              lineHeight: "1.6em",
            }}
          >
            {features.map((feature, i) => (
              <li key={i}>{feature}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
