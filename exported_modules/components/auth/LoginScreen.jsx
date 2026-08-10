import React, { useState } from 'react';
import { store } from '../../data/storage';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  KeyRound,
  X,
  PhoneCall,
  CheckCircle2,
  Send
} from 'lucide-react';
import { validatePassword } from '../../utils/passwordValidator';

export const LoginScreen = ({ state }) => {
  const users = state?.users || [];

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const passwordResetRequests = state?.passwordResetRequests || [];
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [activeRequest, setActiveRequest] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!username || !password) {
      store.showToast({
        title: 'Please enter both username and password',
        type: 'warning'
      });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      store.login(username, password);
    }, 150);
  };

  const handleSelectWorker = (wId) => {
    setSelectedWorkerId(wId);
    const existing = passwordResetRequests.find(r => r.userId === wId && r.status !== 'completed');
    setActiveRequest(existing || null);
  };

  const handleSendResetRequest = (e) => {
    e.preventDefault();
    if (!selectedWorkerId) {
      store.showToast({ title: 'Please select your worker account', type: 'warning' });
      return;
    }
    const req = store.requestPasswordReset(selectedWorkerId);
    setActiveRequest(req);
  };

  const handleCompleteReset = (e) => {
    e.preventDefault();
    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      store.showToast({ title: validation.message, type: 'warning' });
      return;
    }
    if (newPassword !== confirmPassword) {
      store.showToast({ title: 'Passwords do not match', type: 'warning' });
      return;
    }
    if (activeRequest) {
      const ok = store.completePasswordReset(activeRequest.id, newPassword);
      if (ok) {
        setIsForgotPasswordOpen(false);
        setSelectedWorkerId('');
        setNewPassword('');
        setConfirmPassword('');
        setActiveRequest(null);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#eee0d3] text-[#241b0f] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans selection:bg-[#cf8730] selection:text-white">
      {/* Soft Ambient Background Glow Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#cf8730]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#b87e47]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10 animate-in fade-in zoom-in-95 duration-300">
        {/* Company Header Branding */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-[#cf8730] text-white flex items-center justify-center font-extrabold text-2xl shadow-xl shadow-[#cf8730]/25 mx-auto hover:scale-105 transition-transform">
            SP
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wide text-[#241b0f]">SAHEB PAPER</h1>
            <p className="text-xs text-[#cf8730] font-bold uppercase tracking-widest mt-1">Unit 1 Tissue Line &bull; Stock & Mill ERP</p>
          </div>
        </div>

        {/* Login Form Card (Warm Earthen Theme) */}
        <div className="bg-white border border-[#e2cbb6] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 text-[#241b0f]">
          <div className="border-b border-[#EEF0F5] pb-4">
            <h2 className="text-lg font-extrabold text-[#241b0f] flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#cf8730]" /> Sign In to Mill ERP
            </h2>
            <p className="text-xs text-[#916c3b] mt-0.5">Enter your worker username or badge ID to continue</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            {/* Standard Typeable Username Input Field */}
            <div>
              <label className="block font-bold text-[#48361e] mb-1.5">Worker Username / Badge ID</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="e.g. admin or EMP-001"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#f4e7d7]/40 border border-[#e2cbb6] font-semibold text-[#241b0f] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#cf8730] focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block font-bold text-[#48361e] mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-2xl bg-[#f4e7d7]/40 border border-[#e2cbb6] font-mono font-bold text-[#241b0f] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#cf8730] focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#cf8730] transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-slate-600 text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="rounded border-[#e2cbb6] text-[#cf8730] focus:ring-0 cursor-pointer"
                />
                <span className="font-semibold text-slate-700">Remember session</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setIsForgotPasswordOpen(true);
                  setResetSuccessMsg('');
                }}
                className="text-[#cf8730] hover:underline font-bold cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-[#cf8730] text-white font-extrabold text-xs shadow-lg shadow-[#cf8730]/25 hover:bg-[#b87e47] active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              {loading ? (
                <span>Signing In...</span>
              ) : (
                <>
                  <span>Log In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-slate-500 font-medium">
          Saheb Paper Pvt. Ltd. &copy; 2026 &bull; Secure Mill Access
        </p>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      {isForgotPasswordOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white text-[#241b0f] rounded-3xl shadow-2xl border border-[#e2cbb6] p-6 max-w-md w-full space-y-5 relative animate-modal-pop">
            <button
              onClick={() => {
                setIsForgotPasswordOpen(false);
                setSelectedWorkerId('');
                setActiveRequest(null);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-[#EEF0F5] pb-3">
              <div className="w-10 h-10 rounded-2xl bg-[#f4e7d7] text-[#cf8730] flex items-center justify-center shrink-0">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#241b0f]">Worker Password Recovery</h3>
                <p className="text-xs text-slate-500">Request Admin Approval & Set New Password</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {/* Account Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Your Worker Account *</label>
                <select
                  value={selectedWorkerId}
                  onChange={e => handleSelectWorker(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#f4e7d7]/40 border border-[#e2cbb6] font-semibold text-[#241b0f] focus:outline-none focus:ring-2 focus:ring-[#cf8730] cursor-pointer"
                >
                  <option value="">-- Choose Worker Account --</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.roleName} &bull; {u.workerId})
                    </option>
                  ))}
                </select>
              </div>

              {/* Status 1: Initial Request Form */}
              {selectedWorkerId && !activeRequest && (
                <div className="space-y-3 animate-in fade-in">
                  <div className="p-3.5 rounded-2xl bg-[#f4e7d7]/50 border border-[#e2cbb6] text-[11px] text-slate-700 leading-relaxed">
                    Clicking below will send a password reset notification to Admin <strong>Rajesh Sharma</strong>. Once approved, you can enter your new password here!
                  </div>
                  <button
                    type="button"
                    onClick={handleSendResetRequest}
                    className="w-full py-3 rounded-xl bg-[#cf8730] text-white font-extrabold text-xs shadow-md shadow-[#cf8730]/25 hover:bg-[#b87e47] transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Password Reset Request to Admin</span>
                  </button>
                </div>
              )}

              {/* Status 2: Pending Approval */}
              {activeRequest && activeRequest.status === 'pending' && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2 animate-in fade-in">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                    <span>Reset Request Pending Admin Approval</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Your reset request for <strong>{activeRequest.userName}</strong> has been sent to Admin Rajesh Sharma. As soon as Admin clicks <strong>Approve</strong>, you can set your new password here!
                  </p>
                </div>
              )}

              {/* Status 3: Approved - Enter New Password Page */}
              {activeRequest && activeRequest.status === 'approved' && (
                <form onSubmit={handleCompleteReset} className="space-y-3.5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 animate-in fade-in">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                    <span>Request Approved by Admin! Enter New Password:</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">New Password *</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full p-2.5 rounded-xl bg-white border border-emerald-300 font-mono font-bold text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Confirm New Password *</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full p-2.5 rounded-xl bg-white border border-emerald-300 font-mono font-bold text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-extrabold text-xs shadow-md hover:bg-emerald-700 transition-all cursor-pointer"
                  >
                    Save & Update New Password
                  </button>
                </form>
              )}

              {/* Admin Contact Info */}
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
