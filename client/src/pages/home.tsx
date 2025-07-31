import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { QuickActions } from "@/components/chat/QuickActions";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { Button } from "@/components/ui/button";
import { Globe, Menu, Settings } from "lucide-react";
import type { MessageWithMetadata, ChatSessionWithMessages } from "@shared/schema";

export default function Home() {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch chat sessions for sidebar
  const { data: sessions = [] } = useQuery<ChatSessionWithMessages[]>({
    queryKey: ["/api/chat/sessions"],
  });

  // Fetch messages for current session
  const { data: messages = [], isLoading: messagesLoading } = useQuery<MessageWithMetadata[]>({
    queryKey: ["/api/chat/sessions", currentSessionId, "messages"],
    enabled: !!currentSessionId,
  });

  // Create new chat session
  const createSessionMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/chat/sessions", {
        title: "New Chat"
      });
      return res.json();
    },
    onSuccess: (newSession) => {
      setCurrentSessionId(newSession.id);
      queryClient.invalidateQueries({ queryKey: ["/api/chat/sessions"] });
    },
  });

  // Send message
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!currentSessionId) throw new Error("No active session");
      const res = await apiRequest("POST", `/api/chat/sessions/${currentSessionId}/messages`, {
        content
      });
      return res.json();
    },
    onMutate: () => {
      setIsTyping(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/chat/sessions", currentSessionId, "messages"] 
      });
      queryClient.invalidateQueries({ queryKey: ["/api/chat/sessions"] });
      setIsTyping(false);
    },
    onError: () => {
      setIsTyping(false);
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Create initial session if none exists
  useEffect(() => {
    if (!currentSessionId && sessions.length === 0 && !createSessionMutation.isPending) {
      createSessionMutation.mutate();
    } else if (!currentSessionId && sessions.length > 0) {
      setCurrentSessionId(sessions[0].id);
    }
  }, [sessions, currentSessionId, createSessionMutation]);

  const handleSendMessage = (content: string) => {
    sendMessageMutation.mutate(content);
  };

  const handleSelectSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setSidebarOpen(false);
  };

  const handleNewChat = () => {
    createSessionMutation.mutate();
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <div className={`fixed lg:sticky lg:top-0 z-30 h-screen transition-all duration-300 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>
        <ChatSidebar
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSelectSession={handleSelectSession}
          onNewChat={handleNewChat}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Header + Status Bar */}
        <div className="sticky top-0 z-10">
          {/* Header */}
          <div className="bg-gradient-ocean px-4 py-3 shadow-elegant">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden text-white hover:bg-white/10"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Globe className="text-white h-4 w-4" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-white">TravelAI</h1>
                  <p className="text-xs text-white/80">AI Travel Assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 text-white/90">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse-soft"></div>
                  <span className="text-xs">Online</span>
                </div>
                <Button variant="ghost" size="sm" className="text-white/80 hover:text-white">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Status bar */}
          <div className="bg-blue-50 px-4 py-2 border-b border-blue-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse-soft"></div>
                <span className="text-xs text-gray-600">Connected to travel booking APIs • Ready to help plan your journey</span>
              </div>
              <span className="text-xs text-gray-500">GPT-4 Enhanced</span>
            </div>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 px-4 py-4 overflow-y-auto bg-white">
          {messagesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message.content}
                  isUser={message.isUser === "true"}
                  timestamp={message.createdAt ? new Date(message.createdAt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) : ""}
                  travelResults={message.travelResults}
                />
              ))}
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Quick actions */}
        <div className="px-4 pb-2">
          <QuickActions onActionClick={handleSendMessage} />
        </div>

        {/* Chat input */}
        <div className="px-4 py-4 border-t bg-gray-50">
          <ChatInput 
            onSendMessage={handleSendMessage} 
            disabled={sendMessageMutation.isPending || !currentSessionId}
          />
        </div>
      </div>
    </div>
  );
}
