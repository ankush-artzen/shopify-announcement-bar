"use client";

import React, { useState } from "react";
import {
  Card,
  Select,
  TextField,
  Checkbox,
  RangeSlider,
  Divider,
  FormLayout,
  Text,
  Button,
} from "@shopify/polaris";
import { useRouter } from "next/navigation";

import MessagesInput from "./MessagesInput";
import ColorPicker from "./ColorPicker";
import ButtonOptions from "./ButtonOptions";
import FinalActions from "./FinalActions";
import CalendarPicker from "./CalendarPicker";

import { announcementOptions } from "@/lib/constants";
import type { Settings, ButtonPosition } from "@/app/types/settings";

// -----------------------
// Props
// -----------------------

interface SettingsPanelProps {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  bannerId?: string;
  resetViews?: () => void;
  onSave?: () => void;
  shop?: string;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  setSettings,
  bannerId,
  resetViews,
  onSave,
  shop,
}) => {
  const router = useRouter();

  const [calendarDate, setCalendarDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [calendarTime, setCalendarTime] = useState<string>("23:59");
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [showColors, setShowColors] = useState<boolean>(false);
  const [newMessage, setNewMessage] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  // -----------------------
  // Handlers
  // -----------------------

  const handleChange = (field: keyof Settings) => (value: string | number) => {
    if (typeof value === "string" || typeof value === "number") {
      setSettings((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };
  const handleStringChange =
    (field: keyof Settings) =>
    (value: string): void => {
      setSettings((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const handleNumberChange =
    (field: keyof Settings) =>
    (value: number): void => {
      setSettings((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const handleCheckbox =
    (field: keyof Settings) =>
    (value: boolean): void => {
      setSettings((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const updateDateTime = (date: string, time: string) => {
    const newDateTime = `${date}T${time}:00`;
    setSettings((prev) => ({ ...prev, endDate: newDateTime }));
  };

  const saveAnnouncement = async () => {
    if (isSaving) return;
    setIsSaving(true);

    if (!shop) {
      console.error("❌ Shop is missing");
      setIsSaving(false);
      return;
    }

    try {
      const tokenRes = await fetch(`/api/token?shop=${shop}`);
      const tokenData = await tokenRes.json();

      if (!tokenData?.hasAccessToken) {
        console.error("❌ No access token found for this shop");
        setIsSaving(false);
        return;
      }
    } catch (err) {
      console.error("❌ Error checking token:", err);
      setIsSaving(false);
      return;
    }

    // 🔽 Filter relevant settings based on announcement type and toggles
    const filteredSettings: Partial<Settings> = {
      announcementType: settings.announcementType,
      title: settings.title,
    };

    if (
      settings.announcementType === "Marquee" ||
      settings.announcementType === "Carousel"
    ) {
      filteredSettings.messages = settings.messages;
    }

    if (settings.announcementType === "Marquee") {
      filteredSettings.marqueeSpeed = settings.marqueeSpeed;
    }

    if (settings.announcementType === "Simple") {
      filteredSettings.endDate = settings.endDate;
      filteredSettings.showTimer = settings.showTimer;
      filteredSettings.showButton = settings.showButton;

      if (settings.showButton) {
        filteredSettings.buttonLabel = settings.buttonLabel;
        filteredSettings.buttonPosition = settings.buttonPosition;
        filteredSettings.enableButtonLink = settings.enableButtonLink;
        filteredSettings.buttonUrl = settings.buttonUrl;
      }
    }

    // Always include color settings
    filteredSettings.bgColor = settings.bgColor;
    filteredSettings.textColor = settings.textColor;

    // Optional view logic
    if (settings.enableViewLimit) {
      filteredSettings.enableViewLimit = true;
      filteredSettings.maxViews = settings.maxViews;
    }

    if (settings.enableViewCount) {
      filteredSettings.enableViewCount = true;
    }

    const payload = {
      name: settings.title || "Untitled",
      status: "Paused",
      settings: filteredSettings,
      shop,
    };

    try {
      const response = await fetch(
        bannerId
          ? `/api/announcements/${bannerId}?shop=${shop}`
          : `/api/announcements?shop=${shop}`,
        {
          method: bannerId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (data.success) {
        console.log("✅ Announcement saved:", data);
        if (onSave) onSave();
      } else {
        console.error("❌ Save failed:", data.error);
      }
    } catch (error) {
      console.error("❌ Save error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // -----------------------
  // JSX
  // -----------------------

  return (
    <>
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800 font-bold">
        Here you can apply settings in the live banner and see preview.
      </div>

      <Card>
        <Card>
          <div className="px-0 pb-2">
            <Text as="h2" variant="bodyMd" fontWeight="bold">
              Countdown Banner Settings
            </Text>
          </div>

          <FormLayout>
            <Select
              label={
                <Text as="span" fontWeight="bold">
                  Announcement Type
                </Text>
              }
              options={announcementOptions}
              onChange={handleStringChange("announcementType")}
              value={settings.announcementType}
            />

            {settings.announcementType === "Simple" && (
              <TextField
                label={
                  <Text as="span" fontWeight="bold">
                    Title
                  </Text>
                }
                value={settings.title}
                onChange={handleStringChange("title")}
                autoComplete="off"
              />
            )}
            {settings.announcementType !== "Simple" && (
              <MessagesInput
                settings={settings}
                setSettings={setSettings}
                newMessage={newMessage}
                setNewMessage={setNewMessage}
              />
            )}

            {settings.announcementType === "Simple" && (
              <CalendarPicker
                settings={settings}
                handleCheckbox={handleCheckbox}
                showCalendar={showCalendar}
                setShowCalendar={setShowCalendar}
                calendarDate={calendarDate}
                calendarTime={calendarTime}
                setCalendarDate={setCalendarDate}
                setCalendarTime={setCalendarTime}
                updateDateTime={updateDateTime}
              />
            )}

            <Checkbox
              label={
                <Text as="span" fontWeight="bold">
                  Show Color Options
                </Text>
              }
              checked={showColors}
              onChange={setShowColors}
            />

            {showColors && (
              <ColorPicker settings={settings} setSettings={setSettings} />
            )}

            {settings.announcementType === "Simple" && (
              <ButtonOptions
                settings={settings}
                handleCheckbox={handleCheckbox}
                handleChange={handleChange}
              />
            )}

            {settings.announcementType === "Marquee" && (
              <RangeSlider
                label={
                  <Text as="span" fontWeight="bold">
                    Marquee Speed (seconds)
                  </Text>
                }
                min={5}
                max={60}
                step={1}
                value={settings.marqueeSpeed}
                onChange={handleNumberChange("marqueeSpeed")}
                output
              />
            )}

            <Divider />

            <div className="sticky bottom-0 translate-y-[-30px] bg-white px-4 pt-4 pb-0 border-t z-10">
              <FinalActions
                onSave={saveAnnouncement}
                onBack={() => router.push("/custombar")}
              />
            </div>
          </FormLayout>
        </Card>
      </Card>
    </>
  );
};

export default SettingsPanel;
