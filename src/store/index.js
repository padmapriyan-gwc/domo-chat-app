import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import messagesReducer from "./messagesSlice";
import presenceReducer from "./presenceSlice";
import roomsReducer from "./roomsSlice";
import uiReducer from "./uiSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    rooms: roomsReducer,
    messages: messagesReducer,
    presence: presenceReducer,
    ui: uiReducer,
  },
});
