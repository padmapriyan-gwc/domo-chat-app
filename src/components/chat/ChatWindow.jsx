import React, { useRef, useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useMessages } from "../../hooks/useMessages";
import { useOnlineUsers } from "../../hooks/useOnlineUsers";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { DateSeparator } from "./DateSeparator";
import { TypingIndicator } from "./TypingIndicator";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { getUserColor, formatDateSeparator } from "../../utils/helpers";
import { GroupMembersModal } from "../modals/GroupMembersModal";

export function ChatWindow({ room, onBack }) {
  const { user } = useAuth();
  const bottomRef = useRef(null);

  const [showMembers, setShowMembers] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(room);

  // ✅ FIX 1: sync room prop changes to currentRoom
  useEffect(() => {
    // ✅ Only update if id is the same — prevents message reload
    if (room?.id === currentRoom?.id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentRoom(room);
    } else {
      setCurrentRoom(room);
      // id changed = genuinely new room, messages will reload correctly
    }
  }, [room?.id, room?.members]);

  const handleRoomUpdated = (updatedRoom) => {
    setCurrentRoom(updatedRoom);
  };

  // ✅ FIX 2: use currentRoom everywhere
  const roomId = currentRoom?.id || "general";

  const roomName =
    currentRoom?.type === "dm"
      ? currentRoom.members?.find((m) => m !== user.username) || "Chat"
      : currentRoom?.name || "general";

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

  // ✅ FIX 3: use currentRoom for dmUser
  const dmUser =
    currentRoom?.type === "dm"
      ? currentRoom.members?.find((m) => m !== user.username)
      : null;

  const isUserOnline = dmUser
    ? onlineUsers.some((u) => u.toLowerCase() === dmUser.toLowerCase())
    : false;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // const handleSend = (text) => sendMessage(text, user.username);
  
  const handleSend = (text, file = null) => {
    if (file) {
      sendMessage("", user.username, {
        type: "file",
        file, // raw File object — Domo API uploads it
      });
    } else {
      sendMessage(text, user.username);
    }
  };

  const renderMessages = () => {
    const items = [];
    let lastDate = null;
    let lastSender = null;

    messages.forEach((msg) => {
      const msgDate = formatDateSeparator(msg.timestamp);

      if (msgDate !== lastDate) {
        items.push(
          <DateSeparator key={`date-${msg.timestamp}`} label={msgDate} />,
        );
        lastDate = msgDate;
        lastSender = null;
      }

      // ✅ FIX 4: case-insensitive isOwn check
      const isOwn = msg.sender?.toLowerCase() === user?.username?.toLowerCase();
      const isGrouped = msg.sender === lastSender;

      items.push(
        <MessageBubble
          key={msg.id}
          msg={msg}
          isOwn={isOwn}
          isGrouped={isGrouped}
          onDelete={deleteMessage}
          onEdit={editMessage}
        />,
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
                   border-b border-violet-200/70 shrink-0 bg-gradient-to-r from-violet-100/70 via-violet-50/70 to-pink-100/55"
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

            {/* ✅ Online indicator — only for DMs */}
            {currentRoom?.type === "dm" && isUserOnline && (
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

            {/* ✅ Status text — correct per room type */}
            <p className="text-xs font-medium">
              {currentRoom?.type === "dm" ? (
                isUserOnline ? (
                  <span className="text-green-500">Online</span>
                ) : (
                  <span className="text-gray-400">Offline</span>
                )
              ) : currentRoom?.type === "group" ? (
                <span className="text-gray-400">
                  {currentRoom.members?.length || 0} members
                </span>
              ) : (
                <span className="text-gray-400">Public channel</span>
              )}
            </p>
          </div>
        </div>

        {/* ✅ Group members button */}
        {currentRoom?.type === "group" && (
          <button
            onClick={() => setShowMembers(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl
               text-xs font-semibold text-violet-600 bg-violet-50
               hover:bg-violet-100 transition-all"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            {currentRoom.members?.length} members
          </button>
        )}
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-5 py-5 space-y-1
                   bg-gradient-to-b from-violet-100/65 via-violet-50/35 to-pink-100/45"
      >
        {loading ? (
          <LoadingSpinner text="Loading messages..." />
        ) : messages.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-full gap-4">
            <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center text-3xl shadow-sm">
              💬
            </div>
            <p className="text-gray-400 text-sm">Start the conversation ✨</p>
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

      {showMembers && currentRoom?.type === "group" && (
        <GroupMembersModal
          room={currentRoom}
          onClose={() => setShowMembers(false)}
          onUpdated={handleRoomUpdated}
        />
      )}
    </div>
  );
}
