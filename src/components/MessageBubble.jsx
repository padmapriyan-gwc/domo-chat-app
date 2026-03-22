import React from 'react';

export const MessageBubble = ({ msg, isOwn }) => (
  <div className={`flex flex-col mb-3 ${isOwn ? 'items-end' : 'items-start'}`}>
    {!isOwn && (
      <span className="text-xs text-gray-400 mb-1 ml-1 font-medium">{msg.sender}</span>
    )}
    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm shadow-sm
      ${isOwn
        ? 'bg-blue-500 text-white rounded-br-none'
        : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'}`}>
      {msg.message}
    </div>
    <span className="text-xs text-gray-400 mt-1 mx-1">
      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
    </span>
  </div>
);