import React, { useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useMessages } from "../../hooks/useMessages";
import { useOnlineUsers } from "../../hooks/useOnlineUsers";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { DateSeparator } from "./DateSeparator";
import { TypingIndicator } from "./TypingIndicator";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { getUserColor, formatDateSeparator } from "../../utils/helpers";

export function ChatWindow({ room, onBack }) {
  const { user } = useAuth();
  const bottomRef = useRef(null);

  const roomId = room?.id || "general";

  const roomName =
    room?.type === "dm"
      ? room.members?.find((m) => m !== user.username) || "Chat"
      : room?.name || "general";

  const {
    messages,
    loading,
    typingUsers,
    sendMessage,
    publishTyping,
    deleteMessage,
    editMessage,
  } = useMessages(roomId, user.username);

  const onlineUsers = useOnlineUsers(user.username);

  // ✅ FIXED ONLINE STATUS (same as RoomItem)
  const dmUser =
    room?.type === "dm"
      ? room.members?.find((m) => m !== user.username)
      : null;

  const isUserOnline =
    dmUser
      ? onlineUsers.some(
          (u) => u.toLowerCase() === dmUser.toLowerCase()
        )
      : false;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (text) => sendMessage(text, user.username);

  const renderMessages = () => {
    const items = [];
    let lastDate = null;
    let lastSender = null;

    messages.forEach((msg) => {
      const msgDate = formatDateSeparator(msg.timestamp);

      if (msgDate !== lastDate) {
        items.push(
          <DateSeparator key={`date-${msg.timestamp}`} label={msgDate} />
        );
        lastDate = msgDate;
        lastSender = null;
      }

      const isOwn = msg.sender === user?.username;
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
      <div
        className="flex items-center justify-between px-5 py-3
                  border-b border-gray-100 shrink-0 bg-violet-50"
      >
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
            <div
              className={`w-9 h-9 rounded-full flex items-center
                          justify-center text-sm font-semibold
                          text-white ${bg}`}
            >
              {roomName[0]?.toUpperCase()}
            </div>

            {/* ✅ Online indicator */}
            {room?.type === "dm" && isUserOnline && (
              <span
                className="absolute bottom-0 right-0 w-2.5 h-2.5
                          bg-green-400 rounded-full border-2 border-white"
              />
            )}
          </div>

          <div>
            <p className="text-gray-900 text-sm font-bold leading-tight">
              {roomName}
            </p>

            {/* ✅ Status text */}
            <p className="text-xs font-medium">
              {room?.type === "dm" ? (
                isUserOnline ? (
                  <span className="text-green-500">Online</span>
                ) : (
                  <span className="text-gray-400">Offline</span>
                )
              ) : room?.type === "group" ? (
                <span className="text-gray-400">
                  {room.members?.length || 0} members
                </span>
              ) : (
                <span className="text-gray-400">Public channel</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-5 py-5 space-y-1
                  bg-linear-to-b from-transparent to-purple-50/40"
      >
        {loading ? (
          <LoadingSpinner text="Loading messages..." />
        ) : messages.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-full gap-4">
            <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center text-3xl shadow-sm">
              💬
            </div>
            <p className="text-gray-400 text-sm">
              Start the conversation ✨
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