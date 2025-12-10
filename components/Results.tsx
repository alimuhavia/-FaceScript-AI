import React, { useState } from 'react';
import { CopyIcon, RefreshIcon } from './Icons';

interface ResultsProps {
  script: string;
  generatedImageBase64: string | null;
  isLoadingImage: boolean;
  onGenerateImage: () => void;
  onReset: () => void;
}

const Results: React.FC<ResultsProps> = ({ script, generatedImageBase64, isLoadingImage, onGenerateImage, onReset }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
      {/* Script Column */}
      <div className="glass-panel rounded-xl p-6 flex flex-col h-full border-l-4 border-blue-500">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-blue-300">Face Analysis Script</h3>
          <button 
            onClick={handleCopy}
            className="p-2 hover:bg-slate-700 rounded-full transition text-slate-400 hover:text-white"
            title="Copy script"
          >
            {copied ? <span className="text-xs text-green-400 font-bold">Copied!</span> : <CopyIcon className="w-5 h-5" />}
          </button>
        </div>
        <div className="flex-grow bg-slate-800/50 p-4 rounded-lg overflow-y-auto max-h-[400px] text-slate-300 leading-relaxed text-sm md:text-base border border-slate-700/50">
          {script}
        </div>
        {!generatedImageBase64 && !isLoadingImage && (
          <div className="mt-6">
            <button 
              onClick={onGenerateImage}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold shadow-lg transition transform active:scale-95 flex justify-center items-center gap-2"
            >
              <span>Generate AI Avatar</span>
            </button>
          </div>
        )}
      </div>

      {/* Image Column */}
      <div className="glass-panel rounded-xl p-6 flex flex-col h-full border-l-4 border-purple-500 relative min-h-[300px]">
        <h3 className="text-xl font-bold text-purple-300 mb-4">AI Generated Avatar</h3>
        
        <div className="flex-grow flex items-center justify-center bg-black/40 rounded-lg border border-slate-700/50 overflow-hidden relative">
          {isLoadingImage ? (
             <div className="flex flex-col items-center justify-center p-8">
               <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
               <p className="text-purple-300 animate-pulse">Dreaming up your avatar...</p>
             </div>
          ) : generatedImageBase64 ? (
            <img 
              src={`data:image/png;base64,${generatedImageBase64}`} 
              alt="Generated AI Avatar" 
              className="w-full h-full object-contain animate-fade-in"
            />
          ) : (
            <div className="text-center p-6 text-slate-500">
              <p>Click "Generate AI Avatar" to visualize the script.</p>
            </div>
          )}
        </div>

        {generatedImageBase64 && (
             <a 
               href={`data:image/png;base64,${generatedImageBase64}`} 
               download="my-ai-avatar.png"
               className="mt-4 py-2 w-full text-center rounded-lg border border-purple-500 text-purple-300 hover:bg-purple-500 hover:text-white transition"
             >
               Download Image
             </a>
        )}
      </div>

      <div className="md:col-span-2 flex justify-center mt-4">
        <button 
          onClick={onReset}
          className="px-6 py-2 flex items-center gap-2 text-slate-400 hover:text-white transition"
        >
          <RefreshIcon className="w-5 h-5" />
          <span>Start Over</span>
        </button>
      </div>
    </div>
  );
};

export default Results;