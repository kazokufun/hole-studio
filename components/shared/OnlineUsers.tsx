import React, { useState, useEffect } from 'react';

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

export const OnlineUsers: React.FC = () => {
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    // Set a plausible initial random count to start with.
    const initialCount = Math.floor(Math.random() * (250 - 80 + 1)) + 80;
    setUserCount(initialCount);

    // Set up an interval to simulate real-time fluctuations.
    const interval = setInterval(() => {
      // Fluctuate the count by a small random number (-2 to +2).
      const fluctuation = Math.floor(Math.random() * 5) - 2;
      setUserCount(prevCount => {
        const newCount = prevCount + fluctuation;
        // Ensure the count stays within a reasonable range.
        if (newCount < 50) return 50 + Math.floor(Math.random() * 5);
        if (newCount > 300) return 300 - Math.floor(Math.random() * 5);
        return newCount;
      });
    }, 3500); // Update every 3.5 seconds for a natural feel.

    // Cleanup the interval when the component unmounts.
    return () => clearInterval(interval);
  }, []); // The empty dependency array ensures this effect runs only once on mount.

  return (
    <div className="flex items-center bg-black/30 px-3 py-1 rounded-full border border-white/20" title={`${userCount} users currently online`}>
      <UsersIcon />
      <span className="text-sm font-semibold tracking-wider text-white/80">{userCount}</span>
    </div>
  );
};