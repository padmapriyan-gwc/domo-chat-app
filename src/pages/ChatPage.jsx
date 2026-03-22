import React, { useEffect, useState, useRef } from 'react';
import { ChatService } from '../services/chatService';
import { useAuth } from '../context/AuthContext';
import { MessageBubble } from '../components/MessageBubble';
import { MessageInput } from '../components/MessageInput';

export default function ChatPage({ room, onBack }) {
  const { user } = useAuth();
  const [messages, setMessages]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [online, setOnline]       = useState(true);
  const bottomRef                 = useRef(null);
  const pausePollRef              = useRef(false);

  const roomId = room?.id || 'general';
  const roomName = room?.type === 'dm'
    ? room.members?.find(m => m !== user.username) || 'Chat'
    : room?.name || 'general';

  const loadMessages = async () => {
    if (pausePollRef.current) return;
    try {
      const data = await ChatService.fetchMessages(roomId);
      setMessages(data);
      setOnline(true);
    } catch {
      setOnline(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setMessages([]);
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [roomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text) => {
    const msg = {
      sender: user.username,
      message: text,
      timestamp: new Date().toISOString(),
      roomId,
    };
    const temp = { ...msg, id: `temp-${Date.now()}` };
    setMessages(prev => [...prev, temp]);
    await ChatService.sendMessage(msg);
  };

  const handleDelete = (id) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  };

  const handleEdit = (oldId, newText, newId) => {
    pausePollRef.current = true;
    setMessages(prev =>
      prev.map(msg =>
        msg.id === oldId
          ? { ...msg, id: newId, message: newText, edited: 'true' }
          : msg
      )
    );
    setTimeout(() => { pausePollRef.current = false; }, 3000);
  };

  return (
    <div className="flex flex-col h-full">

      {/* Header with back button for mobile */}
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

        {/* Room avatar */}
        <div className={`w-9 h-9 rounded-full flex items-center justify-center
                         text-sm font-semibold flex-shrink-0
                         ${room?.type === 'group'
                           ? 'bg-purple-100 text-purple-600'
                           : room?.type === 'dm'
                           ? 'bg-teal-100 text-teal-600'
                           : 'bg-blue-100 text-blue-600'}`}>
          {room?.type === 'group' ? '⊞' : roomName[0]?.toUpperCase()}
        </div>

        {/* Room info */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-gray-800 truncate">
            {roomName}
          </p>
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0
                              ${online ? 'bg-green-400' : 'bg-red-400'}`} />
            {online ? 'Live' : 'Reconnecting...'}
            {room?.type === 'group' && ` · ${room.members?.length || 0} members`}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 md:px-4 py-4 bg-gray-50">
        {loading ? (
          <div className="flex justify-center items-center h-full
                          text-gray-400 text-sm">
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-full
                          text-gray-400 text-sm gap-2">
            <span className="text-3xl">👋</span>
            No messages yet. Say something!
          </div>
        ) : (
          messages.map(msg => (
            <MessageBubble
              key={msg.id}
              msg={msg}
              isOwn={msg.sender === user?.username}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <MessageInput onSend={handleSend} />
    </div>
  );
}