"use client";
import React from "react";
import { Button } from "@shopify/polaris";

interface FinalActionsProps {
  onSave: () => void;
  onBack: () => void;
}

const FinalActions: React.FC<FinalActionsProps> = ({ onSave, onBack }) => {
  return (
    <div className="flex flex-row items-end space-x-6 mt-6">
      <Button variant="primary" onClick={onSave}>
        Save Announcement
      </Button>
      <Button onClick={onBack}>
        Back to Homepage
      </Button>
    </div>
  );
};

export default FinalActions;
