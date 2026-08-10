import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, KeyRound, Send, CheckCircle2, Lock, Eye, EyeOff, ShieldAlert, PhoneCall, Check, AlertCircle } from 'lucide-react';
import { store } from '../../data/storage';
import { validatePassword, getPasswordChecklist } from '../../utils/passwordValidator';

export const ResetPasswordModal = ({ isOpen, onClose, worker, state }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  if (!isOpen || !worker) return null;

  const resetRequests = state?.passwordResetRequests || store.getState()?.passwordResetRequests || [];
  const activeRequest = resetRequests.find(r => r.userId === worker.id && r.status !== 'completed');
  const checklist = getPasswordChecklist(newPassword);
  const isAdminSession = state?.activeRole === 'admin' || state?.activeUserId === 'usr-1';

  const handleSendRequest = () => {
    store.requestPasswordReset(worker.id);
  };

  const handleCompleteReset = (e) => {
    e.preventDefault();

    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      store.showToast({ title: validation.message, type: 'warning' });
      return;
    }

    if (worker?.password && newPassword === worker.password) {
      store.showToast({ title: 'New password cannot be the same as your current password', type: 'warning' });
      return;
    }

    if (newPassword !== confirmPassword) {
      store.showToast({ title: 'Passwords do not match', type: 'warning' });
      return;
    }

    if (isAdminSession) {
      store.updateUser(worker.id, { password: newPassword });
      store.showToast({ title: `Password updated for ${worker.name}`, type: 'success' });
      setNewPassword('');
      setConfirmPassword('');
      onClose();
      return;
    }

    if (!activeRequest || activeRequest.status !== 'approved') {
      store.showToast({ title: 'Admin approval is required before changing password', type: 'alert' });
      return;
    }

    const success = store.completePasswordReset(activeRequest.id, newPassword);
    if (success) {
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white text-[#241b0f] rounded-3xl shadow-2xl border border-[#e2cbb6] p-6 max-w-md w-full space-y-5 relative animate-modal-pop">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-[#EEF0F5] pb-3">
          <div className="w-10 h-10 rounded-2xl bg-[#f4e7d7] text-[#cf8730] flex items-center justify-center shrink-0">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-[#241b0f]">
              {isAdminSession ? `Reset Password: ${worker.name}` : 'Password Change Approval'}
            </h3>
            <p className="text-xs text-slate-500">
              {isAdminSession ? 'Admin Direct Password Reset (No Approval Required)' : 'Requires Admin Approval to Set New Password'}
            </p>
          </div>
        </div>

        {/* Target Worker Card Summary */}
        <div className="p-3 rounded-2xl bg-[#f4e7d7]/40 border border-[#e2cbb6] flex items-center justify-between text-xs">
          <div>
            <p className="font-black text-[#241b0f]">{worker.name}</p>
            <p className="text-[10px] text-slate-500 font-medium">{worker.roleName || 'Worker'}</p>
          </div>
          <span className="px-2.5 py-1 rounded-xl bg-[#cf8730] text-white font-mono font-extrabold text-xs">
            {worker.workerId}
          </span>
        </div>

        <div className="space-y-4 text-xs">
          {/* ADMIN SESSION: Direct Password Reset Form */}
          {isAdminSession ? (
            <form onSubmit={handleCompleteReset} className="space-y-3.5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 animate-in fade-in">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                <span>Admin Direct Password Reset:</span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">New Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-white border border-emerald-300 font-mono font-bold text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-1"
                    title={showNewPassword ? "Hide Password" : "Show Password"}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Live Password Requirements Badge */}
              <div className="p-3 rounded-xl bg-white border border-emerald-200/80 space-y-1.5 text-[10px]">
                <p className="font-bold text-slate-700">Password Requirements (8-16 characters):</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 font-medium">
                  {checklist.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-1.5 transition-colors ${
                        item.pass ? 'text-emerald-700 font-bold' : 'text-slate-500'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] shrink-0 ${
                        item.pass ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {item.pass ? '✓' : '•'}
                      </div>
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Red Error: New password same as current password */}
              {newPassword && worker?.password && newPassword === worker.password && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2 text-xs font-bold animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-extrabold text-rose-900">Cannot Reuse Current Password</p>
                    <p className="text-[11px] font-medium text-rose-700 leading-tight">Your new password cannot be the same as your existing password. Please type a different password.</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Confirm New Password *</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className={`w-full pl-9 pr-10 py-2.5 rounded-xl bg-white border font-mono font-bold text-xs text-slate-900 focus:outline-none focus:ring-2 ${
                      confirmPassword && confirmPassword !== newPassword
                        ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/20'
                        : 'border-emerald-300 focus:ring-emerald-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-1"
                    title={showConfirmPassword ? "Hide Password" : "Show Password"}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Red Error: Confirm Password does not match */}
              {confirmPassword && newPassword !== confirmPassword && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2 text-xs font-bold animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Passwords do not match! Please check both fields.</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-extrabold text-xs shadow-md hover:bg-emerald-700 transition-all cursor-pointer"
              >
                Save New Password Directly
              </button>
            </form>
          ) : (
            <>
              {/* WORKER SESSION WITH APPROVAL STEPS */}
              {!activeRequest && (
                <div className="space-y-3 animate-in fade-in">
                  <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-[11px] leading-relaxed space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-amber-900">
                      <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Admin Approval Required</span>
                    </div>
                    <p className="text-slate-600">
                      Worker passwords are secure. Click below to send a password change request to Admin <strong>Rajesh Sharma</strong>. Once Admin clicks <strong>Approve</strong>, you can enter your new password here!
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleSendRequest}
                    className="w-full py-3 rounded-xl bg-[#cf8730] text-white font-extrabold text-xs shadow-md shadow-[#cf8730]/25 hover:bg-[#b87e47] transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Password Reset Request to Admin</span>
                  </button>
                </div>
              )}

          {/* STEP 2: Request Pending Admin Approval */}
          {activeRequest && activeRequest.status === 'pending' && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-3 animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                <span>Request Pending Admin Approval</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Your request has been sent to Admin <strong>Rajesh Sharma</strong>. You cannot change your password until Admin approves it. Check back here as soon as Admin gives approval!
              </p>
              <div className="p-2.5 bg-amber-100/60 rounded-xl text-[10px] font-bold text-amber-900 flex items-center justify-between">
                <span>Status: Waiting for Admin</span>
                <span className="font-mono text-amber-700">{new Date(activeRequest.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          )}

          {/* STEP 3: Admin Approved - Enter & Save New Password */}
          {activeRequest && activeRequest.status === 'approved' && (
            <form onSubmit={handleCompleteReset} className="space-y-3.5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 animate-in fade-in">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                <span>Request Approved by Admin! Enter New Password:</span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">New Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-white border border-emerald-300 font-mono font-bold text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-1"
                    title={showNewPassword ? "Hide Password" : "Show Password"}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Live Password Requirements Badge */}
              <div className="p-3 rounded-xl bg-white border border-emerald-200/80 space-y-1.5 text-[10px]">
                <p className="font-bold text-slate-700">Password Requirements (8-16 characters):</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 font-medium">
                  {checklist.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-1.5 transition-colors ${
                        item.pass ? 'text-emerald-700 font-bold' : 'text-slate-500'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] shrink-0 ${
                        item.pass ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {item.pass ? '✓' : '•'}
                      </div>
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Red Error: New password same as current password */}
              {newPassword && worker?.password && newPassword === worker.password && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2 text-xs font-bold animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-extrabold text-rose-900">Cannot Reuse Current Password</p>
                    <p className="text-[11px] font-medium text-rose-700 leading-tight">Your new password cannot be the same as your existing password. Please type a different password.</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Confirm New Password *</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className={`w-full pl-9 pr-10 py-2.5 rounded-xl bg-white border font-mono font-bold text-xs text-slate-900 focus:outline-none focus:ring-2 ${
                      confirmPassword && confirmPassword !== newPassword
                        ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/20'
                        : 'border-emerald-300 focus:ring-emerald-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-1"
                    title={showConfirmPassword ? "Hide Password" : "Show Password"}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Red Error: Confirm Password does not match */}
              {confirmPassword && newPassword !== confirmPassword && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2 text-xs font-bold animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Passwords do not match! Please check both fields.</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-extrabold text-xs shadow-md hover:bg-emerald-700 transition-all cursor-pointer"
              >
                Save & Update New Password
              </button>
            </form>
          )}
        </>
      )}

          {/* Admin Contact Info (For Worker view only) */}
          {!isAdminSession && (
            <div className="p-3.5 rounded-2xl bg-[#241b0f] text-white flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#cf8730] text-white flex items-center justify-center shrink-0">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-extrabold text-xs">Rajesh Sharma</p>
                  <p className="text-[10px] text-[#e2cbb6]">Mill Manager & Admin</p>
                </div>
              </div>
              <span className="font-mono text-xs font-extrabold text-[#cf8730]">+91 98765 43210</span>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
