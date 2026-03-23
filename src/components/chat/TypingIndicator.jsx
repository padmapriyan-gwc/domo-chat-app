import React from 'react';

export function TypingIndicator({ typingUsers }) {
  if (!typingUsers?.length) return null;

  const label = typingUsers.length === 1
    ? `${typingUsers[0]} is typing`
    : `${typingUsers.join(', ')} are typing`;

  return (
    <div className="flex items-center gap-2 px-4 py-1">
      <div className="flex gap-1 items-center">
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full
                         animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full
                         animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full
                         animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="text-xs text-gray-400 italic">{label}</span>
    </div>
  );
}