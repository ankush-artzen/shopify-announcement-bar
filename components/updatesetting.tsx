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

import MessagesInput from "./MessagesInput";
import ColorPicker from "./ColorPicker";
import ButtonOptions from "./ButtonOptions";
import CalendarPicker from "./CalendarPicker";

import { announcementOptions } from "@/lib/constants";

type AnnouncementType = "Simple" | "Marquee" | "Carousel"; // Adjust if needed

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
  buttonPosition: "left" | "center" | "right"; // Adjust if more
  marqueeSpeed: number;
}

interface SettingsPanelProps {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  setSettings,
}) => {
  const [calendarDate, setCalendarDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [calendarTime, setCalendarTime] = useState<string>("23:59");
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [showColors, setShowColors] = useState<boolean>(false);
  const [newMessage, setNewMessage] = useState<string>("");

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

  const announcementType = settings.announcementType;

  return (
    <Card title="Countdown Banner Settings" sectioned>
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800 font-medium">
        You can preview your applied settings in the live banner above.
      </div>
      <FormLayout>
        {/* Announcement Type Selector */}
        <Select
          label="Announcement Type"
          options={announcementOptions}
          onChange={handleChange("announcementType")}
          value={announcementType}
        />

        {/* Title */}
        <TextField
          label="Title"
          value={settings.title}
          onChange={handleChange("title")}
        />

        {/* Marquee / Carousel Messages */}
        {announcementType !== "Simple" && (
          <MessagesInput
            settings={settings}
            setSettings={setSettings}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
          />
        )}

        {/* Countdown Timer Date Picker (Simple only) */}
        {announcementType === "Simple" && (
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

        {/* Color Customization */}
        <Checkbox
          label="Show Color Options"
          checked={showColors}
          onChange={(value: boolean) => setShowColors(value)}
        />
        {showColors && (
          <ColorPicker settings={settings} setSettings={setSettings} />
        )}

        {/* Button Settings (Simple only) */}
        {announcementType === "Simple" && (
          <ButtonOptions
            settings={settings}
            handleCheckbox={handleCheckbox}
            handleChange={handleChange}
          />
        )}

        {/* Marquee-specific settings */}
        {announcementType === "Marquee" && (
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

        {/* Carousel-specific settings could go here */}
        <Divider />
      </FormLayout>
    </Card>
  );
};

export default SettingsPanel;
