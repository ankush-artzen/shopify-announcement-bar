import React from "react";
import { TextField, Button, Text, Tag } from "@shopify/polaris";
import type { Settings } from "@/app/types/settings";

interface MessagesInputProps {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  newMessage: string;
  setNewMessage: React.Dispatch<React.SetStateAction<string>>;
}

// Your MessagesInput component logic here...

const MessagesInput: React.FC<MessagesInputProps> = ({
  settings,
  setSettings,
  newMessage,
  setNewMessage,
}) => {
  return (
    <>
      <Text variant="headingSm" as="h6">
        Announcement Messages
      </Text>

      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "12px",
          alignItems: "flex-end",
        }}
      >
        <TextField
          label="New Message"
          value={newMessage}
          onChange={(value: string) => setNewMessage(value)}
          autoComplete="off"
        />
        <Button
          onClick={() => {
            if (newMessage.trim() !== "") {
              setSettings((prev) => ({
                ...prev,
                messages: [...prev.messages, newMessage.trim()],
              }));
              setNewMessage("");
            }
          }}
          variant="primary"
        >
          Add
        </Button>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          marginBottom: "16px",
        }}
      >
        {(settings.messages ?? []).map((msg, index) => (
          <Tag
            key={index}
            onRemove={() => {
              const updatedMessages = settings.messages.filter(
                (_, i) => i !== index,
              );
              setSettings((prev) => ({ ...prev, messages: updatedMessages }));
            }}
          >
            {msg}
          </Tag>
        ))}
      </div>
    </>
  );
};

export default MessagesInput;
