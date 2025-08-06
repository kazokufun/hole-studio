import React from 'react';
import { GlassCard } from './shared/GlassCard';
import { ButtonAnimations } from './shared/ButtonAnimations';

interface PromptInputCardProps {
  prompt: string;
  setPrompt: (value: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  hasGenerated: boolean;
}

export const PromptInputCard: React.FC<PromptInputCardProps> = ({ prompt, setPrompt, onGenerate, isLoading, hasGenerated }) => {
  return (
    <GlassCard className="p-6 flex flex-col h-full font-mono text-white/90">
      <h3 className="text-sm font-bold tracking-widest mb-2 text-white/70">PHOTO CONCEPT:</h3>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe a photo concept. E.g., 'a lone hiker watching the aurora borealis'..."
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
            <span>GENERATING...</span>
          ) : hasGenerated ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
              </svg>
              <span>REGENERATE</span>
            </>
          ) : (
            <span>SEND</span>
          )}
        </ButtonAnimations>
      </div>
    </GlassCard>
  );
};
