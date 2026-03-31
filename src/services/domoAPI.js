import domo from "ryuu.js";
import { getAblyPublisher } from "../lib/ably";
import { encryptMessage, decryptMessage } from "../utils/encryption";
import { uploadFileToDomo, deleteDomoFile } from "./domoFileAPI";

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
  domo.put(`${collectionURL(collection)}/${id}`, { content }).catch((err) => {
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
    async (res) => {
      if (!Array.isArray(res)) return [];

      const messages = res
        .map(toMessage)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      // Decrypt all messages in parallel
      const decrypted = await Promise.all(
        messages.map(async (msg) => {
          if (msg.type === "file") return msg; // don't decrypt file messages
          try {
            const plain = await decryptMessage(msg.message);
            return { ...msg, message: plain };
          } catch {
            return { ...msg, message: "[Encrypted message]" };
          }
        }),
      );

      return decrypted;
    },
  );

// export const sendMessageAPI = async ({ sender, message, roomId, type = 'text', fileData = null }) => {
//   // Encrypt text messages only
//   const encryptedMessage = type === 'text'
//     ? await encryptMessage(message)
//     : message; // file names not encrypted (only metadata)

//   const content = {
//     sender,
//     message: encryptedMessage,
//     timestamp: new Date().toISOString(),
//     roomId,
//     edited: 'false',
//     type, // 'text' or 'file'
//     ...(fileData && {
//       fileName:     fileData.fileName,
//       fileSize:     fileData.fileSize,
//       fileType:     fileData.fileType,
//       fileData:     fileData.base64,   // base64 encoded file
//     }),
//   };

//   const res  = await createDoc(COLLECTIONS.MESSAGES, content);
//   const saved = toMessage(res);

//   // Publish decrypted version to Ably
//   // (so recipients see plain text instantly without re-fetching)
//   publishToRoom(roomId, 'new-message', {
//     ...saved,
//     message, // plain text for Ably real-time
//   });

//   return { ...saved, message }; // return plain text to sender too
// };

// roomId is required so Ably can notify the correct channel

export const sendMessageAPI = async ({
  sender,
  message,
  roomId,
  type = "text",
  file = null, // raw File object — NOT base64
}) => {
  let fileMetadata = null;

  // If file message — upload to Domo file storage first
  if (type === "file" && file) {
    fileMetadata = await uploadFileToDomo(file);
  }

  // Encrypt text messages only
  const encryptedMessage =
    type === "text" ? await encryptMessage(message) : file?.name || message;

  const content = {
    sender,
    message: encryptedMessage,
    timestamp: new Date().toISOString(),
    roomId,
    edited: "false",
    type,
    // Store only fileId + metadata — NOT the file itself
    ...(fileMetadata && {
      fileId: fileMetadata.fileId,
      fileName: fileMetadata.fileName,
      fileSize: fileMetadata.fileSize,
      fileType: fileMetadata.fileType,
    }),
  };

  const res = await createDoc(COLLECTIONS.MESSAGES, content);
  const saved = toMessage(res);

  // Publish plain text to Ably for real-time delivery
  publishToRoom(roomId, "new-message", {
    ...saved,
    message: type === "text" ? message : file?.name || message,
  });

  return {
    ...saved,
    message: type === "text" ? message : file?.name || message,
  };
};

// export const deleteMessageAPI = (id, roomId) =>
//   deleteDoc(COLLECTIONS.MESSAGES, id).then(() => {
//     publishToRoom(roomId, "delete-message", { id });
//     return id;
//   });

// Delete a file from Domo storage

export const deleteMessageAPI = (id, roomId, fileId = null) =>
  deleteDoc(COLLECTIONS.MESSAGES, id).then(() => {
    // Also delete the file from Domo storage if exists
    if (fileId) deleteDomoFile(fileId);
    publishToRoom(roomId, "delete-message", { id });
    return id;
  });

export const editMessageAPI = (id, newMessage, originalMsg) =>
  deleteDoc(COLLECTIONS.MESSAGES, id)
    .then(() => encryptMessage(newMessage)) // encrypt edited message
    .then((encryptedMessage) =>
      createDoc(COLLECTIONS.MESSAGES, {
        sender: originalMsg.sender,
        message: encryptedMessage,
        timestamp: originalMsg.timestamp,
        roomId: originalMsg.roomId,
        edited: "true",
        type: "text",
      }),
    )
    .then(toMessage)
    .then(async (saved) => {
      publishToRoom(originalMsg.roomId, "edit-message", {
        oldId: id,
        ...saved,
        message: newMessage, // plain text over Ably
      });
      return { ...saved, message: newMessage };
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
  const room = {
    ...toRoom({ id: roomId, content: nextContent }),
    members: updatedMembers,
  };
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
  const room = {
    ...toRoom({ id: roomId, content: nextContent }),
    members: updatedMembers,
  };

  // Notify all old + new members
  const allAffected = [...new Set([...members, ...updatedMembers])];
  publishToUsers(allAffected, "room-updated", room);

  return room;
};
