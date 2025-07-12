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
  onAnimationToggle: (enabled: boolean) => void;
}

export const SettingsCard: React.FC<SettingsCardProps> = ({
  isOpen,
  onClose,
  apiKeys,
  setApiKeys,
  isAnimationEnabled,
  onAnimationToggle,
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
  };
  
  const handleAnimationToggle = () => {
    playAudio('/tombol.mp3');
    onAnimationToggle(!isAnimationEnabled);
  };

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
        
        <h2 className="text-xl font-bold tracking-wider mb-6">Settings</h2>
        
        {/* Visuals Section */}
        <div className="p-4 rounded-lg border-2 border-white/20 bg-black/20 mb-6">
            <div className="flex justify-between items-center">
                <div className="flex flex-col">
                    <label className="font-semibold block">Background Animation</label>
                    <p className="text-xs text-white/60 pt-1">Toggle the dynamic effect for performance.</p>
                </div>
                <button
                    onClick={handleAnimationToggle}
                    role="switch"
                    aria-checked={isAnimationEnabled}
                    className={`relative inline-flex flex-shrink-0 items-center h-6 rounded-full w-11 transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black/50 focus:ring-cyan-500 ${
                        isAnimationEnabled ? 'bg-cyan-500' : 'bg-gray-600'
                    }`}
                >
                    <span
                        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ease-in-out ${
                        isAnimationEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                        aria-hidden="true"
                    />
                </button>
            </div>
        </div>

        {/* API Key Section */}
        <h3 className="text-lg font-bold tracking-wider mb-2">API Keys</h3>
        <p className="text-sm text-white/60 mb-4">
            Provide up to 3 user API keys. The app will automatically try them in order if one fails. The default app key is a final fallback.
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
