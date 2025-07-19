import React, { useState } from 'react';
import { GlassCard } from './shared/GlassCard';
import { ButtonAnimations } from './shared/ButtonAnimations';
import { playAudio } from '../services/audioService';
import type { PromptBGOptions } from '../types';

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

interface PromptBGModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (options: PromptBGOptions) => void;
}

const STYLES = ['Flat Design', 'Material Design', 'Retro', 'Modern', 'Grunge', 'Ilustratif', '3D'];
const TYPES = ['Simple', 'Solid Color', 'Gradient', 'Texture', 'Pattern', 'Blurred', 'Geometric/Abstract', 'Typographic', 'Minimalist'];
const SPECIALS = ['With Empty Space', 'Symmetrical'];

export const PromptBGModal: React.FC<PromptBGModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [selectedStyle, setSelectedStyle] = useState(STYLES[0]);
  const [selectedType, setSelectedType] = useState(TYPES[0]);
  const [selectedSpecial, setSelectedSpecial] = useState('');

  if (!isOpen) return null;

  const handleClose = () => {
    playAudio('/tombol.mp3');
    onClose();
  };
  
  const handleSubmit = () => {
    onSubmit({
      style: selectedStyle,
      type: selectedType,
      special: selectedSpecial,
    });
  };

  const handleSpecialChange = (value: string) => {
    setSelectedSpecial(prev => (prev === value ? '' : value));
  };

  const renderRadioGroup = (
    title: string, 
    options: string[], 
    selectedValue: string, 
    onChange: (value: string) => void,
    isSpecial = false
  ) => (
    <fieldset className="mb-6">
      <legend className="text-lg font-bold tracking-wider mb-3 text-white/80">{title}</legend>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {options.map((option) => (
          <label key={option} className="flex items-center cursor-pointer text-sm">
            <input
              type="radio"
              name={title.toLowerCase()}
              value={option}
              checked={selectedValue === option}
              onChange={(e) => onChange(e.target.value)}
              onClick={isSpecial ? () => handleSpecialChange(option) : undefined}
              className="form-radio"
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );

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
        
        <h2 className="text-xl font-bold tracking-wider mb-2">Background Design Options</h2>
        <p className="text-sm text-white/60 mb-6">
          Select the characteristics for your background prompt.
        </p>

        <div className="max-h-[60vh] overflow-y-auto pr-2">
            {renderRadioGroup('Style', STYLES, selectedStyle, setSelectedStyle)}
            {renderRadioGroup('Type', TYPES, selectedType, setSelectedType)}
            {renderRadioGroup('Special', SPECIALS, selectedSpecial, () => {}, true)}
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
