import React, { useState, useEffect } from 'react';
import { GlassCard } from './shared/GlassCard';
import { ButtonAnimations } from './shared/ButtonAnimations';
import { playAudio } from '../services/audioService';

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

interface SettingsCardProps {
  isOpen: boolean;
  onClose: () => void;
  apiKeys: { key1: string; key2: string; key3: string; };
  setApiKeys: (keys: { key1: string; key2: string; key3: string; }) => void;
  isAnimationEnabled: boolean;
  setIsAnimationEnabled: (enabled: boolean) => void;
}

export const SettingsCard: React.FC<SettingsCardProps> = ({
  isOpen,
  onClose,
  apiKeys,
  setApiKeys,
  isAnimationEnabled,
  setIsAnimationEnabled,
}) => {
  const [localKeys, setLocalKeys] = useState(apiKeys);

  useEffect(() => {
    // When the modal opens, sync its local state with the app's state
    if (isOpen) {
        setLocalKeys(apiKeys);
    }
  }, [isOpen, apiKeys]);

  if (!isOpen) return null;

  const handleSave = () => {
    setApiKeys(localKeys);
    onClose();
  };
  
  const handleKeyInputChange = (e: React.ChangeEvent<HTMLInputElement>, keyName: 'key1' | 'key2' | 'key3') => {
    setLocalKeys(prev => ({ ...prev, [keyName]: e.target.value }));
  };

  const handleClose = () => {
    playAudio('/tombol.mp3');
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 font-mono text-white/90 p-4">
      <GlassCard className="p-6 w-full max-w-lg relative border-fuchsia-500/50">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
          aria-label="Close settings"
        >
          <CloseIcon />
        </button>
        
        <h2 className="text-xl font-bold tracking-wider mb-2">Settings</h2>
        <p className="text-sm text-white/60 mb-6">
            Manage your API Keys and application preferences.
        </p>

        <div className="flex items-center justify-between p-4 rounded-lg border-2 border-white/20 bg-black/20">
          <label htmlFor="animation-toggle-btn" className="font-semibold cursor-pointer">
            Background Animation
          </label>
          <button
            id="animation-toggle-btn"
            role="switch"
            aria-checked={isAnimationEnabled}
            onClick={() => setIsAnimationEnabled(!isAnimationEnabled)}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black/20 focus:ring-cyan-400 ${
              isAnimationEnabled ? 'bg-cyan-400' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                isAnimationEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <h3 className="text-lg font-bold tracking-wider mt-6 mb-2">API Key Settings</h3>
        <p className="text-sm text-white/60 mb-6">
            Provide up to 3 user API keys. The app will automatically try them in order if one fails (e.g., reaches a rate limit). The default app key will be used as a final fallback.
        </p>

        <div className="space-y-4">
            <div className="p-4 rounded-lg border-2 border-white/20 bg-black/20">
                <label className="font-semibold block">Default App API Key</label>
                <p className="text-xs text-white/60 pt-1">This key is built-in and used automatically as a final fallback.</p>
            </div>


          {([1, 2, 3] as const).map(num => (
            <div
              key={num}
              className="p-4 rounded-lg border-2 border-white/20 bg-black/20"
            >
              <label className="font-semibold block mb-2">
                User API Key {num}
              </label>
              <input
                type="password"
                placeholder={`Enter your Gemini API Key ${num}`}
                value={localKeys[`key${num}` as 'key1' | 'key2' | 'key3']}
                onChange={(e) => handleKeyInputChange(e, `key${num}`)}
                className="w-full bg-black/30 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500 transition-all duration-300"
              />
            </div>
          ))}
        </div>
        
        <div className="mt-8 flex justify-end">
          <ButtonAnimations onClick={handleSave}>
            SAVE & CLOSE
          </ButtonAnimations>
        </div>
      </GlassCard>
    </div>
  );
};
