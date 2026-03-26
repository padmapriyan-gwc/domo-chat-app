import Ably from 'ably';
import { ABLY_API_KEY } from '../constants';

let ablyInstance = null;
let currentClientId = null;

export const getAbly = (username) => {
  // Guard — never create Ably with undefined/null clientId
  if (!username || typeof username !== 'string') {
    console.warn('[Ably] getAbly called without valid username:', username);
    return null;
  }

  // If same user already connected — reuse
  if (ablyInstance && currentClientId === username) {
    return ablyInstance;
  }

  // Close old instance if user changed
  if (ablyInstance && currentClientId !== username) {
    try { 
      ablyInstance.close();
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

export const getChannel = (roomId, username) => {
  const ably = getAbly(username);
  if (!ably) return null;
  return ably.channels.get(`room-${roomId}`);
};