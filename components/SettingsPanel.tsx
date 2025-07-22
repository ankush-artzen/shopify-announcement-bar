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
} from "@shopify/polaris";
import { useRouter } from "next/navigation";

import MessagesInput from "./MessagesInput";
import ColorPicker from "./ColorPicker";
import ButtonOptions from "./ButtonOptions";
import FinalActions from "./FinalActions";
// import SaveConfirmationModal from "./SaveConfirmationModal";
import CalendarPicker from "./CalendarPicker";

import { announcementOptions } from "@/lib/constants";

type AnnouncementType = "Simple" | "Marquee" | "Carousel";

interface Settings {
  title: string;
  announcementType: AnnouncementType;
  messages: string[];
  showTimer: boolean;
  endDate: string;
  bgColor: string;
  textColor: string;
  showButton: boolean;
  enableButtonLink: boolean;
  buttonLabel: string;
  buttonUrl: string;
  buttonPosition: "left" | "center" | "right";
  marqueeSpeed: number;
}

interface SettingsPanelProps {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  resetViews?: () => void;
  onSave?: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  setSettings,
  resetViews,
  onSave,
}) => {
  const router = useRouter();

  const [calendarDate, setCalendarDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [calendarTime, setCalendarTime] = useState<string>("23:59");
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [showColors, setShowColors] = useState<boolean>(false);
  const [newMessage, setNewMessage] = useState<string>("");
  const [confirmSaveModal, setConfirmSaveModal] = useState<boolean>(false);

  const handleChange =
    (field: keyof Settings) =>
    (value: string | number): void => {
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
    const id = localStorage.getItem("countdown_id");

    const payload = {
      name: settings.title || "Untitled",
      status: "Paused",
      settings,
    };

    try {
      const response = await fetch(
        id ? `/api/announcements/${id}` : `/api/announcements`,
        {
          method: id ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
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
    }
  };

  return (
    <>
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800 font-medium">
        Here you can apply settings in the live banner and see preview.
      </div>

      <Card title="Countdown Banner Settings" sectioned>
        <FormLayout>
          <Select
            label="Announcement Type"
            options={announcementOptions}
            onChange={handleChange("announcementType")}
            value={settings.announcementType}
          />

          <TextField
            label="Title"
            value={settings.title}
            onChange={handleChange("title")}
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
              onChange={handleChange("marqueeSpeed")}
              output
            />
          )}

          <Divider />

          <FinalActions
            onSave={saveAnnouncement}
            onBack={() => router.push("/")}
          />
        </FormLayout>
      </Card>

      {/* <SaveConfirmationModal
        open={confirmSaveModal}
        onClose={() => setConfirmSaveModal(false)}
        onConfirm={() => {
          saveAnnouncement();
          setConfirmSaveModal(false);
        }}
      /> */}
    </>
  );
};

export default SettingsPanel;
