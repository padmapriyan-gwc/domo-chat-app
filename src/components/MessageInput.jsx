import React, { useState } from 'react';

export const MessageInput = ({ onSend }) => {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText('');
  };

  return (
    <div className="flex items-center gap-2 p-3 bg-white border-t border-gray-100">
      <input
        className="flex-1 px-4 py-2.5 rounded-full bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleSend()}
        placeholder="Type a message..."
      />
      <button
        onClick={handleSend}
        disabled={!text.trim()}
        className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 text-white text-sm font-semibold px-4 py-2.5 rounded-full transition-colors"
      >
        ➤
      </button>
    </div>
  );
};