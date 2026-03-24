// Generate consistent color from username
export const getUserColor = (username = '') => {
const colors = [
  { bg: 'bg-blue-200',    text: 'text-blue-800'   },
  { bg: 'bg-indigo-200',  text: 'text-indigo-800' },
  { bg: 'bg-purple-200',  text: 'text-purple-800' },
  { bg: 'bg-pink-200',    text: 'text-pink-800'   },
  { bg: 'bg-rose-200',    text: 'text-rose-800'   },
  { bg: 'bg-amber-200',   text: 'text-amber-800'  },
  { bg: 'bg-emerald-200', text: 'text-emerald-800'},
  { bg: 'bg-cyan-200',    text: 'text-cyan-800'   },
];
  const index = Array.from(username)
    .reduce((sum, char) => sum + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
};

// Format date for separators
export const formatDateSeparator = (timestamp) => {
  const date  = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString())     return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

  return date.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });
};

// Play a ping sound using Web Audio API — no file needed
export const playNotificationSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gainNode   = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = 880;
    oscillator.type            = 'sine';
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.3);
  } catch (err) {
    console.warn('Sound notification failed:', err);
  }
};