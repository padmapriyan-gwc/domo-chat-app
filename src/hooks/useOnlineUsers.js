import { useEffect, useState } from "react";
import { getAbly } from "../lib/ably";

export function useOnlineUsers(username) {
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!username) return;

    const ably = getAbly(username);
    const channel = ably.channels.get("global-presence");

    let mounted = true;

    const init = async () => {
      try {
        // ✅ ENTER PRESENCE
        await channel.presence.enter({ username });

        // ✅ GET CURRENT USERS
        const members = await channel.presence.get();
        if (mounted) {
          setOnlineUsers(members.map((m) => m.clientId));
        }

        // ✅ USER ONLINE
        channel.presence.subscribe("enter", (m) => {
          setOnlineUsers((prev) => {
            if (prev.includes(m.clientId)) return prev;
            return [...prev, m.clientId];
          });
        });

        // ✅ USER OFFLINE
        channel.presence.subscribe("leave", (m) => {
          setOnlineUsers((prev) => prev.filter((u) => u !== m.clientId));
        });
      } catch (err) {
        console.error("Presence error:", err);
      }
    };

    init();

    return () => {
      mounted = false;
      channel.presence.leave();
      channel.presence.unsubscribe();
    };
  }, [username]);

  return onlineUsers;
}
