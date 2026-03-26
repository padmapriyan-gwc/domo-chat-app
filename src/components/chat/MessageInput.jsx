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
                    bg-gradient-to-r from-violet-100/65 to-pink-100/50 border-t border-violet-200/70"
    >
      {/* Input area */}
      <div
        className="flex-1 flex items-center gap-2 px-4 py-2.5
                      rounded-2xl border border-violet-200 bg-white/95
                      focus-within:bg-white focus-within:border-violet-300
                      focus-within:ring-2 focus-within:ring-violet-200/70
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
                    shrink-0 active:scale-95 text-white
                    bg-violet-500 hover:bg-violet-600"
      >
        Send
      </button>
    </div>
  );
}
