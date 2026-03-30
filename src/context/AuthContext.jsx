import React, { createContext, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearUser, setUser } from "../store/authSlice";
import { resetMessagesState } from "../store/messagesSlice";
import { resetPresenceState } from "../store/presenceSlice";
import { resetRoomsState } from "../store/roomsSlice";
import { resetUiState } from "../store/uiSlice";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const login = (userData) => {
    sessionStorage.setItem("chat_user", JSON.stringify(userData));
    dispatch(setUser(userData));
  };

  const logout = () => {
    localStorage.removeItem("chat_user");
    sessionStorage.removeItem("chat_user");
    dispatch(clearUser());
    dispatch(resetRoomsState());
    dispatch(resetMessagesState());
    dispatch(resetPresenceState());
    dispatch(resetUiState());
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
