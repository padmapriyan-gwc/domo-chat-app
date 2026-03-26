import React, { useState, useEffect } from "react";
import { ChatService } from "../../services/chatService";
import { useAuth } from "../../context/AuthContext";
import { getUserColor } from "../../utils/helpers";

export function GroupMembersModal({ room, onClose, onUpdated }) {
  const { user } = useAuth();
  const [allUsers, setAllUsers] = useState([]);
  const [members, setMembers] = useState(room.members || []);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("members"); // members | add

  const isCreator = room.createdBy === user.username;

  useEffect(() => {
    ChatService.fetchUsers().then((users) => {
      setAllUsers(users.filter((u) => u.username !== user.username));
      setLoading(false);
    });
  }, []);

  const handleRemove = (username) => {
    if (username === room.createdBy) return; // can't remove creator
    setMembers((prev) => prev.filter((m) => m !== username));
  };

  const handleAdd = (username) => {
    if (members.includes(username)) return;
    setMembers((prev) => [...prev, username]);
  };

const handleSave = async () => {
  if (members.length < 2) {
    return setError("Group must have at least 2 members");
  }
  setSaving(true);
  setError("");
  try {
    const updated = await ChatService.updateGroupMembers(
      room.id,
      room.name,
      room.members,
      members,
    );

    // ✅ Make sure updated room keeps the same id
    // Merge to be safe — don't replace the whole room object
    onUpdated({ ...room, ...updated, id: room.id });
    onClose();
  } catch (e) {
    setError(e.message || "Failed to update group");
  } finally {
    setSaving(false);
  }
};

  const nonMembers = allUsers.filter(
    (u) =>
      !members.includes(u.username) &&
      u.username.toLowerCase().includes(search.toLowerCase()),
  );

  const filteredMembers = members.filter((m) =>
    m.toLowerCase().includes(search.toLowerCase()),
  );

  const hasChanges =
    JSON.stringify([...members].sort()) !==
    JSON.stringify([...room.members].sort());

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center
                    justify-center z-50 p-4"
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm
                      flex flex-col overflow-hidden"
        style={{ maxHeight: "85vh" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4
                        border-b border-gray-100"
        >
          <div>
            <h2 className="font-bold text-gray-900 text-base">{room.name}</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {members.length} members
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center
                       text-gray-400 hover:text-gray-600
                       hover:bg-gray-100 rounded-lg transition-all"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-2 border-b border-gray-100">
          {[
            { id: "members", label: `Members (${members.length})` },
            { id: "add", label: "Add people" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSearch("");
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold
                          transition-all
                          ${
                            activeTab === tab.id
                              ? "text-white"
                              : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                          }`}
              style={
                activeTab === tab.id
                  ? { background: "linear-gradient(135deg, #7c3aed, #a855f7)" }
                  : {}
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="px-4 pt-3 pb-2">
          <input
            className="w-full px-4 py-2 rounded-xl bg-gray-100 text-sm
                       text-gray-700 placeholder-gray-400 focus:outline-none
                       focus:ring-2 focus:ring-purple-300/50 focus:bg-white
                       border border-transparent focus:border-purple-200
                       transition-all"
            placeholder={
              activeTab === "members"
                ? "Search members..."
                : "Search users to add..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {/* Members tab */}
          {activeTab === "members" && (
            <div>
              {filteredMembers.length === 0 ? (
                <p className="text-center text-gray-400 text-xs py-6">
                  No members found
                </p>
              ) : (
                filteredMembers.map((memberName) => {
                  const { bg } = getUserColor(memberName);
                  const isCurrentUser = memberName === user.username;
                  const isCreatorMember = memberName === room.createdBy;

                  return (
                    <div
                      key={memberName}
                      className="flex items-center gap-3 px-3 py-2.5
                                 rounded-xl hover:bg-gray-50 transition-all"
                    >
                      {/* Avatar */}
                      <div
                        className={`w-9 h-9 rounded-full flex items-center
                                       justify-center text-sm font-bold
                                       text-white flex-shrink-0 ${bg}`}
                      >
                        {memberName[0]?.toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {memberName}
                          {isCurrentUser && (
                            <span className="text-gray-400 font-normal ml-1">
                              (you)
                            </span>
                          )}
                        </p>
                        {isCreatorMember && (
                          <p className="text-xs text-purple-500 font-medium">
                            Admin
                          </p>
                        )}
                      </div>

                      {/* Remove button */}
                      {/* Remove button */}
                      {!isCreatorMember && !isCurrentUser && (
                        <button
                          onClick={() =>
                            isCreator ? handleRemove(memberName) : null
                          }
                          disabled={!isCreator}
                          title={
                            !isCreator
                              ? "Only admin can remove members"
                              : "Remove member"
                          }
                          className={`w-7 h-7 flex items-center justify-center
               rounded-lg transition-all flex-shrink-0 text-lg
               ${
                 isCreator
                   ? "text-gray-300 hover:text-red-500 hover:bg-red-50"
                   : "text-gray-200 cursor-not-allowed"
               }`}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Add people tab */}
          {activeTab === "add" && (
            <div>
              {loading ? (
                <p className="text-center text-gray-400 text-xs py-6">
                  Loading users...
                </p>
              ) : nonMembers.length === 0 ? (
                <p className="text-center text-gray-400 text-xs py-6">
                  {search ? "No users found" : "All users are already members"}
                </p>
              ) : (
                nonMembers.map((u) => {
                  const { bg } = getUserColor(u.username);
                  return (
                    <div
                      key={u.id}
                      className="flex items-center gap-3 px-3 py-2.5
                                 rounded-xl hover:bg-gray-50 transition-all"
                    >
                      <div
                        className={`w-9 h-9 rounded-full flex items-center
                                       justify-center text-sm font-bold
                                       text-white flex-shrink-0 ${bg}`}
                      >
                        {u.username[0]?.toUpperCase()}
                      </div>

                      <span
                        className="flex-1 text-sm font-semibold
                                       text-gray-800 truncate"
                      >
                        {u.username}
                      </span>

                      <button
                        onClick={() => handleAdd(u.username)}
                        className="flex-shrink-0 text-xs font-semibold
                                   text-white px-3 py-1.5 rounded-lg
                                   transition-all hover:opacity-90
                                   active:scale-95"
                        style={{
                          background:
                            "linear-gradient(135deg, #7c3aed, #a855f7)",
                        }}
                      >
                        Add
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 pb-4 pt-2 border-t border-gray-100">
          {error && (
            <p className="text-red-500 text-xs mb-2 text-center">{error}</p>
          )}

          {/* Pending changes preview */}
          {hasChanges && (
            <div
              className="mb-3 px-3 py-2 rounded-xl bg-purple-50
                            border border-purple-100"
            >
              <p className="text-xs text-purple-600 font-medium">
                Unsaved changes — {members.length} members
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold
                         text-gray-500 bg-gray-100 hover:bg-gray-200
                         transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold
                         text-white transition-all hover:opacity-90
                         active:scale-[0.98] disabled:opacity-40
                         disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #a855f7)",
              }}
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
