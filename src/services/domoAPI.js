import domo from "ryuu.js";
import { getAblyPublisher } from "../lib/ably";

const BASE_URL = "/domo/datastores/v1";

const COLLECTIONS = {
  USERS: "ChatUsers",
  ROOMS: "ChatRooms",
  MESSAGES: "ChatMessages",
};

const simpleHash = (str) =>
  Array.from(str)
    .reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 0)
    .toString(36);

const collectionURL = (collection) =>
  `${BASE_URL}/collections/${collection}/documents`;

const createDoc = (collection, content) =>
  domo.post(`${collectionURL(collection)}/`, { content }).catch((err) => {
    console.error(`[createDoc:${collection}]`, err);
    throw err;
  });

const listDocs = (collection) =>
  domo.get(`${collectionURL(collection)}/`).catch((err) => {
    console.error(`[listDocs:${collection}]`, err);
    throw err;
  });

const queryDocs = (collection, filter) =>
  domo.post(`${collectionURL(collection)}/query`, filter).catch((err) => {
    console.error(`[queryDocs:${collection}]`, err);
    throw err;
  });

const deleteDoc = (collection, id) =>
  domo.delete(`${collectionURL(collection)}/bulk?ids=${id}`).catch((err) => {
    console.error(`[deleteDoc:${collection}]`, err);
    throw err;
  });

const updateDoc = (collection, id, content) =>
  domo
    .put(`${collectionURL(collection)}/${id}`, { content })
    .catch((err) => {
      console.error(`[updateDoc:${collection}:${id}]`, err);
      throw err;
    });

const toUser = (doc) => ({
  id: doc.id,
  username: doc.content.username,
});

const toRoom = (doc) => ({
  ...doc.content,
  id: doc.id,
  members: JSON.parse(doc.content.members || "[]"),
});

const toMessage = (doc) => ({
  ...doc.content,
  id: doc.id,
});

// ─── ABLY HELPERS ────────────────────────────────────────────────────────────

const publishToRoom = (roomId, event, data) => {
  try {
    getAblyPublisher().channels.get(`room-${roomId}`).publish(event, data);
  } catch (err) {
    console.error(`[publishToRoom:${roomId}:${event}]`, err);
  }
};

const publishToUsers = (usernames, event, data) => {
  try {
    const ably = getAblyPublisher();
    usernames.forEach((username) => {
      ably.channels.get(`user-${username}`).publish(event, data);
    });
  } catch (err) {
    console.error(`[publishToUsers:${event}]`, err);
  }
};

// ─── AUTH ─────────────────────────────────────────────────────────────────────

export const signupAPI = (username, password) =>
  queryDocs(COLLECTIONS.USERS, { "content.username": { $eq: username } })
    .then((existing) => {
      if (existing?.length > 0) throw new Error("Username already taken");
      return createDoc(COLLECTIONS.USERS, {
        username,
        passwordHash: simpleHash(password),
        createdAt: new Date().toISOString(),
      });
    })
    .then((res) => ({ id: res.id, username }));

export const loginAPI = (username, password) =>
  queryDocs(COLLECTIONS.USERS, { "content.username": { $eq: username } }).then(
    (users) => {
      if (!users?.length) throw new Error("User not found");
      const user = users[0];
      if (user.content.passwordHash !== simpleHash(password))
        throw new Error("Incorrect password");
      return toUser(user);
    },
  );

// ─── USERS ───────────────────────────────────────────────────────────────────

export const fetchUsersAPI = () =>
  listDocs(COLLECTIONS.USERS).then((res) => (res || []).map(toUser));

// ─── ROOMS ───────────────────────────────────────────────────────────────────

export const fetchRoomsAPI = (username) =>
  listDocs(COLLECTIONS.ROOMS).then((res) =>
    (res || []).map(toRoom).filter((room) => room.members.includes(username)),
  );

export const createDMAPI = (userA, userB) => {
  const roomName = [userA, userB].sort().join("_dm_");

  return queryDocs(COLLECTIONS.ROOMS, {
    "content.name": { $eq: roomName },
  }).then((existing) => {
    if (existing?.length > 0) return toRoom(existing[0]);

    return createDoc(COLLECTIONS.ROOMS, {
      name: roomName,
      type: "dm",
      members: JSON.stringify([userA, userB]),
      createdBy: userA,
      createdAt: new Date().toISOString(),
    }).then((res) => {
      const room = { ...toRoom(res), members: [userA, userB] };
      publishToUsers([userA, userB], "new-room", room);
      return room;
    });
  });
};

