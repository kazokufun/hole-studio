import React, { useState } from 'react';
import { GlassCard } from './shared/GlassCard';
import type { PromptHistoryEntry } from '../types';
import { playAudio } from '../services/audioService';

interface CostumeCardProps {
    customPrompts: PromptHistoryEntry[];
    onSaveNewPrompt: (data: { title: string, prompt: string }) => void;
    onDeletePrompt: (id: number) => void;
}


export const CostumeCard: React.FC<CostumeCardProps> = ({ customPrompts, onSaveNewPrompt, onDeletePrompt }) => {
    const [newPromptData, setNewPromptData] = useState<Omit<PromptHistoryEntry, 'id'>>({ title: '', prompt: '' });
    const [copiedId, setCopiedId] = useState<number | null>(null);

    const handleSaveNewPrompt = () => {
        playAudio('/tombol.mp3');
        if (!newPromptData.title.trim() || !newPromptData.prompt.trim()) {
            alert('Title and prompt fields cannot be empty.');
            return;
        }
        onSaveNewPrompt(newPromptData);
        setNewPromptData({ title: '', prompt: '' }); // Reset form
    };

    const handleCopy = (promptText: string, id: number) => {
        playAudio('/tombol.mp3');
        if (!navigator.clipboard) {
          alert("Clipboard API not available.");
          return;
        }
        navigator.clipboard.writeText(promptText).then(() => {
          setCopiedId(id);
          setTimeout(() => {
            setCopiedId(null);
          }, 2000);
        }).catch(err => {
          console.error('Failed to copy text: ', err);
          alert('Failed to copy prompt.');
        });
    };

    const handleDelete = (idToDelete: number) => {
        playAudio('/tombol.mp3');
        onDeletePrompt(idToDelete);
    };

    return (
        <GlassCard className="p-6 font-mono text-white/90 flex flex-col h-full">
            <h3 className="text-sm font-bold tracking-widest mb-3 text-white/70">SAVE PROMPT HERE:</h3>
            <div className="overflow-auto flex-grow relative">
                <table className="w-full text-left table-fixed">
                    <thead>
                        <tr className="border-b border-white/20">
                            <th className="p-2 text-xs tracking-widest w-12">#</th>
                            <th className="p-2 text-xs tracking-widest w-1/3">TITLE</th>
                            <th className="p-2 text-xs tracking-widest">PROMPT</th>
                            <th className="p-2 text-xs tracking-widest text-center w-32">ACTION</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {customPrompts.map((entry, index) => (
                            <tr key={entry.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-2 text-sm align-middle">{index + 1}</td>
                                <td className="p-2 text-sm font-semibold align-middle whitespace-normal break-words">{entry.title}</td>
                                <td className="p-2 text-sm align-middle truncate" title={entry.prompt}>{entry.prompt}</td>
                                <td className="p-2 text-center align-middle">
                                    <div className="flex justify-center items-center gap-2">
                                        <button
                                            onClick={() => handleCopy(entry.prompt, entry.id)}
                                            disabled={copiedId === entry.id}
                                            className="bg-transparent border border-teal-400 text-teal-400 hover:bg-teal-400/20 disabled:bg-teal-500 disabled:border-teal-500 disabled:text-white disabled:cursor-default text-xs font-bold tracking-widest py-1 px-2 rounded-md transition-all duration-300 w-12 text-center"
                                            aria-label="Copy prompt"
                                        >
                                            {copiedId === entry.id ? 'OK!' : 'CP'}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(entry.id)}
                                            className="bg-transparent border border-pink-500 text-pink-500 hover:bg-pink-500/20 text-xs font-bold tracking-widest py-1 px-2 rounded-md transition-all duration-300 w-12 text-center"
                                            aria-label="Delete prompt"
                                        >
                                            DEL
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {/* New prompt entry row */}
                        <tr className="bg-black/10">
                            <td className="p-2 text-sm align-middle">{customPrompts.length + 1}</td>
                            <td className="p-2 align-middle">
                                <input
                                    type="text"
                                    placeholder="New Title..."
                                    value={newPromptData.title}
                                    onChange={(e) => setNewPromptData(p => ({ ...p, title: e.target.value }))}
                                    className="w-full bg-black/30 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-300"
                                />
                            </td>
                            <td className="p-2 align-middle">
                                <input
                                    type="text"
                                    placeholder="New Prompt..."
                                    value={newPromptData.prompt}
                                    onChange={(e) => setNewPromptData(p => ({ ...p, prompt: e.target.value }))}
                                    className="w-full bg-black/30 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-300"
                                />
                            </td>
                            <td className="p-2 text-center align-middle">
                                <button
                                    onClick={handleSaveNewPrompt}
                                    disabled={!newPromptData.title.trim() || !newPromptData.prompt.trim()}
                                    className="bg-cyan-500 text-black hover:bg-cyan-400 disabled:bg-gray-600/50 disabled:text-white/50 disabled:cursor-not-allowed text-xs font-bold tracking-widest py-2 px-4 rounded-md transition-all duration-300"
                                >
                                    SAVE
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </GlassCard>
    );
};