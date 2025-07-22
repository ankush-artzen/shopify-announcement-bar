"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import SettingsPanel from "../../../components/updatesetting";
import "../styles.css";
import { Spinner, Frame, Toast, Page } from "@shopify/polaris";
import { ArrowLeftIcon } from "@shopify/polaris-icons";

// ------------------------
// Types
// ------------------------

interface Settings {
  announcementType: "Simple" | "Marquee" | "Carousel" | string;
  title: string;
  messages: string[];
  showTimer: boolean;
  endDate: string;
  bgColor: string;
  textColor: string;
  showButton: boolean;
  enableButtonLink: boolean;
  buttonUrl: string;
  buttonLabel: string;
  buttonPosition: string;
  enableViewLimit: boolean;
  maxViews: number;
  marqueeSpeed: number;
  enableViewCount: boolean;
}

interface TimerVals {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
}

// ------------------------
// Defaults
// ------------------------

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
  buttonPosition: "bottom",
  enableViewLimit: true,
  maxViews: 5,
  marqueeSpeed: 20,
  enableViewCount: true,
};

// ------------------------
// Component
// ------------------------

const EditPage: React.FC = () => {
  const [toast, setToast] = useState<{ active: boolean; content: string }>({
    active: false,
    content: "",
  });

  const [settings, setSettings] = useState<Settings | null>(null);
  const [expired, setExpired] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [timerVals, setTimerVals] = useState<TimerVals>({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  });

  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const router = useRouter();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const carouselRef = useRef<HTMLDivElement | null>(null);

  // Fetch data on mount
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/announcements/${id}`);
        const data = await res.json();
        setSettings(data?.settings || defaultSettings);
      } catch (err) {
        console.error("❌ Failed to fetch announcement:", err);
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
        days: String(Math.floor(distance / (1000 * 60 * 60 * 24))).padStart(2, "0"),
        hours: String(Math.floor((distance / (1000 * 60 * 60)) % 24)).padStart(2, "0"),
        minutes: String(Math.floor((distance / (1000 * 60)) % 60)).padStart(2, "0"),
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
        body: JSON.stringify({ status: "Paused", settings }),
      });

      const data = await res.json();

      if (data.success) {
        setToast({ active: true, content: "Announcement saved successfully!" });
        setTimeout(() => router.push("/custombar"), 2000);
      } else {
        setToast({ active: true, content: "Failed to save announcement." });
      }
    } catch (err) {
      setToast({ active: true, content: "Something went wrong!" });
    } finally {
      setSaving(false);
    }
  };

  if (!settings) {
    return (
      <div className="flex justify-center items-center min-h-screen">
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
          icon: ArrowLeftIcon,
          onAction: () => router.back(),
        }}
      >
        <div className="fixed top-0 left-1/2 transform -translate-x-1/2 w-1/2 z-50 px-4 py-2 border-b border-blue-200 text-sm text-blue-900 font-medium text-center">
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
                    <a
                      href={buttonUrl || "https://"}
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
                    </a>
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
        <div className="fixed bottom-0 left-0 w-full h-[400px] bg-white z-30 overflow-y-auto shadow-2xl border-t px-4 py-6">
          <div
            className={`${
              settings.showTimer
                ? "fixed bottom-[-68px] left-0 w-full h-[400px] bg-white z-30 overflow-y-auto shadow-2xl border-t px-4 py-6"
                : "max-w-screen-lg mx-auto"
            }`}
          >
            <SettingsPanel
              settings={settings}
              setSettings={setSettings}
              resetViews={resetViews}
              onSave={() =>
                setToast({
                  active: true,
                  content: "Settings updated locally!",
                })
              }
            />
            <div className="mt-4 text-right">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </Page>
    </Frame>
  );
};

export default EditPage;
