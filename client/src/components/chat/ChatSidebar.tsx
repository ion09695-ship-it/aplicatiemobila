import { Button } from "@/components/ui/button";
import { Globe, Plus, X } from "lucide-react";
import type { ChatSessionWithMessages } from "@shared/schema";

interface ChatSidebarProps {
  sessions: ChatSessionWithMessages[];
  currentSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  onClose: () => void;
}

export function ChatSidebar({ 
  sessions, 
  currentSessionId, 
  onSelectSession, 
  onNewChat,
  onClose 
}: ChatSidebarProps) {
  // Group sessions by date
  const groupSessionsByDate = (sessions: ChatSessionWithMessages[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const groups = {
      today: [] as ChatSessionWithMessages[],
      yesterday: [] as ChatSessionWithMessages[],
      thisWeek: [] as ChatSessionWithMessages[],
      older: [] as ChatSessionWithMessages[]
    };

    sessions.forEach(session => {
      const sessionDate = new Date(session.updatedAt || session.createdAt || 0);
      const sessionDay = new Date(sessionDate.getFullYear(), sessionDate.getMonth(), sessionDate.getDate());

      if (sessionDay.getTime() === today.getTime()) {
        groups.today.push(session);
      } else if (sessionDay.getTime() === yesterday.getTime()) {
        groups.yesterday.push(session);
      } else if (sessionDate > thisWeek) {
        groups.thisWeek.push(session);
      } else {
        groups.older.push(session);
      }
    });

    return groups;
  };

  const sessionGroups = groupSessionsByDate(sessions);

  const formatTime = (date: Date | string | null) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const SessionGroup = ({ title, sessions, showTime = false }: { 
    title: string; 
    sessions: ChatSessionWithMessages[];
    showTime?: boolean;
  }) => {
    if (sessions.length === 0) return null;

    return (
      <>
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider px-2 py-1 mt-4 first:mt-0">
          {title}
        </div>
        <div className="space-y-1">
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className={`w-full p-3 rounded-lg text-left transition-colors ${
                session.id === currentSessionId
                  ? "bg-blue-50 border border-blue-100"
                  : "hover:bg-gray-50"
              }`}
            >
              <div className="font-medium text-sm text-gray-900 truncate">
                {session.title}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {session.messageCount} message{session.messageCount !== 1 ? 's' : ''}
              </div>
              {showTime && (
                <div className="text-xs text-blue-600 mt-1">
                  {formatTime(session.updatedAt || session.createdAt)}
                </div>
              )}
            </button>
          ))}
        </div>
      </>
    );
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 shadow-lg h-screen flex flex-col">
      {/* Header */}
      <div className="bg-gradient-ocean p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Globe className="text-white h-4 w-4" />
            </div>
            <div>
              <h2 className="text-white font-semibold">TravelAI</h2>
              <p className="text-white/80 text-xs">Chat History</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-white/80 hover:text-white"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <Button
          onClick={onNewChat}
          className="w-full mt-3 bg-white/20 hover:bg-white/30 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Chat sessions */}
      <div className="flex-1 p-3 overflow-y-auto">
        <SessionGroup title="Today" sessions={sessionGroups.today} showTime />
        <SessionGroup title="Yesterday" sessions={sessionGroups.yesterday} />
        <SessionGroup title="This Week" sessions={sessionGroups.thisWeek} />
        <SessionGroup title="Older" sessions={sessionGroups.older} />
        
        {sessions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No chat history yet.</p>
            <p className="text-xs mt-1">Start a conversation to see it here!</p>
          </div>
        )}
      </div>
    </div>
  );
}
