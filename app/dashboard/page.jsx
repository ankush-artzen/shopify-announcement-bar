"use client";

import React, { useEffect, useState } from "react";
import {
  Page,
  Card,
  Layout,
  Text,
  Button,
  ResourceList,
  ResourceItem,
  Badge,
  Spinner,
  Toast,
  Frame,
} from "@shopify/polaris";
import { useRouter } from "next/navigation";
import {
  PlayIcon,
  DuplicateIcon,
  EditIcon,
  DeleteIcon,
  PauseCircleIcon,
} from "@shopify/polaris-icons";
import { Tooltip } from "@shopify/polaris";

import SaveConfirmationModal from "../../components/SaveConfirmationModal";

export default function CustomBanner() {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [toastActive, setToastActive] = useState(false);
  const [toastContent, setToastContent] = useState("");
  const [toastError, setToastError] = useState(false);
  const dismissToast = () => setToastActive(false);

  const showToast = (msg, isError = false) => {
    setToastContent(msg);
    setToastError(isError);
    setToastActive(true);
  };

  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        const res = await fetch("/api/getannouncements");
        const data = await res.json();
        setAnnouncements(data);
      } catch (error) {
        console.error("Failed to fetch announcements:", error);
        showToast("Failed to fetch announcements", true);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAnnouncements();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/announcements/${deleteId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setAnnouncements((prev) => prev.filter((a) => a.id !== deleteId));
        showToast("Announcement deleted");
      } else {
        const data = await res.json().catch(() => null);
        console.error("❌ Failed to delete announcement:", data?.error);
        showToast("Failed to delete announcement", true);
      }
    } catch (err) {
      console.error("❌ Delete error:", err);
      showToast("Delete request failed", true);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  };

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
          content: "New Announcement",
          onAction: () => router.push("/custombar/add"),
        }}
      >
        <Layout>
          {/* Dashboard Summary Cards */}
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
                    {announcements.filter((a) => a.status === "Active").length}
                  </Text>
                </div>
              </Card>

              <Card>
                <div style={{ padding: "16px" }}>
                  <Text as="h6" variant="headingSm" tone="subdued">
                    Views
                  </Text>
                  <Text as="p" variant="bodyLg" fontWeight="semibold">
                    0
                  </Text>
                </div>
              </Card>

              <Card>
                <div style={{ padding: "16px" }}>
                  <Text as="h6" variant="headingSm" tone="subdued">
                    Coupon copies
                  </Text>
                  <Text as="p" variant="bodyLg" fontWeight="semibold">
                    0
                  </Text>
                </div>
              </Card>
            </div>
          </Layout.Section>

          {/* Separate Section for Plan Overview */}
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
                  <Text variant="headingSm" fontWeight="bold">
                    Plan Overview
                  </Text>
                  <Badge tone="attention">Free Plan</Badge>
                </div>

                <div style={{ marginTop: "12px" }}>
                  <Text as="p" variant="bodySm" tone="subdued">
                    You’re currently on the <strong>Free Plan</strong>. Upgrade
                    to unlock powerful features and maximize engagement.
                  </Text>
                </div>

                <div style={{ marginTop: "16px" }}>
                  <Text variant="bodyMd" fontWeight="medium">
                    Free Plan Includes:
                  </Text>
                  <ul
                    style={{
                      margin: "8px 0 0 18px",
                      padding: 0,
                      fontSize: "14px",
                    }}
                  >
                    <li>Use multiple Announcement Bar</li>
                    <li>Basic View</li>
                  </ul>
                </div>

                <div style={{ marginTop: "16px" }}>
                  <Text variant="bodyMd" fontWeight="medium">
                    Premium Features:
                  </Text>
                  <ul
                    style={{
                      margin: "8px 0 0 18px",
                      padding: 0,
                      fontSize: "14px",
                    }}
                  >
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

                <div style={{ marginTop: "20px" }}>
                  <Button
                    fullWidth
                    variant="primary"
                    onClick={() => router.push("/billing")}
                  >
                    Upgrade to Premium
                  </Button>
                </div>
              </div>
            </Card>
          </Layout.Section>

          {/* Announcements List */}
        </Layout>
      </Page>
    </Frame>
  );
}
