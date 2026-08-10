import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, User, Phone, Mail, Save, KeyRound, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { store } from '../../data/storage';
import { ResetPasswordModal } from './ResetPasswordModal';

export const EditProfileModal = ({ isOpen, onClose, activeUser, state }) => {
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  });

  useEffect(() => {
    if (activeUser) {
      setFormData({
        name: activeUser.name || '',
        phone: activeUser.phone || '',
        email: activeUser.email || ''
      });
    }
  }, [activeUser, isOpen]);

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

  if (!isOpen || !activeUser) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      store.showToast({ title: 'Please enter your name', type: 'warning' });
      return;
    }

    store.updateUser(activeUser.id, {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim()
    });

    onClose();
  };

  return createPortal(
    <>
      <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="bg-white text-[#241b0f] rounded-3xl shadow-2xl border border-[#e2cbb6] p-6 max-w-md w-full space-y-5 relative animate-modal-pop">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 border-b border-[#EEF0F5] pb-3">
            <div className="w-10 h-10 rounded-2xl bg-[#f4e7d7] text-[#cf8730] flex items-center justify-center shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#241b0f]">Edit Worker Profile</h3>
              <p className="text-xs text-[#916c3b]">Update your personal details & request password reset</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Readonly Badge Info */}
            <div className="p-3 rounded-2xl bg-[#f4e7d7]/40 border border-[#e2cbb6] flex items-center justify-between text-xs">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Worker Role & Badge</p>
                <p className="font-extrabold text-[#241b0f] mt-0.5">{activeUser.roleName}</p>
              </div>
              <span className="px-2.5 py-1 rounded-xl bg-[#cf8730] text-white font-mono font-extrabold text-xs">
                {activeUser.workerId}
              </span>
            </div>

            {/* Name Input */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#cf8730] focus:bg-white"
                />
              </div>
            </div>

            {/* Phone & Email Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#cf8730] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="worker@sahebpaper.com"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#cf8730] focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Dedicated Reset Password Section */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Your Current Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    readOnly
                    value={activeUser.password || '••••••••'}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-100 border border-slate-200 font-mono font-bold text-slate-900 focus:outline-none cursor-default"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-1"
                    title={showCurrentPassword ? "Hide Password" : "Show Password"}
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#f4e7d7]/40 border border-[#e2cbb6] flex items-center justify-between gap-2">
                <div>
                  <p className="font-extrabold text-xs text-[#241b0f]">Want to change password?</p>
                  <p className="text-[10px] text-slate-500 font-medium">Requires Admin Rajesh Sharma Approval</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsResetPasswordOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-[#cf8730] text-white hover:bg-[#b87e47] font-extrabold text-xs shadow-md shadow-[#cf8730]/25 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Reset Password</span>
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#cf8730] text-white font-extrabold shadow-md shadow-[#cf8730]/25 hover:bg-[#b87e47] cursor-pointer flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Render Dedicated Reset Password Approval Modal */}
      <ResetPasswordModal
        isOpen={isResetPasswordOpen}
        onClose={() => setIsResetPasswordOpen(false)}
        worker={activeUser}
        state={state}
      />
    </>,
    document.body
  );
};
