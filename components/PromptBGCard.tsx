import React from 'react';
import { GlassCard } from './shared/GlassCard';
import { ButtonAnimations } from './shared/ButtonAnimations';

interface PromptBGCardProps {
  prompt: string;
  setPrompt: (value: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

export const PromptBGCard: React.FC<PromptBGCardProps> = ({ prompt, setPrompt, onGenerate, isLoading }) => {
  return (
    <GlassCard className="p-6 flex flex-col h-full font-mono text-white/90">
      <h3 className="text-sm font-bold tracking-widest mb-1 text-white/70">Background Design</h3>
      <p className="text-xs text-white/60 mb-2">Write Simple Text Background</p>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="e.g., a serene beach at sunset..."
        className="flex-grow bg-black/30 rounded-xl p-4 text-sm w-full focus:outline-none focus:ring-2 focus:ring-fuchsia-500 transition-all duration-300 resize-none"
      />
      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center space-x-2">
           <div className={`w-3 h-3 rounded-full transition-colors duration-300 ${isLoading ? 'bg-yellow-400 animate-pulse' : (prompt.trim() ? 'bg-green-400' : 'bg-gray-500')}`}></div>
           <span className="text-xs tracking-wider">{isLoading ? 'BUSY' : (prompt.trim() ? 'READY' : 'IDLE')}</span>
        </div>
        <ButtonAnimations
          onClick={onGenerate}
          disabled={isLoading || !prompt.trim()}
        >
          {isLoading ? (
            <span>DESIGNING...</span>
          ) : (
            <span>DESIGN BG</span>
          )}
        </ButtonAnimations>
      </div>
    </GlassCard>
  );
};
