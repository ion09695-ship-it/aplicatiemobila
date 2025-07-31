export function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 mb-6">
      <div className="w-8 h-8 bg-gradient-ocean rounded-full flex items-center justify-center flex-shrink-0">
        <div className="w-4 h-4 text-white">✨</div>
      </div>
      <div className="bg-gray-100 rounded-2xl rounded-tl-md px-4 py-3">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
        </div>
      </div>
    </div>
  );
}
