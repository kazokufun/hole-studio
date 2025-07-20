import React, { useState } from 'react';
import { GlassCard } from './shared/GlassCard';
import { ButtonAnimations } from './shared/ButtonAnimations';
import { playAudio } from '../services/audioService';
import type { VectorBGOptions } from '../types';

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

interface VectorBGModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (options: VectorBGOptions) => void;
}

const DESIGNS = ['Logo', 'Illustration', 'Custom Typography', 'Infographics', 'User Interface', 'Product'];
const ICON_DESIGNS = ['Glyph Icons', 'Line Icons', 'Filled Icons', 'Flat Icons', 'Semi-Flat Icons', 'Duotone Icons', 'Isometric Icons'];
const ICON_TYPES = ['Single', '3x3 grid', '3x4 grid'];

export const VectorBGModal: React.FC<VectorBGModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [selectedDesign, setSelectedDesign] = useState('');
  const [selectedIconDesign, setSelectedIconDesign] = useState('');
  const [selectedIconType, setSelectedIconType] = useState('');

  if (!isOpen) return null;

  const handleClose = () => {
    playAudio('/tombol.mp3');
    onClose();
  };
  
  const handleSubmit = () => {
    onSubmit({
      design: selectedDesign,
      iconDesign: selectedIconDesign,
      iconType: selectedIconType,
    });
  };

  const handleRadioChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setter(prev => (prev === value ? '' : value)); // Allows deselecting
  };

  const renderRadioGroup = (
    title: string, 
    options: string[], 
    selectedValue: string, 
    onChange: (value: string) => void,
    gridCols = 'sm:grid-cols-3'
  ) => (
    <fieldset className="mb-6">
      <legend className="text-lg font-bold tracking-wider mb-3 text-white/80">{title}</legend>
      <div className={`grid grid-cols-2 ${gridCols} gap-3`}>
        {options.map((option) => (
          <label key={option} className="flex items-center cursor-pointer text-sm">
            <input
              type="radio"
              name={title.toLowerCase().replace(' ', '')}
              value={option}
              checked={selectedValue === option}
              onChange={() => onChange(option)}
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
      <GlassCard className="p-6 w-full max-w-2xl relative border-fuchsia-500/50">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
          aria-label="Close settings"
        >
          <CloseIcon />
        </button>
        
        <h2 className="text-xl font-bold tracking-wider mb-2">Vector Design Options</h2>
        <p className="text-sm text-white/60 mb-6">
          Select optional characteristics to guide the vector prompt generation.
        </p>

        <div className="max-h-[60vh] overflow-y-auto pr-2">
            {renderRadioGroup('Design', DESIGNS, selectedDesign, (val) => handleRadioChange(setSelectedDesign, val))}
            {renderRadioGroup('Icon Design', ICON_DESIGNS, selectedIconDesign, (val) => handleRadioChange(setSelectedIconDesign, val), 'sm:grid-cols-4')}
            {renderRadioGroup('Icon Type', ICON_TYPES, selectedIconType, (val) => handleRadioChange(setSelectedIconType, val))}
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