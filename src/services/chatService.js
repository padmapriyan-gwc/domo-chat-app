import { AppDBClient } from "@domoinc/toolkit";

const MessagesClient = new AppDBClient.DocumentsClient("ChatMessages");

export const ChatService = {
  fetchMessages: async (roomId = "general") => {
    const res = await MessagesClient.get({ "content.roomId": { $eq: roomId } });
    return Array.isArray(res.data)
      ? res.data
          .map((doc) => ({ ...doc.content, id: doc.id }))
          .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      : [];
  },

  sendMessage: async (msg) => {
    const res = await MessagesClient.create(msg);
    return { id: res.data.id, ...res.data.content };
  },
};
