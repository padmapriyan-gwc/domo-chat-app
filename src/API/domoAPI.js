import { AppDBClient } from '@domoinc/toolkit';

const UsersClient   = new AppDBClient.DocumentsClient('ChatUsers');
const MessagesClient = new AppDBClient.DocumentsClient('ChatMessages');
const RoomsClient   = new AppDBClient.DocumentsClient('ChatRooms');

const simpleHash = (str) =>
  Array.from(str)
    .reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 0)
    .toString(36);

// ─── AUTH ─────────────────────────────────────────────────────────────────────

export const signupAPI = async (username, password) => {
  const existing = await UsersClient.get({
    'content.username': { $eq: username },
  });
  if (existing.data?.length > 0) throw new Error('Username already taken');

  const res = await UsersClient.create({
    username,
    passwordHash: simpleHash(password),
    createdAt: new Date().toISOString(),
  });
  return { id: res.data.id, username };
};

export const loginAPI = async (username, password) => {
  const res = await UsersClient.get({
    'content.username': { $eq: username },
  });
  const users = res.data || [];
  if (users.length === 0) throw new Error('User not found');
  const user = users[0];
  if (user.content.passwordHash !== simpleHash(password))
    throw new Error('Incorrect password');
  return { id: user.id, username: user.content.username };
};

// ─── USERS ────────────────────────────────────────────────────────────────────

export const fetchUsersAPI = async () => {
  const res = await UsersClient.get({});
  return (res.data || []).map(doc => ({
    id: doc.id,
    username: doc.content.username,
  }));
};

// ─── ROOMS ────────────────────────────────────────────────────────────────────

export const fetchRoomsAPI = async (username) => {
  const res = await RoomsClient.get({});
  return (res.data || [])
    .map(doc => ({
      ...doc.content,
      id: doc.id,
      members: JSON.parse(doc.content.members || '[]'),
    }))
    .filter(room => room.members.includes(username));
};

export const createDMAPI = async (userA, userB) => {
  const roomName = [userA, userB].sort().join('_dm_');
  const existing = await RoomsClient.get({
    'content.name': { $eq: roomName },
  });
  if (existing.data?.length > 0) {
    const doc = existing.data[0];
    return {
      ...doc.content,
      id: doc.id,
      members: JSON.parse(doc.content.members || '[]'),
    };
  }
  const res = await RoomsClient.create({
    name: roomName,
    type: 'dm',
    members: JSON.stringify([userA, userB]),
    createdBy: userA,
    createdAt: new Date().toISOString(),
  });
  return {
    ...res.data.content,
    id: res.data.id,
    members: [userA, userB],
  };
};

export const createGroupAPI = async (groupName, members, createdBy) => {
  const res = await RoomsClient.create({
    name: groupName,
    type: 'group',
    members: JSON.stringify(members),
    createdBy,
    createdAt: new Date().toISOString(),
  });
  return {
    ...res.data.content,
    id: res.data.id,
    members,
  };
};

// ─── MESSAGES ─────────────────────────────────────────────────────────────────

export const fetchMessagesAPI = async (roomId) => {
  const res = await MessagesClient.get({
    'content.roomId': { $eq: roomId },
  });
  return Array.isArray(res.data)
    ? res.data
        .map(doc => ({ ...doc.content, id: doc.id }))
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    : [];
};

export const sendMessageAPI = async ({ sender, message, roomId }) => {
  const res = await MessagesClient.create({
    sender,
    message,
    timestamp: new Date().toISOString(),
    roomId,
    edited: 'false',
  });
  return { id: res.data.id, ...res.data.content };
};

export const deleteMessageAPI = async (id) => {
  await MessagesClient.delete([id]);
  return id;
};

export const editMessageAPI = async (id, newMessage, originalMsg) => {
  try {
    await MessagesClient.delete([id]);
    const res = await MessagesClient.create({
      sender: originalMsg.sender,
      message: newMessage,
      timestamp: originalMsg.timestamp,
      roomId: originalMsg.roomId,
      edited: 'true',
    });
    return { id: res.data.id, ...res.data.content };
  } catch (err) {
    console.error('Edit failed:', err);
    throw err;
  }
};