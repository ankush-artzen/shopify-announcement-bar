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
} from "@shopify/polaris";

import MessagesInput from "./MessagesInput";
import ColorPicker from "./ColorPicker";
import ButtonOptions from "./ButtonOptions";
import CalendarPicker from "./CalendarPicker";

import { announcementOptions } from "@/lib/constants";
import type { Settings} from "@/app/types/settings";

interface SettingsPanelProps {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  bannerId?: string;
  resetViews?: () => void;
  onSave?: () => void;
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
    <Card>
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800 font-semibold">
        You can preview your applied settings in the live banner above.
      </div>

      <div className="px-4 pb-2">
        <Text as="h2" variant="bodyMd" fontWeight="bold">
          Countdown Banner Settings
        </Text>
      </div>

      <FormLayout>
        {/* Type Selection */}
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
          autoComplete="off"
        />

        {/* Messages input for Marquee/Carousel */}
        {announcementType !== "Simple" && (
          <MessagesInput
            settings={settings}
            setSettings={setSettings}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
          />
        )}

        {/* Calendar Picker for Simple */}
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

        {/* Toggle Color Options */}
        <Checkbox
          label="Show Color Options"
          checked={showColors}
          onChange={setShowColors}
        />

        {/* Color Picker Section */}
        {showColors && (
          <ColorPicker settings={settings} setSettings={setSettings} />
        )}

        {/* Button Options */}
        {announcementType === "Simple" && (
          <ButtonOptions
            settings={settings}
            handleCheckbox={handleCheckbox}
            handleChange={handleChange}
          />
        )}

        {/* Marquee Speed Slider */}
        {announcementType === "Marquee" && (
          <RangeSlider
            label="Marquee Speed (seconds)"
            min={5}
            max={60}
            step={1}
            value={settings.marqueeSpeed}
            onChange={(value) =>
              handleChange("marqueeSpeed")(value as number)
            }
            output
          />
        )}

        <Divider />
      </FormLayout>
    </Card>
  );
};

export default SettingsPanel;
