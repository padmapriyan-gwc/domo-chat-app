import React, { useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMessages } from '../../hooks/useMessages';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { Avatar } from '../common/Avatar';
import { LoadingSpinner } from '../common/LoadingSpinner';

export function ChatWindow({ room, onBack }) {
  const { user } = useAuth();
  const bottomRef = useRef(null);

  const roomId = room?.id || 'general';
  const roomName = room?.type === 'dm'
    ? room.members?.find(m => m !== user.username) || 'Chat'
    : room?.name || 'general';

  const {
    messages,
    loading,
    online,
    sendMessage,
    deleteMessage,
    editMessage,
  } = useMessages(roomId);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (text) => sendMessage(text, user.username);

  const colorMap = { group: 'purple', dm: 'teal', public: 'blue' };

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white
                      border-b border-gray-100 shadow-sm flex-shrink-0">

        {/* Back button — mobile only */}
        <button
          onClick={onBack}
          className="md:hidden w-8 h-8 flex items-center justify-center
                     text-gray-500 hover:text-gray-700 rounded-full
                     hover:bg-gray-100 transition-colors flex-shrink-0"
        >
          ←
        </button>

        <Avatar
          name={roomName}
          color={colorMap[room?.type] || 'blue'}
          size="md"
        />

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-gray-800 truncate">
            {roomName}
          </p>
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0
                              ${online ? 'bg-green-400' : 'bg-red-400'}`}
            />
            {online ? 'Live' : 'Reconnecting...'}
            {room?.type === 'group' &&
              ` · ${room.members?.length || 0} members`}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 md:px-4 py-4 bg-gray-50">
        {loading ? (
          <LoadingSpinner text="Loading messages..." />
        ) : messages.length === 0 ? (
          <div className="flex flex-col justify-center items-center
                          h-full text-gray-400 text-sm gap-2">
            <span className="text-3xl">👋</span>
            No messages yet. Say something!
          </div>
        ) : (
          messages.map(msg => (
            <MessageBubble
              key={msg.id}
              msg={msg}
              isOwn={msg.sender === user?.username}
              onDelete={deleteMessage}
              onEdit={editMessage}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <MessageInput onSend={handleSend} />
    </div>
  );
}