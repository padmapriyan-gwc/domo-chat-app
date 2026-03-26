import React, { useState, useEffect } from "react";
import { ChatService } from "../../services/chatService";
import { getUserColor } from "../../utils/helpers";

export function MessageBubble({ msg, isOwn, isGrouped, onDelete, onEdit }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(msg.message);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showActions, setShowActions] = useState(false);

  // Dismiss action menu when tapping outside on mobile
  useEffect(() => {
    if (!showActions) return;
    const dismiss = (e) => {
      if (e.target.closest(".action-menu")) return;
      setShowActions(false);
    };
    document.addEventListener("touchstart", dismiss);
    return () => document.removeEventListener("touchstart", dismiss);
  }, [showActions]);

  const handleDelete = async () => {
    await ChatService.deleteMessage(msg.id, msg.roomId);
    onDelete(msg.id);
    setShowConfirm(false);
  };

  const handleEdit = async () => {
    if (!editText.trim()) return;
    try {
      setIsEditing(false);
      setShowActions(false);
      const updated = await ChatService.editMessage(
        msg.id,
        editText.trim(),
        msg,
      );
      onEdit(msg.id, editText.trim(), updated.id);
    } catch {
      setIsEditing(true);
    }
  };

  const { bg } = getUserColor(msg.sender);

  return (
    <div
      className={`flex flex-col mb-0.5
                  ${isOwn ? "items-end" : "items-start"}
                  ${!isGrouped ? "mt-4" : "mt-0.5"}`}
    >
      {/* Sender name + avatar */}
      {!isOwn && !isGrouped && (
        <div className="flex items-center gap-2 mb-1.5 ml-1">
          <div
            className={`w-7 h-7 rounded-full flex items-center
                        justify-center text-xs font-bold
                        text-white shrink-0 ${bg}`}
          >
            {msg.sender?.[0]?.toUpperCase()}
          </div>
          <span className="text-gray-500 text-xs font-semibold">
            {msg.sender}
          </span>
        </div>
      )}

      <div
        className={`flex items-end max-w-xs lg:max-w-md ${!isOwn ? "ml-9" : ""}`}
      >
        {/* DELETE CONFIRM */}
        {showConfirm ? (
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl
                          bg-red-50 border border-red-100"
          >
            <span className="text-xs text-red-500">Delete this message?</span>
            <button
              onClick={handleDelete}
              className="text-xs text-red-500 font-bold hover:text-red-600"
            >
              Yes
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              No
            </button>
          </div>
        ) : isEditing ? (
          /* EDIT MODE */
          <div className="flex flex-col gap-2 w-64">
            <input
              className="px-3 py-2 rounded-xl border border-purple-200
                        text-sm text-gray-800 focus:outline-none
                        focus:ring-2 focus:ring-purple-300/50 bg-white"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleEdit();
                if (e.key === "Escape") {
                  setIsEditing(false);
                  setShowActions(false);
                }
              }}
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setShowActions(false);
                }}
                className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1"
              >
                Cancel
              </button>
              <button
                onClick={handleEdit}
                className="text-xs text-white font-semibold px-3 py-1 rounded-lg"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                }}
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          /* MESSAGE + ACTIONS */
          // overflow-visible prevents menu clipping
          <div className="relative group overflow-visible">
            {isOwn && (
              <>
                {/* DESKTOP: hover-only actions */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 right-[calc(100%+8px)]
                              opacity-0 group-hover:opacity-100
                              transition-all hidden sm:flex
                              gap-1 bg-white shadow-md
                              rounded-lg px-2 py-1 text-xs z-10 whitespace-nowrap"
                >
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-gray-500 hover:text-blue-500 px-1"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setShowConfirm(true)}
                    className="text-red-400 hover:text-red-500 px-1"
                  >
                    Delete
                  </button>
                </div>

                {/* MOBILE: tap bubble to toggle, appears above */}
                {showActions && (
                  <div
                    className="action-menu absolute -top-10 right-0
                              flex sm:hidden gap-1 bg-white shadow-lg
                              rounded-lg px-2 py-1.5 text-xs z-20
                              border border-gray-100 whitespace-nowrap"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEditing(true);
                        setShowActions(false); 
                      }}
                      className="text-gray-500 hover:text-blue-500 px-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); 
                        setShowConfirm(true); 
                        setShowActions(false); 
                      }}
                      className="text-red-400 hover:text-red-500 px-1"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </>
            )}

            {/* MESSAGE BUBBLE */}
            <div
              onClick={() => isOwn && setShowActions((prev) => !prev)}
              className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                        ${isOwn ? "cursor-pointer sm:cursor-default" : ""}`}
              style={
                isOwn
                  ? {
                      background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                      color: "#fff",
                      borderBottomRightRadius: "6px",
                    }
                  : {
                      background: "#f3f4f6",
                      color: "#1f2937",
                      borderBottomLeftRadius: "6px",
                    }
              }
            >
              {msg.message}
              {msg.edited === "true" && (
                <span className="text-xs opacity-50 ml-2">(edited)</span>
              )}
            </div>

            {/* TIME */}
            <p
              className={`text-xs mt-1 text-gray-400 ${isOwn ? "text-right" : "text-left"}`}
            >
              {new Date(msg.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
