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
  Tooltip,
} from "@shopify/polaris";
import { useRouter } from "next/navigation";
import { useAppBridge } from "@shopify/app-bridge-react";

import {
  PlayIcon,
  DuplicateIcon,
  EditIcon,
  DeleteIcon,
  PauseCircleIcon,
} from "@shopify/polaris-icons";

import SaveConfirmationModal from "../../components/SaveConfirmationModal";
import "@shopify/polaris/build/esm/styles.css";

// ------------------------
// Type Declaration
// ------------------------
type Announcement = {
  id: string;
  name: string;
  status: "Active" | "Paused" | string;
};

export default function CustomBanner() {
  const router = useRouter();
  const app = useAppBridge();

  const [shop, setShop] = useState<string>("");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const [toastActive, setToastActive] = useState<boolean>(false);
  const [toastContent, setToastContent] = useState<string>("");
  const [toastError, setToastError] = useState<boolean>(false);

  const dismissToast = () => setToastActive(false);
  const showToast = (msg: string, isError = false) => {
    setToastContent(msg);
    setToastError(isError);
    setToastActive(true);
  };

  const getToneFromStatus = (
    status: string,
  ): "success" | "warning" | "attention" => {
    switch (status.toLowerCase()) {
      case "active":
        return "success";
      case "paused":
        return "warning";
      default:
        return "attention";
    }
  };

  // ✅ Set shop from App Bridge config
  useEffect(() => {
    const shopFromConfig = app?.config?.shop;
    if (shopFromConfig) {
      setShop(shopFromConfig);
    } else {
      console.warn("⚠️ No shop found in App Bridge config.");
    }
  }, [app]);

  // ✅ Fetch announcements only after shop is available
  useEffect(() => {
    async function init() {
      if (!shop) return;

      try {
        const tokenRes = await fetch(`/api/token?shop=${shop}`);
        const tokenData = await tokenRes.json();

        if (!tokenData?.hasAccessToken) {
          showToast("No access token found for this shop", true);
          return;
        }

        const res = await fetch(`/api/getannouncements?shop=${shop}`);
        const data: Announcement[] = await res.json();
        setAnnouncements(data);
      } catch (err) {
        console.error("❌ Initialization failed", err);
        showToast("Failed to initialize", true);
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, [shop]);

  // ✅ Handle delete confirmation
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
        title="Announcements"
        primaryAction={{
          content: "New Announcement",

          onAction: () => router.push("/custombar/add"),
        }}
      >
        <Layout>
          <Layout.Section>
            <Card>
              <Text as="h6" variant="bodyLg" fontWeight="bold">
                Your Announcements
              </Text>

              {isLoading ? (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  <Spinner
                    accessibilityLabel="Loading announcements"
                    size="large"
                  />
                </div>
              ) : (
                <>
                  <ResourceList
                    resourceName={{
                      singular: "announcement",
                      plural: "announcements",
                    }}
                    items={announcements}
                    totalItemsCount={announcements.length}
                    selectable={false}
                    renderItem={(item: Announcement) => {
                      const { id, name, status } = item;

                      return (
                        <ResourceItem
                          id={id}
                          accessibilityLabel={`View details for ${name}`}
                          onClick={() => {}}
                        >
                          <SaveConfirmationModal
                            open={showDeleteModal}
                            onClose={() => {
                              setShowDeleteModal(false);
                              setDeleteId(null);
                            }}
                            onConfirm={handleDelete}
                            title="Delete Announcement"
                            message="Are you sure you want to delete this announcement? This action cannot be undone."
                            confirmText="Delete"
                            cancelText="Cancel"
                            loading={isDeleting}
                            // variant = "destructive"
                          />
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "4px",
                              }}
                            >
                              <Text as="span" fontWeight="bold">
                                {name}
                              </Text>

                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                }}
                              >
                                <Text as="span" tone="subdued" variant="bodySm">
                                  ID: <code>{id}</code>
                                </Text>

                                <Button
                                  size="slim"
                                  onClick={() => {
                                    navigator.clipboard.writeText(id);
                                    showToast("Banner ID copied to clipboard!");
                                  }}
                                >
                                  Copy ID
                                </Button>
                              </div>
                            </div>

                            <div
                              style={{
                                display: "flex",
                                gap: "16px",
                                alignItems: "center",
                              }}
                            >
                              <Badge tone={getToneFromStatus(status)}>
                                {status
                                  ? status.charAt(0).toUpperCase() +
                                    status.slice(1)
                                  : "Unknown"}
                              </Badge>

                              <div style={{ display: "flex", gap: "8px" }}>
                                <Tooltip
                                  content={
                                    status === "Paused" ? "Activate" : "Pause"
                                  }
                                >
                                  <Button
                                    variant="plain"
                                    icon={
                                      status === "Paused"
                                        ? PlayIcon
                                        : PauseCircleIcon
                                    }
                                    onClick={async () => {
                                      const newStatus =
                                        status === "Paused"
                                          ? "Active"
                                          : "Paused";

                                      try {
                                        await fetch(
                                          `/api/announcements/${id}`,
                                          {
                                            method: "PATCH",
                                            headers: {
                                              "Content-Type":
                                                "application/json",
                                            },
                                            body: JSON.stringify({
                                              status: newStatus,
                                            }),
                                          },
                                        );

                                        setAnnouncements((prev) =>
                                          prev.map((a) =>
                                            a.id === id
                                              ? { ...a, status: newStatus }
                                              : a,
                                          ),
                                        );

                                        showToast(
                                          `Announcement ${
                                            newStatus === "Active"
                                              ? "activated"
                                              : "paused"
                                          }`,
                                        );
                                      } catch (err) {
                                        console.error(
                                          "Failed to update status",
                                        );
                                        showToast(
                                          "Failed to update status",
                                          true,
                                        );
                                      }
                                    }}
                                  />
                                </Tooltip>

                                <Tooltip content="Duplicate">
                                  <Button
                                    icon={DuplicateIcon}
                                    variant="plain"
                                    onClick={async () => {
                                      try {
                                        const res = await fetch(
                                          `/api/announcements/${id}/duplicate`,
                                          { method: "POST" },
                                        );
                                        const data = await res.json();
                                        if (data.success) {
                                          setAnnouncements((prev) => [
                                            ...prev,
                                            data.announcement,
                                          ]);
                                          showToast("Announcement duplicated");
                                        } else {
                                          showToast(
                                            "Failed to duplicate",
                                            true,
                                          );
                                        }
                                      } catch (err) {
                                        console.error("Duplicate failed", err);
                                        showToast(
                                          "Duplicate request failed",
                                          true,
                                        );
                                      }
                                    }}
                                  />
                                </Tooltip>

                                <Tooltip content="Edit">
                                  <Button
                                    icon={EditIcon}
                                    variant="plain"
                                    onClick={() =>
                                      router.push(`/custombar/edit?id=${id}`)
                                    }
                                  />
                                </Tooltip>

                                <Tooltip content="Delete">
                                  <Button
                                    icon={DeleteIcon}
                                    variant="plain"
                                    onClick={() => {
                                      setDeleteId(id);
                                      setShowDeleteModal(true);
                                    }}
                                  />
                                </Tooltip>
                              </div>
                            </div>
                          </div>
                        </ResourceItem>
                      );
                    }}
                  />

                  {announcements.length === 0 && (
                    <Text as="p" alignment="center">
                      No announcements yet. Click “New announcement”.
                    </Text>
                  )}
                </>
              )}
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    </Frame>
  );
}
