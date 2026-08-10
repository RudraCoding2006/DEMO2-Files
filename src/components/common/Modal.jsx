import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) => {
  // Lock body scroll when modal is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`w-full ${maxWidth} bg-white dark:bg-[#12162B] text-[#161B26] dark:text-white rounded-3xl shadow-2xl border border-[#e2cbb6] dark:border-[#222943] overflow-hidden transform transition-all max-h-[85vh] sm:max-h-[88vh] flex flex-col animate-modal-pop`}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EEF0F5] dark:border-[#222943] bg-white dark:bg-[#12162B] shrink-0">
          <h3 className="text-base sm:text-lg font-extrabold text-[#161B26] dark:text-white truncate">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 dark:bg-[#1C2237] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};
