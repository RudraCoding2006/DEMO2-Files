import React, { useEffect } from 'react';
import { AlertTriangle, RefreshCw, HelpCircle, X } from 'lucide-react';

export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger', // 'danger' | 'warning' | 'info'
  icon: CustomIcon
}) => {
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

  let IconComponent = CustomIcon;
  let iconBadgeClass = 'bg-rose-100 text-rose-600 ring-4 ring-rose-50';
  let buttonBgClass = 'bg-[#F1533C] hover:bg-[#d9442d] text-white shadow-md shadow-rose-500/20';

  if (type === 'warning') {
    if (!IconComponent) IconComponent = RefreshCw;
    iconBadgeClass = 'bg-amber-100 text-amber-600 ring-4 ring-amber-50';
    buttonBgClass = 'bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20';
  } else if (type === 'info') {
    if (!IconComponent) IconComponent = HelpCircle;
    iconBadgeClass = 'bg-amber-100 text-amber-600 ring-4 ring-amber-50';
    buttonBgClass = 'bg-[#cf8730] hover:bg-[#b87528] text-white shadow-md shadow-[#cf8730]/20';
  } else {
    if (!IconComponent) IconComponent = AlertTriangle;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white text-[#111827] rounded-2xl shadow-2xl border border-[#EEF0F5] p-6 max-w-sm w-full space-y-5 text-center relative animate-modal-pop">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Circular Severity Icon Badge */}
        <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto transition-transform ${iconBadgeClass}`}>
          {IconComponent && <IconComponent className="w-7 h-7" />}
        </div>

        {/* Title & Message */}
        <div className="space-y-1.5">
          <h3 className="font-extrabold text-base sm:text-lg text-[#111827] leading-tight">
            {title || 'Are you sure?'}
          </h3>
          <p className="text-xs text-[#6B7280] leading-relaxed font-medium">
            {message}
          </p>
        </div>

        {/* Bottom-Right Aligned Two-Button Layout */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 font-bold text-xs hover:bg-slate-100 transition-all cursor-pointer active:scale-95"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer active:scale-95 ${buttonBgClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
