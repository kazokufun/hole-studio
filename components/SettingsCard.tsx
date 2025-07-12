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
  
  const handleAnimationToggle = () => {
    playAudio('/tombol.mp3');
    setIsAnimationEnabled(!isAnimationEnabled);
  };


  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 font-mono text-white/90 p-4">
      <GlassCard className="p-6 w-full max-w-lg relative border-fuchsia-500/50 flex flex-col">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
          aria-label="Close settings"
        >
          <CloseIcon />
        </button>
        
        <h2 className="text-xl font-bold tracking-wider mb-6">Settings</h2>
        
        {/* Visual Settings */}
        <div className="mb-6 p-4 rounded-lg border-2 border-white/20 bg-black/20">
            <h3 className="font-semibold block mb-2">Visuals</h3>
            <div className="flex items-center justify-between">
                <p className="text-sm text-white/70">Enable Background Animation</p>
                <label className="toggle-switch">
                    <input type="checkbox" checked={isAnimationEnabled} onChange={handleAnimationToggle} />
                    <span className="slider"></span>
                </label>
            </div>
             <p className="text-xs text-white/60 pt-2">Disabling animation can improve performance on some devices.</p>
        </div>


        {/* API Key Settings */}
        <div>
            <h3 className="font-semibold block mb-2">API Keys</h3>
            <p className="text-sm text-white/60 mb-4">
                Provide up to 3 user API keys. The app will automatically try them in order if one fails. The default app key will be used as a final fallback.
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
