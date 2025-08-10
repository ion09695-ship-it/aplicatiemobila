import React, { KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { FaPaperPlane } from "react-icons/fa";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ value, onChange, onSendMessage, disabled = false }: ChatInputProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() !== "") {
        onSendMessage(value.trim());
      }
    }
  };

  const handleSendClick = () => {
    if (value.trim() !== "") {
      onSendMessage(value.trim());
    }
  };

  return (
    <div className="flex items-center gap-2">
      <textarea
        className="flex-1 resize-none rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        rows={1}
        placeholder="Scrie mesajul..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        style={{ maxHeight: "4rem", lineHeight: "1.3rem" }}
      />
      <Button
        variant="default"      // sau păstrează cum îl foloseai tu
        className="flex items-center justify-center p-2 rounded-md"
        onClick={handleSendClick}
        disabled={disabled || value.trim() === ""}
        aria-label="Trimite mesaj"
      >
        <FaPaperPlane className="w-4 h-4" />
      </Button>
    </div>
  );
}
