"use client";

import React from "react";
import { Box, Checkbox, TextField, Select, Divider,Text} from "@shopify/polaris";
import { buttonPositionOptions } from "@/lib/constants";

type ButtonPosition = "top" | "bottom" | "left" | "right";

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
        label={
          <Text as="span" fontWeight="bold">
            Show Button
          </Text>
        }
        checked={settings.showButton}
        onChange={handleCheckbox("showButton")}
      />

      {settings.showButton && (
        <Box paddingBlockStart="400">
          {/* <Checkbox
            label={
              <Text as="span" fontWeight="bold">
                Enable Button Link
              </Text>
            }
            checked={settings.enableButtonLink}
            onChange={handleCheckbox("enableButtonLink")}
          /> */}

          <TextField
            label={
              <Text as="span" fontWeight="bold">
                Button Label
              </Text>
            }
            value={settings.buttonLabel}
            onChange={handleChange("buttonLabel")}
            autoComplete="off"
          />

          <TextField
            label={
              <Text as="span" fontWeight="bold">
                Button URL
              </Text>
            }
            value={settings.buttonUrl}
            onChange={handleChange("buttonUrl")}
            autoComplete="off"
          />

          <Select
            label={
              <Text as="span" fontWeight="bold">
                Button Position
              </Text>
            }
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
