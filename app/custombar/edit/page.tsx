"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppBridge } from "@shopify/app-bridge-react";
import SettingsPanel from "../../../components/updatesetting";
import "../styles.css";
import { Spinner, Frame, Toast, Page } from "@shopify/polaris";
import type { Settings } from "@/app/types/settings";

const defaultSettings: Settings = {
  announcementType: "Simple",
  title: "SALE! 50% OFF ON ALL ITEMS",
  messages: ["SALE! 50% OFF", "Limited Time Offer", "Free Shipping Over ₹999"],
  showTimer: false,
  endDate: "2030-12-31T23:59:59",
  bgColor: "#f6fafd",
  textColor: "#1a365d",
  showButton: true,
  enableButtonLink: true,
  buttonUrl: "https://",
  buttonLabel: "Shop Now",
  buttonPosition: "top",
  enableViewLimit: true,
  maxViews: 5,
  marqueeSpeed: 20,
  enableViewCount: true,
};

const EditPage: React.FC = () => {
  const router = useRouter();
  const app = useAppBridge();

  const [id, setId] = useState<string | null>(null);
  const [shop, setShop] = useState<string>("");
  const [settings, setSettings] = useState<Settings | null>(null);
  const [expired, setExpired] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [toast, setToast] = useState<{ active: boolean; content: string }>({
    active: false,
    content: "",
  });

  const [timerVals, setTimerVals] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const carouselRef = useRef<HTMLDivElement | null>(null);

  // ✅ Get `shop` from App Bridge and `id` from query
  useEffect(() => {
    const shopFromConfig = app?.config?.shop;
    if (shopFromConfig) setShop(shopFromConfig);

    const params = new URLSearchParams(window.location.search);
    const idFromURL = params.get("id");
    if (idFromURL) setId(idFromURL);
    else console.warn("⚠️ No ID found in query params");
  }, [app]);

  // ✅ Fetch settings for the given ID
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/announcements/${id}`);
        const data = await res.json();
        if (data?.success && data?.data?.settings) {
          setSettings(data.data.settings);
        } else {
          console.warn("⚠️ Falling back to default settings");
          setSettings(defaultSettings);
        }
      } catch (err) {
        console.error("❌ Fetch error:", err);
        setSettings(defaultSettings);
      }
    };

    fetchData();
  }, [id]);

  // Timer Logic
  useEffect(() => {
    if (!settings?.showTimer || !settings?.endDate) return;

    const [dateStr, timeStr] = settings.endDate.split("T");
    const [y, m, d] = dateStr.split("-").map(Number);
    const [hh, mm, ss] = (timeStr || "00:00:00").split(":").map(Number);
    const target = new Date(y, m - 1, d, hh, mm, ss || 0);

    const updateTimer = () => {
      const now = new Date();
      const distance = target.getTime() - now.getTime();

      if (distance <= 0) {
        setExpired(true);
        if (intervalRef.current) clearInterval(intervalRef.current);
        return;
      }

      setExpired(false);
      setTimerVals({
        days: String(Math.floor(distance / (1000 * 60 * 60 * 24))).padStart(
          2,
          "0",
        ),
        hours: String(Math.floor((distance / (1000 * 60 * 60)) % 24)).padStart(
          2,
          "0",
        ),
        minutes: String(Math.floor((distance / (1000 * 60)) % 60)).padStart(
          2,
          "0",
        ),
        seconds: String(Math.floor((distance / 1000) % 60)).padStart(2, "0"),
      });
    };

    intervalRef.current = setInterval(updateTimer, 1000);
    updateTimer();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [settings?.endDate, settings?.showTimer]);

  // Carousel Scroll Logic
  useEffect(() => {
    if (settings?.announcementType !== "Carousel") return;

    const track = carouselRef.current;
    if (!track || !settings.messages?.length) return;

    let index = 0;
    const total = settings.messages.length;

    const interval = setInterval(() => {
      index = (index + 1) % total;
      track.style.transform = `translateX(-${index * 100}%)`;
    }, 3000);

    return () => clearInterval(interval);
  }, [settings?.announcementType, settings?.messages]);

  const resetViews = () => {
    localStorage.removeItem("countdown_views");
    location.reload();
  };

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
  
    try {
      const res = await fetch(`/api/announcements/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Paused",
          settings,
        }),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        console.error("Failed to update:", data.error);
        setToast({
          active: true,
          content: data.error || "Update failed",
        });
      } else {
        setToast({
          active: true,
          content: "Announcement updated successfully",
        });
  
        setTimeout(() => {
          router.push("/custombar");
        }, 1000);
      }
    } catch (error) {
      console.error("Update error:", error);
      setToast({
        active: true,
        content: "Something went wrong while saving",
      });
    } finally {
      setSaving(false);
    }
  };
  
  if (!settings) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(255, 255, 255, 0.6)",
          zIndex: 50,
        }}
      >
        {" "}
        <Spinner accessibilityLabel="Loading settings" size="large" />
      </div>
    );
  }

  const {
    announcementType,
    title,
    messages,
    showTimer,
    bgColor,
    textColor,
    showButton,
    enableButtonLink,
    buttonUrl,
    buttonLabel,
    buttonPosition,
    marqueeSpeed,
  } = settings;

  return (
    <Frame>
      {toast.active && (
        <Toast
          content={toast.content}
          onDismiss={() => setToast({ active: false, content: "" })}
        />
      )}

      <Page
        fullWidth
        title="Edit Announcement"
        backAction={{
          content: "Back",
          onAction: () => router.back(),
        }}
      >
        <div className="fixed top-0 left-1/2 transform -translate-x-1/2 w-1/2 z-50 px-4 py-2 border-b border-blue-200 text-base text-blue-900 font-bold text-center ">
          You are viewing a live preview of your banner
        </div>

        {/* Live Preview */}
        <div
          className={`countdown-timer fixed top-[56px] left-0 w-full z-40 btn-${buttonPosition} countdown-${announcementType.toLowerCase()} p-4 shadow-md border-t border-b`}
          style={{ background: bgColor, color: textColor }}
        >
          {announcementType === "Simple" && (
            <>
              <h4 className="text-lg font-semibold">{title}</h4>
              {showButton && (
                <div className="btn-wrapper text-center mt-2">
                  {enableButtonLink ? (
                    <a href={buttonUrl || "https://"}>{buttonLabel}</a>
                  ) : (
                    <button
                      style={{
                        backgroundColor: textColor,
                        color: bgColor,
                        border: `1px solid ${textColor}`,
                        padding: "8px 16px",
                        borderRadius: "6px",
                        fontWeight: "500",
                      }}
                    >
                      {buttonLabel}
                    </button>
                  )}
                </div>
              )}

              {showTimer &&
                (!expired ? (
                  <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                    {Object.entries(timerVals).map(([unit, val]) => (
                      <div
                        key={unit}
                        className="flex flex-col items-center bg-white bg-opacity-20 backdrop-blur-md px-2.5 py-1.5 rounded border border-white text-[10px] min-w-[52px]"
                      >
                        <span className="text-lg font-bold">{val}</span>
                        <span className="uppercase font-semibold text-[9px]">
                          {unit}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-2 text-center text-red-600 font-semibold text-sm">
                    ⏰ This offer has expired!
                  </div>
                ))}
            </>
          )}

          {announcementType === "Marquee" && (
            <div className="marquee-wrapper">
              <div
                className="marquee-track"
                style={{ animationDuration: `${marqueeSpeed}s` }}
              >
                {Array.from({ length: 50 }).map((_, i) => (
                  <div key={i} className="marquee-content">
                    {messages[i % messages.length]}
                  </div>
                ))}
              </div>
            </div>
          )}

          {announcementType === "Carousel" && (
            <div className="carousel-wrapper">
              <div className="carousel-track" ref={carouselRef}>
                {messages.map((msg, i) => (
                  <div className="carousel-slide" key={i}>
                    {msg}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Settings & Save */}
        <div className="fixed bottom-[-27px] left-0 w-full h-[400px] bg-white z-30 overflow-y-auto shadow-2xl border-t px-4 py-6">
          <SettingsPanel
            settings={settings}
            setSettings={
              setSettings as React.Dispatch<React.SetStateAction<Settings>>
            }
            resetViews={resetViews}
            onSave={() =>
              setToast({
                active: true,
                content: "Settings updated locally!",
              })
            }
          />

          <div className="mb-4 text-left">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition flex flex-row items-end space-x-6 mt-6"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </Page>
    </Frame>
  );
};

export default EditPage;
