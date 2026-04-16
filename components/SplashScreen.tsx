import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';

export const SplashScreen: React.FC = () => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="fixed inset-0 z-[100] bg-[#9AAB89] flex flex-col items-center justify-center transition-opacity duration-500">
      <div className="flex flex-col items-center justify-center gap-10 animate-in fade-in zoom-in duration-700">
        {!imgError ? (
           <img 
             src="https://raiyansoft.com/wp-content/uploads/2026/02/icon-s.png"
             alt="Khadam App Logo"
             className="w-36 h-36 object-contain drop-shadow-lg"
             onError={() => setImgError(true)}
           />
        ) : (
           <div className="w-36 h-36 flex items-center justify-center bg-white/20 rounded-full backdrop-blur-sm shadow-inner border border-white/10">
             <ShieldCheck size={64} className="text-white" />
           </div>
        )}
        {/* Loading Spinner */}
        <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    </div>
  );
};