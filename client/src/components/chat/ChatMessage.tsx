import { Bot, User } from "lucide-react";
import { FlightResults } from "../travel/FlightResults";
import { HotelResults } from "../travel/HotelResults";
import { ActivityResults } from "../travel/ActivityResults";

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp: string;
  travelResults?: {
    type: 'hotels' | 'flights' | 'activities';
    data: any;
  };
}

export function ChatMessage({ message, isUser, timestamp, travelResults }: ChatMessageProps) {
  if (isUser) {
    return (
      <div className="flex items-start gap-3 mb-6 justify-end animate-slide-up">
        <div className="flex-1 flex justify-end">
          <div className="bg-gradient-ocean text-white rounded-2xl rounded-tr-md px-4 py-3 max-w-2xl">
            <p>{message}</p>
          </div>
        </div>
        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="text-gray-600 h-4 w-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 mb-6 animate-fade-in">
      <div className="w-8 h-8 bg-gradient-ocean rounded-full flex items-center justify-center flex-shrink-0">
        <Bot className="text-white h-4 w-4" />
      </div>
      <div className="flex-1">
        <div className="bg-gray-100 rounded-2xl rounded-tl-md px-4 py-3 max-w-4xl">
          <p className="text-gray-800 mb-4">{message}</p>
          
          {/* Travel results */}
          {travelResults && (
            <div className="mt-4">
              {travelResults.type === 'flights' && travelResults.data.flights && (
                <FlightResults flights={travelResults.data.flights} />
              )}
              {travelResults.type === 'hotels' && travelResults.data.hotels && (
                <HotelResults hotels={travelResults.data.hotels} />
              )}
              {travelResults.type === 'activities' && travelResults.data.activities && (
                <ActivityResults activities={travelResults.data.activities} />
              )}
            </div>
          )}
        </div>
        <div className="text-xs text-gray-500 mt-1 px-1">{timestamp}</div>
      </div>
    </div>
  );
}
