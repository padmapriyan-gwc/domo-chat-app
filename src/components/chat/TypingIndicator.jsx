import React from 'react';

export function TypingIndicator({ typingUsers }) {
  if (!typingUsers?.length) return null;

  const label = typingUsers.length === 1
    ? `${typingUsers[0]} is typing`
    : `${typingUsers.join(', ')} are typing`;

  return (
    <div className="flex items-center gap-2 px-6 py-1.5 flex-shrink-0"
      style={{ background: '#16213e' }}>
      <div className="flex gap-1 items-center">
        {[0, 150, 300].map(delay => (
          <span key={delay}
            className="w-1.5 h-1.5 rounded-full animate-bounce"
            style={{ background: '#a855f7', animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
      <span className="text-xs italic"
        style={{ color: 'rgba(255,255,255,0.3)' }}>
        {label}
      </span>
    </div>
  );
}