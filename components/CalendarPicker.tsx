"use client";

import React from "react";
import { Box, Checkbox, Button, Text } from "@shopify/polaris";

interface Settings {
  showTimer: boolean;
  endDate: string;
}

interface CalendarPickerProps {
  settings: Settings;
  handleCheckbox: (field: keyof Settings) => (checked: boolean) => void;
  showCalendar: boolean;
  setShowCalendar: React.Dispatch<React.SetStateAction<boolean>>;
  calendarDate: string;
  calendarTime: string;
  setCalendarDate: React.Dispatch<React.SetStateAction<string>>;
  setCalendarTime: React.Dispatch<React.SetStateAction<string>>;
  updateDateTime: (date: string, time: string) => void;
}

const CalendarPicker: React.FC<CalendarPickerProps> = ({
  settings,
  handleCheckbox,
  showCalendar,
  setShowCalendar,
  calendarDate,
  calendarTime,
  setCalendarDate,
  setCalendarTime,
  updateDateTime,
}) => {
  const handleDateSelect = () => {
    updateDateTime(calendarDate, calendarTime);
    setShowCalendar(true);
  };

  return (
    <Box>
      <Checkbox
        label="Enable Countdown Timer"
        checked={settings.showTimer}
        onChange={handleCheckbox("showTimer")}
      />

      {settings.showTimer && (
        <>
          <Box paddingBlockEnd="200">
            <Text variant="bodyMd" fontWeight="medium" as="p">
              End Date:
            </Text>
            <Text as="span" tone="subdued">
              {!isNaN(new Date(settings.endDate).getTime())
                ? new Date(settings.endDate).toLocaleString()
                : "Not Set"}
            </Text>
          </Box>

          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
              marginTop: "1rem",
            }}
          >
            <input
              type="date"
              value={calendarDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setCalendarDate(e.target.value)
              }
              style={{
                padding: "6px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
            <input
              type="time"
              value={calendarTime}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setCalendarTime(e.target.value)
              }
              style={{
                padding: "6px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
            <Button onClick={handleDateSelect} variant="primary">
              Apply
            </Button>
          </div>
        </>
      )}
    </Box>
  );
};

export default CalendarPicker;
