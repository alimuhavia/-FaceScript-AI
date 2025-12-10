import React, { useRef, useState, useEffect } from 'react';
import { CameraIcon } from './Icons';

interface CameraProps {
  onCapture: (base64: string) => void;
  onCancel: () => void;
}

const Camera: React.FC<CameraProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError("Unable to access camera. Please allow camera permissions.");
        console.error(err);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        // Set canvas dimensions to match video dimensions
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        
        context.drawImage(videoRef.current, 0, 0);
        
        // Convert to base64
        const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.8);
        // Remove prefix for API usage if needed, but usually we handle it in service
        // Service expects full or stripped? Let's send stripped in service layer.
        // Actually, let's keep it clean here.
        const base64 = dataUrl.split(',')[1]; 
        onCapture(base64);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-black rounded-xl overflow-hidden relative w-full h-full min-h-[400px]">
      {error ? (
        <div className="text-red-400 text-center">
          <p>{error}</p>
          <button onClick={onCancel} className="mt-4 px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition">
            Close Camera
          </button>
        </div>
      ) : (
        <>
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover rounded-lg absolute inset-0 z-0"
          />
          <canvas ref={canvasRef} className="hidden" />
          
          <div className="absolute bottom-6 flex gap-4 z-10">
            <button 
              onClick={onCancel}
              className="px-6 py-2 rounded-full bg-slate-800/80 text-white backdrop-blur-md hover:bg-slate-700 transition font-medium"
            >
              Cancel
            </button>
            <button 
              onClick={capture}
              className="px-6 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-500 transition flex items-center gap-2 font-bold shadow-lg shadow-blue-500/20"
            >
              <CameraIcon className="w-5 h-5" />
              Capture
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Camera;