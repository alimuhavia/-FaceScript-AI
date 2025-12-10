import React, { useState } from 'react';
import { AppState } from './types';
import Camera from './components/Camera';
import Results from './components/Results';
import { generateFaceScript, generateAvatarFromScript } from './services/geminiService';
import { CameraIcon, UploadIcon, SparklesIcon } from './components/Icons';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [inputImage, setInputImage] = useState<string | null>(null);
  const [script, setScript] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleCapture = async (base64: string) => {
    setIsCameraOpen(false);
    setInputImage(base64);
    await analyzeImage(base64);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        setInputImage(base64);
        await analyzeImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async (base64: string) => {
    setAppState(AppState.ANALYZING);
    setErrorMsg('');
    try {
      const scriptResult = await generateFaceScript(base64);
      setScript(scriptResult);
      setAppState(AppState.COMPLETE);
    } catch (err) {
      setAppState(AppState.ERROR);
      setErrorMsg('Failed to analyze the image. Please try again.');
    }
  };

  const handleGenerateAvatar = async () => {
    if (!script) return;
    setAppState(AppState.GENERATING_IMAGE);
    try {
      const imageResult = await generateAvatarFromScript(script);
      setGeneratedImage(imageResult);
      setAppState(AppState.COMPLETE);
    } catch (err) {
      console.error(err);
      // We don't block the UI completely, just show error in console or toast for now
      // Reset state to complete so they can try again or see the script
      setAppState(AppState.COMPLETE);
      alert('Failed to generate image. The model might be busy or the request was blocked.');
    }
  };

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setInputImage(null);
    setScript('');
    setGeneratedImage(null);
    setErrorMsg('');
    setIsCameraOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#0f172a] to-slate-900 text-white selection:bg-blue-500 selection:text-white pb-20">
      
      {/* Header */}
      <header className="w-full p-6 flex justify-center border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-lg shadow-lg shadow-purple-500/20">
            <SparklesIcon className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-purple-200">
            FaceScript AI
          </h1>
        </div>
      </header>

      <main className="container mx-auto max-w-5xl px-4 pt-10">
        
        {/* Intro Text */}
        {appState === AppState.IDLE && !isCameraOpen && (
          <div className="text-center mb-12 animate-fade-in-down">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Turn your face into a masterpiece.
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Upload a photo or take a selfie. Our AI analyzes your features to write a perfect descriptive script and generates a stunning artistic avatar.
            </p>
          </div>
        )}

        {/* Input Section */}
        {appState === AppState.IDLE && !isCameraOpen && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto animate-fade-in-up">
            
            {/* Upload Card */}
            <div className="glass-panel p-8 rounded-2xl hover:bg-slate-800/80 transition cursor-pointer group relative overflow-hidden border border-white/5">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileUpload} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex flex-col items-center gap-4 relative z-0">
                <div className="p-4 rounded-full bg-slate-700/50 group-hover:bg-blue-600/20 group-hover:text-blue-400 transition">
                  <UploadIcon className="w-10 h-10 text-slate-300 group-hover:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold">Upload Photo</h3>
                <p className="text-sm text-slate-400 text-center">Drag & drop or click to select from your device</p>
              </div>
            </div>

            {/* Camera Card */}
            <button 
              onClick={() => setIsCameraOpen(true)}
              className="glass-panel p-8 rounded-2xl hover:bg-slate-800/80 transition cursor-pointer group flex flex-col items-center gap-4 border border-white/5 text-left"
            >
              <div className="p-4 rounded-full bg-slate-700/50 group-hover:bg-purple-600/20 group-hover:text-purple-400 transition">
                <CameraIcon className="w-10 h-10 text-slate-300 group-hover:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold">Use Camera</h3>
              <p className="text-sm text-slate-400 text-center">Take a quick selfie for instant analysis</p>
            </button>

          </div>
        )}

        {/* Camera View */}
        {isCameraOpen && (
          <div className="max-w-2xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            <Camera 
              onCapture={handleCapture} 
              onCancel={() => setIsCameraOpen(false)} 
            />
          </div>
        )}

        {/* Loading State */}
        {appState === AppState.ANALYZING && (
          <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 blur-xl absolute opacity-20"></div>
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin z-10 mb-6"></div>
            <h3 className="text-2xl font-bold text-white mb-2">Analyzing Face...</h3>
            <p className="text-slate-400">Extracting features and writing description script</p>
          </div>
        )}

        {/* Results View */}
        {(appState === AppState.COMPLETE || appState === AppState.GENERATING_IMAGE) && (
          <Results 
            script={script}
            generatedImageBase64={generatedImage}
            isLoadingImage={appState === AppState.GENERATING_IMAGE}
            onGenerateImage={handleGenerateAvatar}
            onReset={handleReset}
          />
        )}

        {/* Error State */}
        {appState === AppState.ERROR && (
           <div className="text-center py-20">
             <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-6 rounded-lg max-w-md mx-auto">
               <h3 className="text-xl font-bold mb-2">Oops!</h3>
               <p>{errorMsg}</p>
               <button 
                onClick={handleReset}
                className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white font-medium transition"
               >
                 Try Again
               </button>
             </div>
           </div>
        )}

      </main>
    </div>
  );
};

export default App;