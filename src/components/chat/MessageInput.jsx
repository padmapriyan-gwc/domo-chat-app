import React, { useState, useRef } from "react";

export function MessageInput({ onSend, onTyping }) {
  const [text, setText] = useState("");
  const typingThrottle = useRef(null);

  const handleChange = (e) => {
    setText(e.target.value);
    if (!typingThrottle.current) {
      onTyping?.();
      typingThrottle.current = setTimeout(() => {
        typingThrottle.current = null;
      }, 2000);
    }
  };

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  };

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 flex-shrink-0
                    bg-zinc-100 border-t border-gray-100"
    >
      {/* Input area */}
      <div
        className="flex-1 flex items-center gap-2 px-4 py-2.5
                      rounded-2xl border border-gray-200 bg-gray-50
                      focus-within:bg-white focus-within:border-purple-200
                      focus-within:ring-2 focus-within:ring-purple-100
                      transition-all"
      >
        <input
          className="flex-1 text-sm text-gray-800 bg-transparent
                    focus:outline-none placeholder-gray-400 min-w-0"
          value={text}
          onChange={handleChange}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Send a Message"
        />
      </div>

      {/* Send */}
      <button
        onClick={handleSend}
        className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 
                    shrink-0 active:scale-95 bg-violet-400
                    hover:bg-pink-500 text-white"
      >
        Send
      </button>
    </div>
  );
}