export const createGroupAPI = (groupName, members, createdBy) =>
  createDoc(COLLECTIONS.ROOMS, {
    name: groupName,
    type: "group",
    members: JSON.stringify(members),
    createdBy,
    createdAt: new Date().toISOString(),
  }).then((res) => {
    const room = { ...toRoom(res), members };
    publishToUsers(members, "new-room", room);
    return room;
  });

// ─── MESSAGES ────────────────────────────────────────────────────────────────

export const fetchMessagesAPI = (roomId) =>
  queryDocs(COLLECTIONS.MESSAGES, { "content.roomId": { $eq: roomId } }).then(
    (res) =>
      Array.isArray(res)
        ? res
            .map(toMessage)
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
        : [],
  );

export const sendMessageAPI = ({ sender, message, roomId }) =>
  createDoc(COLLECTIONS.MESSAGES, {
    sender,
    message,
    timestamp: new Date().toISOString(),
    roomId,
    edited: "false",
  })
    .then(toMessage)
    .then((saved) => {
      publishToRoom(roomId, "new-message", saved);
      return saved;
    });

// roomId is required so Ably can notify the correct channel
export const deleteMessageAPI = (id, roomId) =>
  deleteDoc(COLLECTIONS.MESSAGES, id).then(() => {
    publishToRoom(roomId, "delete-message", { id });
    return id;
  });

export const editMessageAPI = (id, newMessage, originalMsg) =>
  deleteDoc(COLLECTIONS.MESSAGES, id)
    .then(() =>
      createDoc(COLLECTIONS.MESSAGES, {
        sender: originalMsg.sender,
        message: newMessage,
        timestamp: originalMsg.timestamp,
        roomId: originalMsg.roomId,
        edited: "true",
      }),
    )
    .then(toMessage)
    .then((saved) => {
      // Send oldId so other users can find and replace the correct message
      publishToRoom(originalMsg.roomId, "edit-message", {
        oldId: id, // ← the id other users have in their state
        newId: saved.id, // ← the new id after recreate
        ...saved,
      });
      return saved;
    })
    .catch((err) => {
      console.error("Edit failed:", err);
      throw err;
    });

// ─── GROUP CHAT UPDATES ────────────────────────────────────────────────────────────────

export const addGroupMemberAPI = async (roomId, newMember, currentMembers) => {
  if (currentMembers.includes(newMember))
    throw new Error(`${newMember} is already in this group`);

  const updatedMembers = [...currentMembers, newMember];
  const rooms = await listDocs(COLLECTIONS.ROOMS);
  const roomDoc = (rooms || []).find((doc) => doc.id === roomId);
  if (!roomDoc) throw new Error("Group not found");

  const nextContent = {
    ...roomDoc.content,
    members: JSON.stringify(updatedMembers),
    updatedAt: new Date().toISOString(),
  };

  await updateDoc(COLLECTIONS.ROOMS, roomId, nextContent);
  const room = { ...toRoom({ id: roomId, content: nextContent }), members: updatedMembers };
  publishToUsers(updatedMembers, "room-updated", room);
  return room;
};

export const updateGroupMembersAPI = async (
  roomId,
  roomName,
  members,
  updatedMembers,
) => {
  const rooms = await listDocs(COLLECTIONS.ROOMS);
  const roomDoc = (rooms || []).find((doc) => doc.id === roomId);
  if (!roomDoc) throw new Error("Group not found");

  const nextContent = {
    ...roomDoc.content,
    name: roomName || roomDoc.content.name,
    type: "group",
    members: JSON.stringify(updatedMembers),
    updatedAt: new Date().toISOString(),
  };

  await updateDoc(COLLECTIONS.ROOMS, roomId, nextContent);
  const room = { ...toRoom({ id: roomId, content: nextContent }), members: updatedMembers };

  // Notify all old + new members
  const allAffected = [...new Set([...members, ...updatedMembers])];
  publishToUsers(allAffected, "room-updated", room);

  return room;
};
