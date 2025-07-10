import React, { useCallback, useState } from 'react';
import { GlassCard } from './shared/GlassCard';
import { ButtonAnimations } from './shared/ButtonAnimations';
import { Loader } from './shared/Loader';
import { OnlineUsers } from './shared/OnlineUsers';


const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

interface ImageAndResultCardProps {
  onImageUpload: (file: File) => void;
  resultPrompt: string;
  isAnalyzing: boolean;
  onAnalyze: () => void;
  imageUploaded: boolean;
  onOpenSettings: () => void;
}

export const ImageAndResultCard: React.FC<ImageAndResultCardProps> = ({ 
    onImageUpload, 
    resultPrompt, 
    isAnalyzing, 
    onAnalyze, 
    imageUploaded, 
    onOpenSettings,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        setPreviewUrl(URL.createObjectURL(file));
        onImageUpload(file);
      } else {
        alert('Please upload an image file.');
      }
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  }, [onImageUpload]);

  return (
    <GlassCard className="p-6 flex flex-col space-y-4 h-full font-mono text-white/90 relative">
      <div className="absolute top-4 right-4 flex items-center space-x-2 z-10">
        <OnlineUsers />
        <button 
          onClick={onOpenSettings} 
          className="p-2 text-white/50 hover:text-white hover:rotate-90 transition-all duration-500"
          aria-label="Open settings"
        >
          <SettingsIcon />
        </button>
      </div>


      {/* 1. Header (fixed size) */}
      <div className="flex items-center space-x-4 flex-shrink-0">
        <img
            src="https://s14.gifyu.com/images/bH2tk.gif"
            alt="Profile"
            className="w-20 h-20 rounded-full object-cover border-2 border-white/30"
        />
        <div>
          <h2 className="text-xl font-bold tracking-wider">Hole Studio</h2>
          <p className="text-xs text-white/60 tracking-wider mt-1">(Prompt Generator Cepat Bosan)</p>
        </div>
      </div>
      
      {/* 2. Drop Zone (takes up ~2/3 of flexible space) */}
      <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative flex-grow-[2] basis-0 min-h-0 bg-black/30 rounded-xl border-2 border-dashed ${isDragging ? 'border-fuchsia-500' : 'border-white/30'} flex items-center justify-center text-center transition-all duration-300 overflow-y-auto`}
      >
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e.target.files)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" className="w-full h-auto object-contain rounded-xl p-1" />
          ) : (
            <div className="flex flex-col items-center p-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-bold tracking-widest">DRAG & DROP IMAGE HERE</span>
                <span className="text-xs text-white/50 mt-1">or click to browse</span>
            </div>
          )}
      </div>

      {/* 3. Analyze Button (fixed size) */}
      <div className="flex-shrink-0 flex justify-center">
        <ButtonAnimations
            onClick={onAnalyze}
            disabled={isAnalyzing || !imageUploaded}
        >
            {isAnalyzing ? "ANALYZING..." : "ANALISIS"}
        </ButtonAnimations>
      </div>


      {/* 4. Result Area (takes up ~1/3 of flexible space) */}
      <div className="flex-grow-[1] basis-0 min-h-0 bg-black/30 rounded-xl p-4 flex flex-col">
        <h3 className="text-sm font-bold tracking-widest mb-2 text-white/70 flex-shrink-0">RESULT PROMPT</h3>
        <div className="flex-grow text-sm overflow-y-auto pr-2 min-h-0">
            {isAnalyzing ? (
                 <div className="flex items-center justify-center h-full">
                    <Loader className="w-32 h-32" />
                 </div>
            ) : (
                <p className="whitespace-pre-wrap">{resultPrompt || "Analysis of your image will appear here, structured as:\n\nNama Gambar:\nGaya Gambar:\nDetail Objek:\nPrompt Gambar:"}</p>
            )}
        </div>
      </div>
    </GlassCard>
  );
};