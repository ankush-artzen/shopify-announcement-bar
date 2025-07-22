"use client";

import React, { useEffect, useRef, useState } from "react";
import SettingsPanel from "@/components/SettingsPanel";
import "../styles.css";
import { Frame, Toast, Page } from "@shopify/polaris";
import { useRouter } from "next/navigation";
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
// Component
// ------------------------

const AddCountdownBannerPage: React.FC = () => {
  const router = useRouter();

  const [toastActive, setToastActive] = useState<boolean>(false);
  const [expired, setExpired] = useState<boolean>(false);
  const [viewAllowed, setViewAllowed] = useState<boolean>(true);

  const [settings, setSettings] = useState<Settings>({
    announcementType: "Simple",
    title: "SALE! 50% OFF ON ALL ITEMS",
    messages: ["SALE! 50% OFF", "Limited Time Offer", "Free Shipping Over ₹999"],
    showTimer: false,
    endDate: "2030-12-31T23:59:59",
    bgColor: "#f6fafd",
    textColor: "#1a365d",
    showButton: false,
    enableButtonLink: false,
    buttonUrl: "https://",
    buttonLabel: "Shop Now",
    buttonPosition: "bottom",
    enableViewLimit: false,
    maxViews: 5,
    marqueeSpeed: 20,
    enableViewCount: false,
  });

  const [timerVals, setTimerVals] = useState<TimerVals>({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const savedSettings = localStorage.getItem("countdown_settings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings((prev) => ({ ...prev, ...parsed }));
      } catch (err) {
        console.error("Error parsing saved settings:", err);
      }
    }
  }, []);

  useEffect(() => {
    if (!settings.showTimer || !settings.endDate) return;

    const [dateStr, timeStr] = settings.endDate.split("T");
    const [year, month, day] = dateStr.split("-").map(Number);
    const [hour, minute, second] = (timeStr || "00:00:00").split(":").map(Number);
    const target = new Date(year, month - 1, day, hour, minute, second || 0);

    if (isNaN(target.getTime())) {
      console.warn("❌ Invalid endDate:", settings.endDate);
      return;
    }

    const updateTimer = () => {
      const now = new Date();
      const distance = target.getTime() - now.getTime();

      if (distance <= 0) {
        setExpired(true);
        if (intervalRef.current) clearInterval(intervalRef.current);
        return;
      }

      setTimerVals({
        days: String(Math.floor(distance / (1000 * 60 * 60 * 24))).padStart(2, "0"),
        hours: String(Math.floor((distance / (1000 * 60 * 60)) % 24)).padStart(2, "0"),
        minutes: String(Math.floor((distance / (1000 * 60)) % 60)).padStart(2, "0"),
        seconds: String(Math.floor((distance / 1000) % 60)).padStart(2, "0"),
      });

      setExpired(false);
    };

    intervalRef.current = setInterval(updateTimer, 1000);
    updateTimer();

    return () => intervalRef.current && clearInterval(intervalRef.current);
  }, [settings.endDate, settings.showTimer]);

  useEffect(() => {
    setViewAllowed(true);
  }, []);

  useEffect(() => {
    if (settings.announcementType !== "Carousel") return;

    const track = document.querySelector(".carousel-track") as HTMLElement | null;
    if (!track) return;

    let index = 0;
    const total = settings.messages.length;

    const interval = setInterval(() => {
      index = (index + 1) % total;
      track.style.transform = `translateX(-${index * 100}%)`;
    }, 3000);

    return () => clearInterval(interval);
  }, [settings.announcementType, settings.messages]);

  const resetViews = () => {
    localStorage.removeItem("countdown_views");
    setViewAllowed(true);
    location.reload();
  };

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
      {toastActive && (
        <Toast
          content="Announcement saved successfully!"
          onDismiss={() => setToastActive(false)}
        />
      )}

      <div className="fixed top-0 left-1/2 transform -translate-x-1/2 w-1/2 z-50 px-4 py-2 border-b border-blue-200 text-sm text-blue-900 font-medium text-center">
        You are viewing a live preview of banner
      </div>

      <Page
        fullWidth
        title="Preview"
        backAction={{
          content: "Back",
          icon: ArrowLeftIcon,
          onAction: () => router.back(),
        }}
      >
        {viewAllowed && (
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
                <div className="carousel-track">
                  {messages.map((msg, i) => (
                    <div className="carousel-slide" key={i}>
                      {msg}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="fixed bottom-[-24px] left-0 w-full h-[400px] bg-white z-30 overflow-y-auto shadow-2xl border-t px-4 py-6">
          
            <SettingsPanel
              settings={settings}
              setSettings={setSettings}
              resetViews={resetViews}
              onSave={() => {
                setToastActive(true);
                setTimeout(() => {
                  setToastActive(false);
                  router.push("/dashboard");
                }, 2000);
              }}
            />
          </div>
        {/* </div> */}
      </Page>
    </Frame>
  );
};

export default AddCountdownBannerPage;
