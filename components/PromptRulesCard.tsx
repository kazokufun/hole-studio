import React from 'react';
import { GlassCard } from './shared/GlassCard';
import { ButtonAnimations } from './shared/ButtonAnimations';
import { Loader } from './shared/Loader';
import { playAudio } from '../services/audioService';

interface PromptRulesCardProps {
  userPrompt: string;
  onGenerateTags: () => void;
  isTagLoading: boolean;
  recommendedTags: string[];
  selectedTags: string[];
  onTagSelect: (tag: string) => void;
}

export const PromptRulesCard: React.FC<PromptRulesCardProps> = ({
  userPrompt,
  onGenerateTags,
  isTagLoading,
  recommendedTags,
  selectedTags,
  onTagSelect,
}) => {
  return (
    <GlassCard className="p-6 font-mono text-white/90 flex flex-col h-full">
      <h3 className="text-sm font-bold tracking-widest mb-3 text-white/70">PROMPT ENHANCER:</h3>
      
      <div className="mb-4 flex justify-center">
        <ButtonAnimations
            onClick={onGenerateTags}
            disabled={isTagLoading || !userPrompt}
            className="w-full"
        >
            {isTagLoading ? "SUGGESTING..." : "SUGGEST STYLES"}
        </ButtonAnimations>
      </div>

      <div className="flex-grow">
        <h4 className="text-xs font-bold tracking-widest text-white/60 mb-2">RECOMMENDED STYLES (SELECT 1-3):</h4>
        {recommendedTags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {recommendedTags.map((tag) => {
              const isActive = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => {
                    playAudio('/tombol.mp3');
                    onTagSelect(tag);
                  }}
                  className={`px-2 py-1 text-xs rounded-full border-2 transition-all duration-200 ${
                    isActive
                      ? 'bg-cyan-200 border-cyan-400 text-cyan-800 font-semibold'
                      : 'bg-black/20 border-white/30 text-cyan-400 hover:bg-white/10 hover:border-white/50 hover:text-cyan-300'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-center text-xs text-white/50 p-4 bg-black/20 rounded-lg">
            {isTagLoading ? <Loader className="w-16 h-16" /> : 'Enter a prompt and click "Suggest Styles" to see suggestions.'}
          </div>
        )}
      </div>
    </GlassCard>
  );
};