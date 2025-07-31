import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Image, Mic } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
    }
  }, [message]);

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me about flights, hotels, activities, or any travel questions..."
              className="w-full px-4 py-3 pr-12 bg-white border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[52px]"
              style={{ maxHeight: "120px" }}
              disabled={disabled}
            />
            <div className="absolute right-3 bottom-3 flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-gray-600 p-1 h-auto"
                title="Attach image"
              >
                <Image className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-gray-600 p-1 h-auto"
                title="Voice input"
              >
                <Mic className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <Button
          type="submit"
          className="bg-gradient-ocean text-white p-3 rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed h-12 w-12"
          disabled={!message.trim() || disabled}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex items-center justify-between mt-2 px-1">
        <div className="text-xs text-gray-500">
          Press Enter to send, Shift+Enter for new line
        </div>
        <div className="text-xs text-gray-400">
          Powered by GPT-4 & Travel APIs
        </div>
      </div>
    </form>
  );
}
