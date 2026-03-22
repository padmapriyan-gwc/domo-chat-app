import { AppDBClient } from '@domoinc/toolkit';

const UsersClient = new AppDBClient.DocumentsClient('ChatUsers');
const MessagesClient = new AppDBClient.DocumentsClient('ChatMessages');

// ─── UTILS ────────────────────────────────────────────────────────────────────

const simpleHash = (str) =>
  Array.from(str)
    .reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 0)
    .toString(36);

// ─── AUTH APIs ────────────────────────────────────────────────────────────────

// POST → ChatUsers (create new user)
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

// GET → ChatUsers (find user + verify password)
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

// ─── MESSAGES APIs ─────────────────────────────────────────────────────────────

// GET → ChatMessages (fetch all messages for a room, sorted by time)
export const fetchMessagesAPI = async (roomId = 'general') => {
  const res = await MessagesClient.get({
    'content.roomId': { $eq: roomId },
  });

  return Array.isArray(res.data)
    ? res.data
        .map((doc) => ({ ...doc.content, id: doc.id }))
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    : [];
};

// POST → ChatMessages (send a new message)
export const sendMessageAPI = async ({ sender, message, roomId = 'general' }) => {
  const res = await MessagesClient.create({
    sender,
    message,
    timestamp: new Date().toISOString(),
    roomId,
  });

  return { id: res.data.id, ...res.data.content };
};

// DELETE → ChatMessages (delete a message by id)
export const deleteMessageAPI = async (id) => {
  await MessagesClient.delete([id]);
  return id;
};

// PUT → ChatMessages (edit an existing message - send FULL content)
export const editMessageAPI = async (id, newMessage, originalMsg) => {
  try {
    // Step 1: delete the old document
    await MessagesClient.delete([id]);

    // Step 2: recreate it with the new message + same metadata
    const res = await MessagesClient.create({
      sender: originalMsg.sender,
      message: newMessage,
      timestamp: originalMsg.timestamp, // keep original time so sort order stays
      roomId: originalMsg.roomId,
      edited: true,
    });

    console.log('Edit (delete+recreate) response:', res);
    return { id: res.data.id, ...res.data.content };
  } catch (err) {
    console.error('Edit failed:', err);
    throw err;
  }
};