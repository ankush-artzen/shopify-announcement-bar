"use client";
import React from "react";
import { Box, Checkbox, TextField, Select, Divider } from "@shopify/polaris";
import { buttonPositionOptions } from "@/lib/constants";

type ButtonPosition = "left" | "center" | "right"; // adjust if you have different options

interface Settings {
  showButton: boolean;
  enableButtonLink: boolean;
  buttonLabel: string;
  buttonUrl: string;
  buttonPosition: ButtonPosition;
}

interface ButtonOptionsProps {
  settings: Settings;
  handleCheckbox: (field: keyof Settings) => (value: boolean) => void;
  handleChange: (field: keyof Settings) => (value: string) => void;
}

const ButtonOptions: React.FC<ButtonOptionsProps> = ({
  settings,
  handleCheckbox,
  handleChange,
}) => {
  return (
    <>
      <Divider />
      <Checkbox
        label="Show Button"
        checked={settings.showButton}
        onChange={handleCheckbox("showButton")}
      />

      {settings.showButton && (
        <Box paddingBlockStart="4">
          <Checkbox
            label="Enable Button Link"
            checked={settings.enableButtonLink}
            onChange={handleCheckbox("enableButtonLink")}
          />
          <TextField
            label="Button Label"
            value={settings.buttonLabel}
            onChange={handleChange("buttonLabel")}
          />
          <TextField
            label="Button URL"
            value={settings.buttonUrl}
            onChange={handleChange("buttonUrl")}
          />
          <Select
            label="Button Position"
            options={buttonPositionOptions}
            onChange={handleChange("buttonPosition")}
            value={settings.buttonPosition}
          />
        </Box>
      )}
    </>
  );
};

export default ButtonOptions;
