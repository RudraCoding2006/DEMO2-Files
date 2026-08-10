import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, X, RotateCcw } from 'lucide-react';

export const ToastNotification = ({ toast, onClose, onViewProfile }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (toast) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Allow fade out animation
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type !== 'error' && toast.type !== 'alert';

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transition-all duration-300 transform ${
        isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-95'
      }`}
    >
      <div className="bg-[#241b0f] text-white border border-[#48361e] rounded-2xl p-4 shadow-2xl min-w-[300px] sm:min-w-[360px] max-w-md flex items-start gap-3.5">
        {/* Double-Ring Circle Icon Badge (Demo 2 Green/Amber Palette) */}
        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 ${
          isSuccess
            ? 'border-[#1FCB79]/50 bg-[#1FCB79]/15 text-[#1FCB79]'
            : 'border-rose-500/50 bg-rose-500/15 text-rose-400'
        }`}>
          {isSuccess ? (
            <CheckCircle2 className="w-5 h-5 text-[#1FCB79]" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400" />
          )}
        </div>

        {/* Message Content */}
        <div className="flex-1 min-w-0 pr-2">
          <p className="font-bold text-xs sm:text-sm text-[#f8f3ed] leading-snug break-words">
            {toast.title || toast.message}
          </p>

          {/* Action Links */}
          <div className="mt-1.5 flex items-center gap-4 text-xs font-semibold">
            {toast.onUndo && (
              <button
                onClick={() => {
                  toast.onUndo();
                  setIsVisible(false);
                  setTimeout(onClose, 200);
                }}
                className="text-[#d3b792] hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Undo
              </button>
            )}

            {toast.actionText && toast.onAction && (
              <button
                onClick={() => {
                  toast.onAction();
                  setIsVisible(false);
                  setTimeout(onClose, 200);
                }}
                className="text-[#cf8730] hover:text-[#e1cfb7] font-extrabold transition-colors hover:underline cursor-pointer"
              >
                {toast.actionText}
              </button>
            )}

            {(!toast.actionText && onViewProfile) && (
              <button
                onClick={() => {
                  onViewProfile();
                  setIsVisible(false);
                  setTimeout(onClose, 200);
                }}
                className="text-[#cf8730] hover:text-[#e1cfb7] font-extrabold hover:underline cursor-pointer"
              >
                View profile
              </button>
            )}
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 200);
          }}
          className="p-1 rounded-lg text-[#d3b792] hover:text-white hover:bg-[#48361e] transition-colors shrink-0 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
