import { useEffect, useState } from 'react';
import { getAbly } from '../lib/ably';

export function useOnlineUsers(username) {
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    // Guard — don't run without valid username
    if (!username || typeof username !== 'string') return;

    const ably = getAbly(username);
    if (!ably) return;

    const channel = ably.channels.get('global-presence');
    let mounted = true;

    const init = async () => {
      try {
        // Wait for connection
        await new Promise((resolve, reject) => {
          if (ably.connection.state === 'connected') {
            resolve();
          } else if (ably.connection.state === 'failed' ||
                     ably.connection.state === 'closed') {
            reject(new Error('Connection failed'));
          } else {
            ably.connection.once('connected', resolve);
            ably.connection.once('failed', reject);
            ably.connection.once('closed', reject);
          }
        });

        if (!mounted) return;

        await channel.presence.enter({ username });

        const members = await channel.presence.get();
        if (mounted) {
          setOnlineUsers(members.map(m => m.clientId));
        }

        channel.presence.subscribe('enter', (member) => {
          if (!mounted) return;
          setOnlineUsers(prev =>
            prev.includes(member.clientId)
              ? prev
              : [...prev, member.clientId]
          );
        });

        channel.presence.subscribe('leave', (member) => {
          if (!mounted) return;
          setOnlineUsers(prev =>
            prev.filter(u => u !== member.clientId)
          );
        });

        // Re-sync on reconnect
        ably.connection.on('connected', async () => {
          if (!mounted) return;
          try {
            await channel.presence.enter({ username });
            const members = await channel.presence.get();
            if (mounted) {
              setOnlineUsers(members.map(m => m.clientId));
            }
          } catch (err) {
            console.error('[Presence] Re-sync failed:', err);
          }
        });

      } catch (err) {
        console.error('[Presence] Init failed:', err);
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
        console.error('[Presence] Cleanup failed:', err);
      }
    };
  }, [username]);

  return onlineUsers;
}