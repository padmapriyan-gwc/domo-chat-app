import domo from "ryuu.js";

// ─── CONFIG ──────────────────────────────────────────────────────────────────

const BASE_URL = "/domo/datastores/v1";

const COLLECTIONS = {
  USERS: "ChatUsers",
  ROOMS: "ChatRooms",
  MESSAGES: "ChatMessages",
};

// ─── HASH HELPER ─────────────────────────────────────────────────────────────

const simpleHash = (str) =>
  Array.from(str)
    .reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 0)
    .toString(36);

// ─── REUSABLE DATASTORE HELPERS ───────────────────────────────────────────────
//
//  These wrap the raw domo calls so the rest of the file reads like plain
//  English and every collection is accessed the same way.
//
//  createDoc    → POST   .../documents/
//  listDocs     → GET    .../documents/
//  queryDocs    → POST   .../documents/query   (filter by field)
//  deleteDoc    → DELETE .../documents/bulk?ids=<id>

const collectionURL = (collection) =>
  `${BASE_URL}/collections/${collection}/documents`;

const createDoc = (collection, content) =>
  domo
    .post(`${collectionURL(collection)}/`, { content })
    .catch((err) => {
      console.error(`[createDoc:${collection}]`, err);
      throw err;
    });

const listDocs = (collection) =>
  domo
    .get(`${collectionURL(collection)}/`)
    .catch((err) => {
      console.error(`[listDocs:${collection}]`, err);
      throw err;
    });

const queryDocs = (collection, filter) =>
  domo
    .post(`${collectionURL(collection)}/query`, filter)
    .catch((err) => {
      console.error(`[queryDocs:${collection}]`, err);
      throw err;
    });

const deleteDoc = (collection, id) =>
  domo
    .delete(`${collectionURL(collection)}/bulk?ids=${id}`)
    .catch((err) => {
      console.error(`[deleteDoc:${collection}]`, err);
      throw err;
    });

// ─── REUSABLE SHAPE BUILDERS ──────────────────────────────────────────────────
//
//  These convert raw Domo document responses into the clean shapes
//  the rest of the app consumes.
//

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
  queryDocs(COLLECTIONS.USERS, { "content.username": { $eq: username } })
    .then((users) => {
      if (!users?.length) throw new Error("User not found");
      const user = users[0];
      if (user.content.passwordHash !== simpleHash(password))
        throw new Error("Incorrect password");
      return toUser(user);
    });

// ─── USERS ───────────────────────────────────────────────────────────────────

export const fetchUsersAPI = () =>
  listDocs(COLLECTIONS.USERS)
    .then((res) => (res || []).map(toUser));

// ─── ROOMS ───────────────────────────────────────────────────────────────────

export const fetchRoomsAPI = (username) =>
  listDocs(COLLECTIONS.ROOMS)
    .then((res) =>
      (res || [])
        .map(toRoom)
        .filter((room) => room.members.includes(username))
    );

export const createDMAPI = (userA, userB) => {
  const roomName = [userA, userB].sort().join("_dm_");

  return queryDocs(COLLECTIONS.ROOMS, { "content.name": { $eq: roomName } })
    .then((existing) => {
      // DM already exists — return it as-is
      if (existing?.length > 0) return toRoom(existing[0]);

      // Create a new DM room
      return createDoc(COLLECTIONS.ROOMS, {
        name: roomName,
        type: "dm",
        members: JSON.stringify([userA, userB]),
        createdBy: userA,
        createdAt: new Date().toISOString(),
      }).then((res) => ({ ...toRoom(res), members: [userA, userB] }));
    });
};

export const createGroupAPI = (groupName, members, createdBy) =>
  createDoc(COLLECTIONS.ROOMS, {
    name: groupName,
    type: "group",
    members: JSON.stringify(members),
    createdBy,
    createdAt: new Date().toISOString(),
  }).then((res) => ({ ...toRoom(res), members }));

// ─── MESSAGES ────────────────────────────────────────────────────────────────

export const fetchMessagesAPI = (roomId) =>
  queryDocs(COLLECTIONS.MESSAGES, { "content.roomId": { $eq: roomId } })
    .then((res) =>
      Array.isArray(res)
        ? res
            .map(toMessage)
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
        : []
    );

export const sendMessageAPI = ({ sender, message, roomId }) =>
  createDoc(COLLECTIONS.MESSAGES, {
    sender,
    message,
    timestamp: new Date().toISOString(),
    roomId,
    edited: "false",
  }).then(toMessage);

export const deleteMessageAPI = (id) =>
  deleteDoc(COLLECTIONS.MESSAGES, id).then(() => id);

export const editMessageAPI = (id, newMessage, originalMsg) =>
  deleteDoc(COLLECTIONS.MESSAGES, id)
    .then(() =>
      createDoc(COLLECTIONS.MESSAGES, {
        sender: originalMsg.sender,
        message: newMessage,
        timestamp: originalMsg.timestamp,
        roomId: originalMsg.roomId,
        edited: "true",
      })
    )
    .then(toMessage)
    .catch((err) => {
      console.error("Edit failed:", err);
      throw err;
    });