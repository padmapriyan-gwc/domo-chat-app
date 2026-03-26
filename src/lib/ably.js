import Ably from 'ably';
import { ABLY_API_KEY } from '../constants';

let ablyInstance = null;
let currentClientId = null;
let publisherAblyInstance = null;

export const getAbly = (username) => {
  // Guard — never create a user-scoped client without a valid username.
  if (!username || typeof username !== "string") {
    console.warn("[Ably] getAbly called without valid username:", username);
    return null;
  }

  // If same user already connected — reuse
  if (ablyInstance && currentClientId === username) {
    return ablyInstance;
  }

  // Close old instance if user changed
  if (ablyInstance && currentClientId !== username) {
    try { ablyInstance.close(); 

    } 
    catch (err) {
      console.error('[Ably] Failed to close old instance:', err);
    }
    ablyInstance = null;
    currentClientId = null;
  }

  // Create new instance
  ablyInstance = new Ably.Realtime({
    key: ABLY_API_KEY,
    clientId: username,
    autoConnect: true,
  });

  currentClientId = username;
  return ablyInstance;
};

export const getAblyPublisher = () => {
  if (publisherAblyInstance) return publisherAblyInstance;

  // Dedicated publish-only client without user identity.
  publisherAblyInstance = new Ably.Realtime({
    key: ABLY_API_KEY,
    autoConnect: true,
  });

  return publisherAblyInstance;
};

export const getChannel = (roomId, username) => {
  const ably = getAbly(username);
  if (!ably) return null;
  return ably.channels.get(`room-${roomId}`);
};