import React, { useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMessages } from '../../hooks/useMessages';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { DateSeparator } from './DateSeparator';
import { TypingIndicator } from './TypingIndicator';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { getUserColor } from '../../utils/helpers';
import { formatDateSeparator } from '../../utils/helpers';

export function ChatWindow({ room, onBack }) {
  const { user }  = useAuth();
  const bottomRef = useRef(null);

  const roomId = room?.id || 'general';
  const roomName = room?.type === 'dm'
    ? room.members?.find(m => m !== user.username) || 'Chat'
    : room?.name || 'general';

  const {
    messages,
    loading,
    online,
    typingUsers,
    sendMessage,
    publishTyping,
    deleteMessage,
    editMessage,
  } = useMessages(roomId, user.username);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (text) => sendMessage(text, user.username);

  const renderMessages = () => {
    const items = [];
    let lastDate   = null;
    let lastSender = null;

    messages.forEach((msg) => {
      const msgDate = formatDateSeparator(msg.timestamp);
      if (msgDate !== lastDate) {
        items.push(
          <DateSeparator key={`date-${msg.timestamp}`} label={msgDate} />
        );
        lastDate   = msgDate;
        lastSender = null;
      }
      const isOwn     = msg.sender === user?.username;
      const isGrouped = msg.sender === lastSender;
      items.push(
        <MessageBubble
          key={msg.id}
          msg={msg}
          isOwn={isOwn}
          isGrouped={isGrouped}
          onDelete={deleteMessage}
          onEdit={editMessage}
        />
      );
      lastSender = msg.sender;
    });

    return items;
  };

  const { bg } = getUserColor(roomName);

  return (
    <div className="flex flex-col h-full bg-white">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3
                      border-b border-gray-100 flex-shrink-0 bg-white">

        <div className="flex items-center gap-3">
          {/* Mobile back */}
          <button
            onClick={onBack}
            className="md:hidden w-8 h-8 flex items-center justify-center
                       text-gray-400 hover:text-gray-600 rounded-lg
                       hover:bg-gray-100 transition-all"
          >
            ←
          </button>

          {/* Avatar */}
          <div className="relative">
            <div className={`w-9 h-9 rounded-full flex items-center
                             justify-center text-sm font-semibold
                             text-white ${bg}`}>
              {roomName[0]?.toUpperCase()}
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5
                             bg-green-400 rounded-full border-2 border-white" />
          </div>

          <div>
            <p className="text-gray-900 text-sm font-bold leading-tight">
              {roomName}
            </p>
            <p className={`text-xs font-medium
              ${online ? 'text-green-500' : 'text-red-400'}`}>
              {online ? 'Online' : 'Reconnecting...'}
              {room?.type === 'group' &&
                ` · ${room.members?.length || 0} members`}
            </p>
          </div>
        </div>

        {/* Header right */}
        <button className="w-8 h-8 flex items-center justify-center
                          text-gray-300 hover:text-gray-500
                          hover:bg-gray-100 rounded-lg transition-all">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/>
            <circle cx="19" cy="12" r="2"/>
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 bg-slate-50">
        
        {loading ? (
          <LoadingSpinner text="Loading messages..." />
        ) : messages.length === 0 ? (
          <div className="flex flex-col justify-center items-center
                          h-full gap-3">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 flex
                            items-center justify-center text-2xl">
              👋
            </div>
            <p className="text-gray-400 text-sm">
              No messages yet. Say something!
            </p>
          </div>
        ) : (
          renderMessages()
        )}
        <div ref={bottomRef} />
      </div>

      {/* Typing */}
      <TypingIndicator typingUsers={typingUsers} />

      {/* Input */}
      <MessageInput
        onSend={handleSend}
        onTyping={() => publishTyping(user.username)}
      />
    </div>
  );
}