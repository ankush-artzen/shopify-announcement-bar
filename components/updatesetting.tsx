"use client";

import React, { useState, useEffect } from "react";
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
import type { Settings } from "@/app/types/settings";

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
  resetViews,
  onSave,
}) => {
  const [calendarDate, setCalendarDate] = useState<string>("");
  const [calendarTime, setCalendarTime] = useState<string>("00:00");
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [showColors, setShowColors] = useState<boolean>(false);
  const [newMessage, setNewMessage] = useState<string>("");

  // 🕒 Extract initial date/time from settings.endDate
  useEffect(() => {
    if (settings.endDate) {
      const [datePart, timePart] = settings.endDate.split("T");
      setCalendarDate(datePart);
      setCalendarTime(timePart?.slice(0, 5) || "00:00");
    }
  }, [settings.endDate]);

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

      <div className="px-0 pb-2">
        <Text as="h2" variant="bodyMd" fontWeight="bold">
          Countdown Banner Settings
        </Text>
      </div>

      <FormLayout>
        {/* Announcement Type */}
        <Select
          label={
            <Text as="span" fontWeight="bold">
              Announcement Type
            </Text>
          }
          options={announcementOptions}
          onChange={handleChange("announcementType")}
          value={announcementType}
        />

        {settings.announcementType === "Simple" && (
          <TextField
            label={
              <Text as="span" fontWeight="bold">
                Title
              </Text>
            }
            value={settings.title}
            onChange={handleChange("title")}
            autoComplete="off"
          />
        )}

        {/* Messages (Marquee / Carousel only) */}
        {announcementType !== "Simple" && (
          <MessagesInput
            settings={settings}
            setSettings={setSettings}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
          />
        )}

        {/* Calendar for Simple + showTimer */}
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

        {/* Show color options */}
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

        {/* Button config (Simple only) */}
        {announcementType === "Simple" && (
          <ButtonOptions
            settings={settings}
            handleCheckbox={handleCheckbox}
            handleChange={handleChange}
          />
        )}

        {/* Marquee Speed slider */}
        {announcementType === "Marquee" && (
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
            onChange={(value) => handleChange("marqueeSpeed")(value as number)}
            output
          />
        )}

        {/* Reset views button (optional) */}
        {resetViews && (
          <div className="pt-2">
            <button
              onClick={resetViews}
              className="text-sm text-red-600 hover:underline"
            >
              Reset View Count
            </button>
          </div>
        )}

        <Divider />
      </FormLayout>
    </Card>
  );
};

export default SettingsPanel;
