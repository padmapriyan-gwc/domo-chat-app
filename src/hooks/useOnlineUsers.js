import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAbly } from "../lib/ably";
import {
  addOnlineUser,
  removeOnlineUser,
  setOnlineUsers,
} from "../store/presenceSlice";

export function useOnlineUsers(username) {
  const dispatch = useDispatch();
  const onlineUsers = useSelector((state) => state.presence.onlineUsers);

  useEffect(() => {
    if (!username || typeof username !== "string") return;

    const ably = getAbly(username);
    if (!ably) return;

    const channel = ably.channels.get("global-presence");
    let mounted = true;

    const init = async () => {
      try {
        await new Promise((resolve, reject) => {
          if (ably.connection.state === "connected") {
            resolve();
          } else if (
            ably.connection.state === "failed" ||
            ably.connection.state === "closed"
          ) {
            reject(new Error("Connection failed"));
          } else {
            ably.connection.once("connected", resolve);
            ably.connection.once("failed", reject);
            ably.connection.once("closed", reject);
          }
        });

        if (!mounted) return;

        await channel.presence.enter({ username });

        const members = await channel.presence.get();
        if (mounted) {
          dispatch(setOnlineUsers(members.map((member) => member.clientId)));
        }

        channel.presence.subscribe("enter", (member) => {
          if (!mounted) return;
          dispatch(addOnlineUser(member.clientId));
        });

        channel.presence.subscribe("leave", (member) => {
          if (!mounted) return;
          dispatch(removeOnlineUser(member.clientId));
        });

        ably.connection.on("connected", async () => {
          if (!mounted) return;
          try {
            await channel.presence.enter({ username });
            const members = await channel.presence.get();
            if (mounted) {
              dispatch(setOnlineUsers(members.map((member) => member.clientId)));
            }
          } catch (err) {
            console.error("[Presence] Re-sync failed:", err);
          }
        });
      } catch (err) {
        console.error("[Presence] Init failed:", err);
      }
    };

    init();

    return () => {
      mounted = false;
      try {
        channel.presence.leave();
        channel.presence.unsubscribe();
        ably.connection.off();
      } catch (err) {
        console.error("[Presence] Cleanup failed:", err);
      }
    };
  }, [username, dispatch]);

  return onlineUsers;
}
