import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`bg-gray-500/10 backdrop-filter backdrop-blur-lg border border-white/20 rounded-2xl shadow-lg ${className}`}
    >
      {children}
    </div>
  );
};
