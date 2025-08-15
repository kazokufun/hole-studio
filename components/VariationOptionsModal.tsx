import React, { useState } from 'react';
import { GlassCard } from './shared/GlassCard';
import { ButtonAnimations } from './shared/ButtonAnimations';
import { playAudio } from '../services/audioService';
import type { VariationOptions } from '../types';

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

interface VariationOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (options: VariationOptions) => void;
}

const OPTIONS = [
    { key: 'object', label: 'Objek' },
    { key: 'pattern', label: 'Pola' },
    { key: 'shape', label: 'Bentuk' },
    { key: 'color', label: 'Warna' },
    { key: 'background', label: 'Latar Belakang' },
    { key: 'text', label: 'Teks' },
] as const;


export const VariationOptionsModal: React.FC<VariationOptionsModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [selectedOptions, setSelectedOptions] = useState<VariationOptions>({
      object: false,
      pattern: false,
      shape: false,
      color: false,
      background: false,
      text: false,
  });

  if (!isOpen) return null;

  const handleClose = () => {
    playAudio('/tombol.mp3');
    onClose();
  };
  
  const handleSubmit = () => {
    onSubmit(selectedOptions);
  };
  
  const handleCheckboxChange = (optionKey: keyof VariationOptions) => {
    setSelectedOptions(prev => ({
        ...prev,
        [optionKey]: !prev[optionKey]
    }));
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
        
        <h2 className="text-xl font-bold tracking-wider mb-2">Ganti</h2>
        <p className="text-sm text-white/60 mb-6">
          Pilih bagian mana dari prompt yang ingin Anda variasikan. Gaya seni akan dipertahankan.
        </p>

        <div className="max-h-[60vh] overflow-y-auto pr-2">
            <fieldset>
              <legend className="sr-only">Variation Options</legend>
              <div className="grid grid-cols-2 gap-4">
                {OPTIONS.map(({ key, label }) => (
                  <label key={key} className="flex items-center cursor-pointer text-base p-4 bg-black/20 rounded-lg border-2 border-white/20 has-[:checked]:border-cyan-400 has-[:checked]:bg-cyan-500/10 transition-all">
                    <input
                      type="checkbox"
                      name={key}
                      checked={selectedOptions[key]}
                      onChange={() => handleCheckboxChange(key)}
                      className="form-checkbox h-5 w-5 rounded text-cyan-400 bg-black/30 border-white/40 focus:ring-cyan-500 focus:ring-offset-0"
                      style={{
                        boxShadow: 'none' 
                      }}
                    />
                    <span className="ml-3">{label}</span>
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
