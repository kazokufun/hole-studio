import React from 'react';
import { GlassCard } from './shared/GlassCard';
import { ButtonAnimations } from './shared/ButtonAnimations';

interface VectorBGCardProps {
  prompt: string;
  setPrompt: (value: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

export const VectorBGCard: React.FC<VectorBGCardProps> = ({ prompt, setPrompt, onGenerate, isLoading }) => {
  return (
    <GlassCard className="p-6 flex flex-col h-full font-mono text-white/90 opacity-60 cursor-not-allowed">
      <h3 className="text-sm font-bold tracking-widest mb-1 text-white/70">VECTORBG:</h3>
      <p className="text-xs text-white/60 mb-2">This feature is coming soon.</p>
      <textarea
        value=""
        readOnly
        disabled
        placeholder="Vector background generation will be available in a future update."
        className="flex-grow bg-black/30 rounded-xl p-4 text-sm w-full focus:outline-none resize-none cursor-not-allowed"
      />
      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center space-x-2">
           <div className={`w-3 h-3 rounded-full bg-gray-500`}></div>
           <span className="text-xs tracking-wider">DISABLED</span>
        </div>
        <ButtonAnimations
          onClick={() => {}}
          disabled={true}
        >
          <span>DESIGN VT</span>
        </ButtonAnimations>
      </div>
    </GlassCard>
  );
};
