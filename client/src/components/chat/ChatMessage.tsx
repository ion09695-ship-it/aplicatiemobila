import { Bot, User, ExternalLink } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-tl-md px-6 py-4 max-w-4xl shadow-sm">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                // Custom heading styles
                h1: ({ children }) => <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{children}</h1>,
                h2: ({ children }) => <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">{children}</h2>,
                h3: ({ children }) => <h3 className="text-base font-medium text-gray-700 dark:text-gray-200 mb-2">{children}</h3>,
                
                // Custom paragraph styling
                p: ({ children }) => <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">{children}</p>,
                
                // Custom list styling
                ul: ({ children }) => <ul className="list-none space-y-2 mb-3">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside space-y-2 mb-3 ml-4">{children}</ol>,
                li: ({ children }) => <li className="text-gray-700 dark:text-gray-300 flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>{children}</span>
                </li>,
                
                // Custom link styling with external icon
                a: ({ href, children }) => (
                  <a 
                    href={href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline decoration-1 underline-offset-2 transition-colors"
                  >
                    {children}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ),
                
                // Custom strong/bold styling
                strong: ({ children }) => <strong className="font-semibold text-gray-900 dark:text-white">{children}</strong>,
                
                // Custom emphasis/italic styling
                em: ({ children }) => <em className="italic text-gray-800 dark:text-gray-200">{children}</em>,
                
                // Custom code styling
                code: ({ children }) => <code className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded text-sm font-mono">{children}</code>,
                
                // Custom blockquote styling
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 py-2 my-3">
                    {children}
                  </blockquote>
                )
              }}
            >
              {message}
            </ReactMarkdown>
          </div>
          
          {/* Travel results */}
          {travelResults && (
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
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
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 px-1">{timestamp}</div>
      </div>
    </div>
  );
}
