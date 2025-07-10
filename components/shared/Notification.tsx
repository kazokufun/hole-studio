import React, { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard';
import type { NotificationEntry } from '../../types';

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


interface NotificationToastProps {
    notification: NotificationEntry;
    onClose: () => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onClose }) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsExiting(true);
            const closeTimer = setTimeout(onClose, 400); // Wait for animation (duration-300) to finish
            return () => clearTimeout(closeTimer);
        }, 3000); // 3 seconds visible

        return () => clearTimeout(timer);
    }, [onClose]);

    // Initial state is not animated, animation applies on exit
    const animationClasses = isExiting 
        ? 'translate-x-[120%] opacity-0' 
        : 'translate-x-0 opacity-100';

    return (
        <GlassCard
            className={`w-80 max-w-sm p-4 flex items-center gap-4 border-l-4 border-cyan-400 transition-all duration-300 ease-in-out transform ${animationClasses}`}
        >
            <CheckIcon />
            <p className="text-sm text-white/90">{notification.message}</p>
        </GlassCard>
    );
};


interface NotificationContainerProps {
  notifications: NotificationEntry[];
  onRemove: (id: number) => void;
}

export const NotificationContainer: React.FC<NotificationContainerProps> = ({ notifications, onRemove }) => {
    return (
        <div aria-live="assertive" className="fixed inset-0 flex items-start justify-end p-4 sm:p-6 lg:p-8 z-[100] pointer-events-none">
            <div className="w-full max-w-sm flex flex-col items-end space-y-4">
                {notifications.map(n => (
                    <div key={n.id} className="pointer-events-auto">
                         <NotificationToast 
                            notification={n}
                            onClose={() => onRemove(n.id)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};