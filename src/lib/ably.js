import Ably from 'ably';
import { ABLY_API_KEY } from '../constants';

let ablyInstance = null;

export const getAbly = () => {
  if (!ablyInstance) {
    ablyInstance = new Ably.Realtime({
      key: ABLY_API_KEY,
      autoConnect: true,
    });
  }
  return ablyInstance;
};

export const getChannel = (roomId) => {
  return getAbly().channels.get(`room-${roomId}`);
};