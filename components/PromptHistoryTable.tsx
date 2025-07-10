import React, { useState } from 'react';
import { GlassCard } from './shared/GlassCard';
import type { PromptHistoryEntry } from '../types';
import { Loader } from './shared/Loader';
import { playAudio } from '../services/audioService';

interface PromptHistoryTableProps {
  history: PromptHistoryEntry[];
  isLoading: boolean;
  onSave: (entry: { title: string, prompt: string }) => void;
}

export const PromptHistoryTable: React.FC<PromptHistoryTableProps> = ({ history, isLoading, onSave }) => {
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [savedId, setSavedId] = useState<number | null>(null);

  const handleCopy = (promptText: string, id: number) => {
    playAudio('/tombol.mp3');
    if (!navigator.clipboard) {
      alert("Clipboard API not available. This feature works best on a secure (HTTPS) connection.");
      return;
    }
    navigator.clipboard.writeText(promptText).then(() => {
      setCopiedId(id);
      setTimeout(() => {
        setCopiedId(null);
      }, 2000); // Revert back to 'COPY' after 2 seconds
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      alert('Failed to copy prompt.');
    });
  };

  const handleSave = (entry: PromptHistoryEntry) => {
    playAudio('/tombol.mp3');
    onSave({ title: entry.title, prompt: entry.prompt });
    setSavedId(entry.id);
    setTimeout(() => {
        setSavedId(null);
    }, 2000);
  };


  return (
    <GlassCard className="p-6 font-mono text-white/90 flex flex-col h-full">
      <h3 className="text-sm font-bold tracking-widest mb-3 text-white/70">PROMPT TABLE:</h3>
      <div className="overflow-auto flex-grow relative">
        {isLoading && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-b-2xl">
                <Loader className="w-32 h-32" />
            </div>
        )}
        <table className="w-full text-left table-fixed">
          <thead>
            <tr className="border-b border-white/20">
              <th className="p-2 text-xs tracking-widest w-12">#</th>
              <th className="p-2 text-xs tracking-widest w-1/3">TITLE</th>
              <th className="p-2 text-xs tracking-widest">PROMPT</th>
              <th className="p-2 text-xs tracking-widest text-right w-44">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {history.length > 0 ? (
                history.map((entry, index) => (
                <tr key={entry.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-2 text-sm align-top">{index + 1}</td>
                    <td className="p-2 text-sm font-semibold align-top whitespace-normal break-words">{entry.title}</td>
                    <td className="p-2 text-sm align-top truncate" title={entry.prompt}>{entry.prompt}</td>
                    <td className="p-2 text-right align-top">
                        <div className="flex items-center justify-end gap-2">
                            <button 
                                onClick={() => handleCopy(entry.prompt, entry.id)}
                                disabled={copiedId === entry.id}
                                className="bg-transparent border border-cyan-400 text-cyan-400 hover:bg-cyan-400/20 disabled:bg-green-500 disabled:border-green-500 disabled:text-white disabled:cursor-default text-xs font-bold tracking-widest py-1 px-2 rounded-md transition-all duration-300 w-20 text-center"
                            >
                                {copiedId === entry.id ? 'COPIED!' : 'COPY'}
                            </button>
                             <button 
                                onClick={() => handleSave(entry)}
                                disabled={savedId === entry.id}
                                className="bg-transparent border border-teal-400 text-teal-400 hover:bg-teal-400/20 disabled:bg-teal-500 disabled:border-teal-500 disabled:text-white disabled:cursor-default text-xs font-bold tracking-widest py-1 px-2 rounded-md transition-all duration-300 w-20 text-center"
                            >
                                {savedId === entry.id ? 'SAVED!' : 'SAVE'}
                            </button>
                        </div>
                    </td>
                </tr>
                ))
            ) : (
                <tr>
                    <td colSpan={4} className="text-center p-8 text-white/50">
                        Generated prompts will appear here.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
};