"use client";
import React, { ChangeEvent } from "react";
import type { Settings } from "@/app/types/settings";

interface ColorPickerProps {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ settings, setSettings }) => {
  const handleColorChange =
    (field: keyof Settings) => (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSettings((prev) => ({ ...prev, [field]: value }));
    };

  return (
    <div className="space-y-4 mt-4">
      {/* Background Color */}
      <div>
        <label className="block font-medium mb-1">Background Color</label>
        <input
          type="color"
          value={settings.bgColor}
          onChange={handleColorChange("bgColor")}
          className="w-16 h-9 border-none cursor-pointer"
        />
      </div>

      {/* Text Color */}
      <div>
        <label className="block font-medium mb-1">Text Color</label>
        <input
          type="color"
          value={settings.textColor}
          onChange={handleColorChange("textColor")}
          className="w-16 h-9 border-none cursor-pointer"
        />
      </div>
    </div>
  );
};

export default ColorPicker;
