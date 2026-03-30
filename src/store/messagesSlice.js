import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  byRoom: {},
  loadingByRoom: {},
  onlineByRoom: {},
  typingByRoom: {},
};

const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    setRoomLoading(state, action) {
      const { roomId, loading } = action.payload;
      state.loadingByRoom[roomId] = loading;
    },
    setRoomOnline(state, action) {
      const { roomId, online } = action.payload;
      state.onlineByRoom[roomId] = online;
    },
    setRoomMessages(state, action) {
      const { roomId, messages } = action.payload;
      state.byRoom[roomId] = messages;
    },
    addMessageIfMissing(state, action) {
      const { roomId, message } = action.payload;
      const roomMessages = state.byRoom[roomId] || [];
      const exists = roomMessages.some((item) => item.id === message.id);

      if (!exists) {
        state.byRoom[roomId] = [...roomMessages, message];
      }
    },
    replaceTempMessage(state, action) {
      const { roomId, tempId, message } = action.payload;
      const roomMessages = state.byRoom[roomId] || [];
      state.byRoom[roomId] = roomMessages.map((item) =>
        item.id === tempId ? message : item,
      );
    },
    removeMessage(state, action) {
      const { roomId, id } = action.payload;
      const roomMessages = state.byRoom[roomId] || [];
      state.byRoom[roomId] = roomMessages.filter((item) => item.id !== id);
    },
    updateMessage(state, action) {
      const { roomId, oldId, message } = action.payload;
      const roomMessages = state.byRoom[roomId] || [];
      state.byRoom[roomId] = roomMessages.map((item) =>
        item.id === oldId ? { ...item, ...message } : item,
      );
    },
    addTypingUser(state, action) {
      const { roomId, username } = action.payload;
      const typingUsers = state.typingByRoom[roomId] || [];

      if (!typingUsers.includes(username)) {
        state.typingByRoom[roomId] = [...typingUsers, username];
      }
    },
    removeTypingUser(state, action) {
      const { roomId, username } = action.payload;
      const typingUsers = state.typingByRoom[roomId] || [];
      state.typingByRoom[roomId] = typingUsers.filter((item) => item !== username);
    },
    clearTypingUsers(state, action) {
      state.typingByRoom[action.payload] = [];
    },
    resetMessagesState() {
      return initialState;
    },
  },
});

export const {
  setRoomLoading,
  setRoomOnline,
  setRoomMessages,
  addMessageIfMissing,
  replaceTempMessage,
  removeMessage,
  updateMessage,
  addTypingUser,
  removeTypingUser,
  clearTypingUsers,
  resetMessagesState,
} = messagesSlice.actions;

export default messagesSlice.reducer;
