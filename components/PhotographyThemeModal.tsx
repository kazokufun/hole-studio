import React, { useState } from 'react';
import { GlassCard } from './shared/GlassCard';
import { ButtonAnimations } from './shared/ButtonAnimations';
import { playAudio } from '../services/audioService';

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

interface PhotographyThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (theme: string) => void;
}

const THEMES = [
    'Landscape Photography',
    'Street Photography',
    'Wildlife Photography',
    'Macro Photography',
    'Architectural Photography',
    'Food Photography',
    'Fine Art Photography',
    'Studio Photography'
];

export const PhotographyThemeModal: React.FC<PhotographyThemeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);

  if (!isOpen) return null;

  const handleClose = () => {
    playAudio('/tombol.mp3');
    onClose();
  };
  
  const handleSubmit = () => {
    onSubmit(selectedTheme);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 font-mono text-white/90 p-4">
      <GlassCard className="p-6 w-full max-w-2xl relative border-cyan-500/50">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
          aria-label="Close settings"
        >
          <CloseIcon />
        </button>
        
        <h2 className="text-xl font-bold tracking-wider mb-2">Pilih Tema</h2>
        <p className="text-sm text-white/60 mb-6">
          Select a photography theme to generate specialized prompts.
        </p>

        <div className="max-h-[60vh] overflow-y-auto pr-2">
            <fieldset className="mb-6">
              <legend className="text-lg font-bold tracking-wider mb-3 text-white/80">Photography Themes</legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {THEMES.map((theme) => (
                  <label key={theme} className="flex items-center cursor-pointer text-sm">
                    <input
                      type="radio"
                      name="photography_theme"
                      value={theme}
                      checked={selectedTheme === theme}
                      onChange={(e) => setSelectedTheme(e.target.value)}
                      className="form-radio"
                    />
                    <span>{theme}</span>
                  </label>
                ))}
              </div>
            </fieldset>
        </div>
        
        <div className="mt-8 flex justify-end">
          <ButtonAnimations onClick={handleSubmit}>
            OK
          </ButtonAnimations>
        </div>
      </GlassCard>
    </div>
  );
};