import Ably from 'ably';
import { ABLY_API_KEY } from '../constants';

let ablyInstance = null;

export const getAbly = (username) => {
  if (!ablyInstance) {
    ablyInstance = new Ably.Realtime({
      key: ABLY_API_KEY,
      clientId: username,
      autoConnect: true,
    });
  }
  return ablyInstance;
};

export function getChannel(roomId, username) {
  const ably = getAbly(username);
  return ably.channels.get(`room-${roomId}`);
}