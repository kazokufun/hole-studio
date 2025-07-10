import React, { useState, useCallback } from 'react';
import { GlassCard } from './shared/GlassCard';
import type { PromptHistoryEntry } from '../types';
import { Loader } from './shared/Loader';
import { playAudio } from '../services/audioService';

interface PromptHistoryTableProps {
  history: PromptHistoryEntry[];
  isLoading: boolean;
  onSave: (entry: { title: string, prompt: string }) => void;
  userPrompt: string;
}

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

export const PromptHistoryTable: React.FC<PromptHistoryTableProps> = ({ history, isLoading, onSave, userPrompt }) => {
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

  const handleDownload = useCallback(() => {
    playAudio('/tombol.mp3');
    const header = `**${userPrompt}**\n\n`;
    const promptsContent = history
      .map(entry => entry.prompt)
      .join('\n');
    const fileContent = header + promptsContent;

    const safeFilename = userPrompt
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_.-]/g, '')
      .substring(0, 50) || 'prompts';
    
    const filename = `${safeFilename}.txt`;

    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [userPrompt, history]);


  return (
    <GlassCard className="p-6 font-mono text-white/90 flex flex-col h-full">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-bold tracking-widest text-white/70">PROMPT TABLE:</h3>
        {history.length > 0 && !isLoading && (
            <button
                onClick={handleDownload}
                className="flex items-center gap-2 text-xs font-bold tracking-widest text-cyan-400 border border-cyan-400/50 rounded-md py-1 px-3 hover:bg-cyan-400/20 transition-colors"
                title="Download prompts as .txt"
            >
                <DownloadIcon />
                UNDUH
            </button>
        )}
      </div>
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
