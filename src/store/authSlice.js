import { createSlice } from "@reduxjs/toolkit";

function getStoredUser() {
  try {
    const stored = sessionStorage.getItem("chat_user");
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    if (parsed?.username && typeof parsed.username === "string") {
      return parsed;
    }
  } catch {
    return null;
  }

  return null;
}

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: getStoredUser(),
  },
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
    },
    clearUser(state) {
      state.user = null;
    },
  },
});

export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;
