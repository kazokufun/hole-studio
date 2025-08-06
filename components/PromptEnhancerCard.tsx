import React from 'react';
import { GlassCard } from './shared/GlassCard';
import { ButtonAnimations } from './shared/ButtonAnimations';

interface PromptEnhancerCardProps {
  prompt: string;
  setPrompt: (value: string) => void;
  onCreateVariations: () => void;
  isLoading: boolean;
}

export const PromptEnhancerCard: React.FC<PromptEnhancerCardProps> = ({
  prompt,
  setPrompt,
  onCreateVariations,
  isLoading,
}) => {
  return (
    <GlassCard className="p-6 font-mono text-white/90 flex flex-col h-full">
      <h3 className="text-sm font-bold tracking-widest mb-2 text-white/70">PROMPT ENHANCER:</h3>
      <p className="text-xs text-white/60 mb-2">Generate controlled variations of your prompt below.</p>

      <div className="relative flex-grow flex flex-col">
        <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="The prompt from your analyzed image will appear here..."
            className="flex-grow bg-black/30 rounded-xl p-4 text-sm w-full focus:outline-none focus:ring-2 focus:ring-fuchsia-500 transition-all duration-300 resize-none"
        />
      </div>

      <div className="mt-4 flex justify-center">
        <ButtonAnimations
            onClick={onCreateVariations}
            disabled={isLoading || !prompt.trim()}
            className="w-full"
        >
            {isLoading ? "CREATING..." : "CREATE VARIATIONS"}
        </ButtonAnimations>
      </div>
    </GlassCard>
  );
};
