import React from 'react';

export function TypingIndicator({ typingUsers }) {
  if (!typingUsers?.length) return null;

  const label =
    typingUsers.length === 1
      ? `${typingUsers[0]} is typing`
      : `${typingUsers.join(', ')} are typing`;

  return (
    <div className="flex items-center gap-2 px-4 py-2 shrink-0
                    bg-white/80 backdrop-blur-sm
                    border-t border-none">

      {/* Animated dots */}
      <div className="flex gap-1 items-center">
        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" />
        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce [animation-delay:150ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce [animation-delay:300ms]" />
      </div>

      {/* Typing text */}
      <span className="text-xs italic text-gray-500">
        {label}
      </span>
    </div>
  );
}