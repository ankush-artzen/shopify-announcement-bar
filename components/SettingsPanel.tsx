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

    const payload = {
      name: settings.title || "Untitled",
      status: "Paused",
      settings,
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
          <Text as="h2" variant="bodyMd">
            Countdown Banner Settings
          </Text>

          <FormLayout>
            <Select
              label="Announcement Type"
              options={announcementOptions}
              onChange={handleStringChange("announcementType")}
              value={settings.announcementType}
            />

            <TextField
              label="Title"
              value={settings.title}
              onChange={handleStringChange("title")}
              autoComplete="off"
            />
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
              label="Show Color Options"
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
                label="Marquee Speed (seconds)"
                min={5}
                max={60}
                step={1}
                value={settings.marqueeSpeed}
                onChange={handleNumberChange("marqueeSpeed")}
                output
              />
            )}

            <Divider />

            <FinalActions
              onSave={saveAnnouncement}
              onBack={() => router.push("/custombar")}
            />
          </FormLayout>
        </Card>
      </Card>
    </>
  );
};

export default SettingsPanel;
