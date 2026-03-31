import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ChatService } from "../services/chatService";
import { getChannel } from "../lib/ably";
import { playNotificationSound } from "../utils/helpers";
import {
  addMessageIfMissing,
  addTypingUser,
  clearTypingUsers,
  removeMessage,
  removeTypingUser,
  replaceTempMessage,
  setRoomLoading,
  setRoomMessages,
  setRoomOnline,
  updateMessage,
} from "../store/messagesSlice";

export function useMessages(roomId, currentUser) {
  const dispatch = useDispatch();
  const messages = useSelector((state) => state.messages.byRoom[roomId] || []);
  const loading = useSelector(
    (state) => state.messages.loadingByRoom[roomId] ?? true,
  );
  const online = useSelector(
    (state) => state.messages.onlineByRoom[roomId] ?? true,
  );
  const typingUsers = useSelector(
    (state) => state.messages.typingByRoom[roomId] || [],
  );

  const channelRef = useRef(null);
  const typingTimeouts = useRef({});
  const handlersRef = useRef({});

  const unsubscribeAbly = () => {
    if (channelRef.current) {
      const handlers = handlersRef.current;
      if (handlers.newMessage) {
        channelRef.current.unsubscribe("new-message", handlers.newMessage);
      }
      if (handlers.deleteMessage) {
        channelRef.current.unsubscribe(
          "delete-message",
          handlers.deleteMessage,
        );
      }
      if (handlers.editMessage) {
        channelRef.current.unsubscribe("edit-message", handlers.editMessage);
      }
      if (handlers.typing) {
        channelRef.current.unsubscribe("typing", handlers.typing);
      }
      channelRef.current = null;
      handlersRef.current = {};
    }
    Object.values(typingTimeouts.current).forEach(clearTimeout);
    typingTimeouts.current = {};
  };

  useEffect(() => {
    if (!roomId || !currentUser) return;

    const loadHistory = async () => {
      try {
        const data = await ChatService.fetchMessages(roomId);
        dispatch(setRoomMessages({ roomId, messages: data }));
        dispatch(setRoomOnline({ roomId, online: true }));
      } catch {
        dispatch(setRoomOnline({ roomId, online: false }));
      } finally {
        dispatch(setRoomLoading({ roomId, loading: false }));
      }
    };

    const subscribeAbly = () => {
      if (channelRef.current) return;

      const channel = getChannel(roomId, currentUser);
      if (!channel) return;

      channelRef.current = channel;

      const handleNewMessage = (ablyMsg) => {
        const incoming = ablyMsg.data;

        if (incoming.sender !== currentUser) {
          playNotificationSound();
        }

        dispatch(addMessageIfMissing({ roomId, message: incoming }));
      };
      channel.subscribe("new-message", handleNewMessage);

      const handleDeleteMessage = (ablyMsg) => {
        const { id } = ablyMsg.data;
        dispatch(removeMessage({ roomId, id }));
      };
      channel.subscribe("delete-message", handleDeleteMessage);

      const handleEditMessage = (ablyMsg) => {
        const { oldId, ...updated } = ablyMsg.data;
        dispatch(updateMessage({ roomId, oldId, message: updated }));
      };
      channel.subscribe("edit-message", handleEditMessage);

      const handleTyping = (ablyMsg) => {
        const { username } = ablyMsg.data;
        if (username === currentUser) return;

        dispatch(addTypingUser({ roomId, username }));

        if (typingTimeouts.current[username]) {
          clearTimeout(typingTimeouts.current[username]);
        }

        typingTimeouts.current[username] = setTimeout(() => {
          dispatch(removeTypingUser({ roomId, username }));
          delete typingTimeouts.current[username];
        }, 3000);
      };
      channel.subscribe("typing", handleTyping);

      handlersRef.current = {
        newMessage: handleNewMessage,
        deleteMessage: handleDeleteMessage,
        editMessage: handleEditMessage,
        typing: handleTyping,
      };
    };

    dispatch(setRoomLoading({ roomId, loading: true }));
    dispatch(clearTypingUsers(roomId));

    loadHistory();
    subscribeAbly();

    return () => {
      unsubscribeAbly();
    };
  }, [roomId, currentUser, dispatch]);

  // const sendMessage = async (text, sender, options = {}) => {
  //   const { type = "text", fileData = null } = options;

  //   const msg = {
  //     sender,
  //     message: type === "file" ? fileData.fileName : text,
  //     timestamp: new Date().toISOString(),
  //     roomId,
  //     type,
  //     ...(fileData && {
  //       fileName: fileData.fileName,
  //       fileSize: fileData.fileSize,
  //       fileType: fileData.fileType,
  //       fileData: fileData.base64,
  //     }),
  //   };

  //   const temp = { ...msg, id: `temp-${Date.now()}` };
  //   dispatch(addMessageIfMissing({ roomId, message: temp }));

  //   const saved = await ChatService.sendMessage({
  //     sender,
  //     message: type === "file" ? fileData.fileName : text,
  //     roomId,
  //     type,
  //     fileData: fileData || null,
  //   });

  //   dispatch(replaceTempMessage({ roomId, tempId: temp.id, message: saved }));
  // };

  const sendMessage = async (text, sender, options = {}) => {
    const { type = "text", file = null } = options; // file = raw File object

    const tempMessage = type === "file" ? file?.name : text;

    const temp = {
      sender,
      message: tempMessage,
      timestamp: new Date().toISOString(),
      roomId,
      type,
      id: `temp-${Date.now()}`,
      // Show preview info while uploading
      ...(file && {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      }),
    };

    dispatch(addMessageIfMissing({ roomId, message: temp }));

    const saved = await ChatService.sendMessage({
      sender,
      message: type === "text" ? text : file?.name || "",
      roomId,
      type,
      file: type === "file" ? file : null, // pass raw File object
    });

    dispatch(replaceTempMessage({ roomId, tempId: temp.id, message: saved }));
  };

  const publishTyping = (username) => {
    if (channelRef.current) {
      channelRef.current.publish("typing", { username });
    }
  };

  // const deleteMessage = async (id) => {
  //   dispatch(removeMessage({ roomId, id }));
  // };

  // eslint-disable-next-line no-unused-vars
  const deleteMessage = async (id, fileId = null) => {
  dispatch(removeMessage({ roomId, id }));
  // fileId passed through so Domo storage also gets cleaned up
};

  const editMessage = async (oldId, newText, newId) => {
    dispatch(
      updateMessage({
        roomId,
        oldId,
        message: { id: newId, message: newText, edited: "true" },
      }),
    );
  };

  return {
    messages,
    loading,
    online,
    typingUsers,
    sendMessage,
    publishTyping,
    deleteMessage,
    editMessage,
  };
}
