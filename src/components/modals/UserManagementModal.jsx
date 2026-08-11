import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { USER_ROLES } from '../../data/masterData';
import { MODULES } from '../layout/Sidebar';
import { store } from '../../data/storage';
import { validatePassword } from '../../utils/passwordValidator';
import {
  X,
  UserPlus,
  Users,
  ShieldCheck,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  Search,
  User,
  KeyRound,
  CheckSquare,
  Square,
  Activity,
  Clock,
  CheckCircle2,
  Zap,
  UserCheck,
  RefreshCw,
  SlidersHorizontal,
  Plus
} from 'lucide-react';

import { ConfirmationModal } from '../common/ConfirmationModal';
import { ResetPasswordModal } from './ResetPasswordModal';

export const UserManagementModal = ({ isOpen, onClose, state }) => {
  const [activeTab, setActiveTab] = useState('matrix'); // 'matrix' | 'list' | 'add' | 'edit' | 'audit'
  const [targetResetWorker, setTargetResetWorker] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [auditFilter, setAuditFilter] = useState('all'); // 'all' | 'login' | 'password_change' | 'permission_change'
  const [selectedUser, setSelectedUser] = useState(null);
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [showFormPassword, setShowFormPassword] = useState(false);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Delete Worker',
    type: 'danger',
    icon: null,
    onConfirm: () => {}
  });

  // Form State
  const [formData, setFormData] = useState({
    workerId: '',
    name: '',
    username: '',
    password: '',
    roleId: 'plant_manager',
    email: '',
    phone: '',
    status: 'active',
    allowedModules: ['dashboard', 'raw-material', 'pulp-mill']
  });

  const users = state?.users || [];
  const auditLogs = state?.auditLogs || [];

  // Lock background body scroll when modal is active so mouse wheel only scrolls modal content!
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

  const isAdmin = state?.activeRole === 'admin';
  if (!isOpen || !isAdmin) return null;

  const togglePasswordVisibility = (id) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleOpenAdd = () => {
    setFormData({
      workerId: `EMP-00${users.length + 1}`,
      name: '',
      username: '',
      password: 'pass@2026',
      roleId: 'plant_manager',
      email: '',
      phone: '',
      status: 'active',
      allowedModules: ['dashboard', 'raw-material', 'pulp-mill', 'machine', 'rewinder', 'boiler', 'etp', 'electricity', 'pending-order', 'finish-stock', 'dispatch', 'store', 'reports']
    });
    setSelectedUser(null);
    setActiveTab('add');
  };

  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      workerId: user.workerId || '',
      name: user.name || '',
      username: user.username || '',
      password: user.password || '',
      roleId: user.roleId || 'plant_manager',
      email: user.email || '',
      phone: user.phone || '',
      status: user.status || 'active',
      allowedModules: user.allowedModules || ['dashboard']
    });
    setActiveTab('edit');
  };

  const handleToggleWorkerPermission = (targetUserId, modId) => {
    const targetUser = users.find(u => u.id === targetUserId);
    if (!targetUser) return;
    const current = targetUser.allowedModules || [];
    const isChecked = current.includes(modId);
    let nextModules = [];
    if (isChecked) {
      nextModules = current.filter(id => id !== modId);
    } else {
      nextModules = [...current, modId];
    }
    store.updateUser(targetUserId, { allowedModules: nextModules });
    const modObj = MODULES.find(m => m.id === modId);
    store.showToast({
      title: `${isChecked ? 'Removed' : 'Granted'} "${modObj?.name || modId}" permission for ${targetUser.name}`,
      type: 'info'
    });
  };

  const handleApplyPulperAbsentPreset = () => {
    const dispatcher = users.find(u => u.id === 'usr-4' || u.roleId === 'dispatch');
    if (!dispatcher) return;
    const currentMods = dispatcher.allowedModules || ['dashboard', 'pending-order', 'finish-stock', 'dispatch'];
    const updatedMods = Array.from(new Set([...currentMods, 'pulp-mill', 'raw-material']));
    store.updateUser(dispatcher.id, { allowedModules: updatedMods });
    store.showToast({
      title: `⚡ Daily Substitute Active: Granted Pulp Mill & Raw Material Stock permissions to Dispatcher ${dispatcher.name}!`,
      type: 'info'
    });
  };

  const handleResetShiftDefaults = () => {
    const defaultMap = {
      'usr-1': ['dashboard', 'raw-material', 'pulp-mill', 'machine', 'rewinder', 'boiler', 'etp', 'electricity', 'pending-order', 'finish-stock', 'dispatch', 'store', 'reports'],
      'usr-2': ['dashboard', 'raw-material', 'pulp-mill', 'machine', 'rewinder', 'boiler', 'etp', 'electricity', 'pending-order', 'finish-stock', 'dispatch', 'store', 'reports'],
      'usr-3': ['dashboard', 'raw-material', 'pulp-mill'],
      'usr-4': ['dashboard', 'pending-order', 'finish-stock', 'dispatch'],
      'usr-5': ['dashboard', 'raw-material', 'store'],
      'usr-6': ['dashboard', 'raw-material', 'pulp-mill', 'machine', 'rewinder', 'boiler', 'etp', 'electricity', 'pending-order', 'finish-stock', 'dispatch', 'store', 'reports']
    };
    users.forEach(u => {
      if (defaultMap[u.id]) {
        store.updateUser(u.id, { allowedModules: defaultMap[u.id] });
      }
    });
    store.showToast({
      title: `↺ Reset all 5 factory operators to standard shift roles!`,
      type: 'info'
    });
  };

  const handleToggleModulePermission = (modId) => {
    setFormData(prev => {
      const current = prev.allowedModules || [];
      if (current.includes(modId)) {
        return { ...prev, allowedModules: current.filter(id => id !== modId) };
      } else {
        return { ...prev, allowedModules: [...current, modId] };
      }
    });
  };

  const handleSelectAllModules = () => {
    const allIds = MODULES.map(m => m.id);
    setFormData(prev => ({ ...prev, allowedModules: allIds }));
  };

  const handleClearAllModules = () => {
    setFormData(prev => ({ ...prev, allowedModules: ['dashboard'] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.username || !formData.password) {
      store.showToast({
        title: 'Please fill in required fields (Name, Username, Password)',
        type: 'alert'
      });
      return;
    }

    const validation = validatePassword(formData.password);
    if (!validation.isValid) {
      store.showToast({ title: validation.message, type: 'warning' });
      return;
    }

    const matchedRole = USER_ROLES.find(r => r.id === formData.roleId);

    if (activeTab === 'add') {
      store.addUser({
        ...formData,
        roleName: matchedRole?.name || 'Operator'
      });
    } else if (activeTab === 'edit' && selectedUser) {
      store.updateUser(selectedUser.id, {
        ...formData,
        roleName: matchedRole?.name || 'Operator'
      });
    }

    setActiveTab('list');
  };

  const handleDelete = (user) => {
    if (user.roleId === 'admin') {
      store.showToast({
        title: 'Admin profile cannot be deleted',
        type: 'alert'
      });
      return;
    }
    setConfirmModal({
      isOpen: true,
      title: `Delete Worker "${user.name}"?`,
      message: `Are you sure you want to remove worker account ${user.name} (${user.workerId})? This action cannot be undone.`,
      confirmText: 'Delete Worker',
      type: 'danger',
      icon: Trash2,
      onConfirm: () => {
        store.deleteUser(user.id);
        setActiveTab('list');
      }
    });
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.workerId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.roleName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAuditLogs = auditLogs.filter(log => {
    if (auditFilter !== 'all' && log.type !== auditFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        log.userName?.toLowerCase().includes(q) ||
        log.workerId?.toLowerCase().includes(q) ||
        log.action?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white text-[#111827] rounded-3xl shadow-2xl border border-[#EEF0F5] w-full max-w-4xl max-h-[85vh] sm:max-h-[88vh] flex flex-col overflow-hidden animate-modal-pop">
        {/* Clean Header Row */}
        <div className="p-4 sm:p-5 bg-white text-[#111827] border-b border-[#EEF0F5] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#cf8730] flex items-center justify-center text-white shadow-md">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold tracking-wide text-[#111827]">Worker & Profile Management</h2>
              <p className="text-xs text-[#6B7280]">Admin Control Panel &bull; Manage Worker Passwords, Permissions & Security Logs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="p-3 bg-[#F5F6FA] border-b border-[#EEF0F5] flex items-center justify-between gap-2 shrink-0 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('matrix')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'matrix'
                  ? 'bg-[#cf8730] text-white shadow-md shadow-[#cf8730]/25'
                  : 'bg-white text-slate-700 hover:bg-slate-100 shadow-2xs'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-white" />
              Roles & Permissions Matrix
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'list'
                  ? 'bg-[#cf8730] text-white shadow-md shadow-[#cf8730]/25'
                  : 'bg-white text-slate-700 hover:bg-slate-100 shadow-2xs'
              }`}
            >
              <Users className="w-4 h-4" />
              All Workers ({users.length})
            </button>
            <button
              onClick={handleOpenAdd}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'add'
                  ? 'bg-[#cf8730] text-white shadow-md shadow-[#cf8730]/25'
                  : 'bg-white text-slate-700 hover:bg-slate-100 shadow-2xs'
              }`}
            >
              <UserPlus className="w-4 h-4 text-[#1FCB79]" />
              Add Worker
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'audit'
                  ? 'bg-[#cf8730] text-white shadow-md shadow-[#cf8730]/25'
                  : 'bg-white text-slate-700 hover:bg-slate-100 shadow-2xs'
              }`}
            >
              <Activity className="w-4 h-4 text-[#cf8730]" />
              Security Audit Logs ({auditLogs.length})
            </button>
          </div>

          {(activeTab === 'matrix' || activeTab === 'list' || activeTab === 'audit') && (
            <div className="relative shrink-0">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={activeTab === 'matrix' ? 'Filter worker permissions...' : activeTab === 'list' ? 'Search workers...' : 'Search security logs...'}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-white border-0 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#cf8730] w-44 sm:w-56 shadow-2xs"
              />
            </div>
          )}
        </div>

        {/* Scrollable Content Body with min-h-0 for proper flex scroll */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 custom-scrollbar min-h-0">
          {/* TAB 0: ROLES & PERMISSIONS MATRIX (ADMIN CONTROL) */}
          {activeTab === 'matrix' && (
            <div className="space-y-5 animate-in fade-in">
              {/* Daily Shift Substitution Presets Banner Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#12162B] via-[#181D35] to-[#1C2237] text-white border border-[#262D4A] shadow-md space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-[#cf8730]/20 text-[#cf8730] flex items-center justify-center font-bold">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-black text-sm text-white flex items-center gap-2">
                        Daily Worker Role & Shift Substitution Control
                      </h3>
                      <p className="text-xs text-slate-400">
                        Admin can dynamically assign or substitute worker roles for shift coverage (e.g. Pulper absent today)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={handleApplyPulperAbsentPreset}
                      className="px-3.5 py-2 rounded-xl bg-[#cf8730] hover:bg-[#b57324] text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                      title="Pulper absent today -> Grant Pulp Mill & Raw Material permissions to Dispatcher Vikram Singh"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-200 fill-amber-200" />
                      Pulper Absent Today ➔ Delegate to Dispatcher
                    </button>
                    <button
                      onClick={handleResetShiftDefaults}
                      className="px-3 py-2 rounded-xl bg-[#252D48] hover:bg-[#2F395A] text-slate-300 font-bold text-xs border border-[#374268] flex items-center gap-1 transition-all cursor-pointer"
                      title="Reset all 7 worker roles to factory shift defaults"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Reset Shift Defaults
                    </button>
                  </div>
                </div>
              </div>

              {/* Factory Workers Matrix Cards */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                    {users.length} Active Factory Workers • Click buttons to grant / revoke permissions
                  </span>
                  <span className="text-[11px] font-semibold text-[#cf8730]">
                    Theme Color Highlighted Buttons (Amber = Active ON)
                  </span>
                </div>

                <div className="space-y-3.5">
                  {filteredUsers.map(u => {
                    const isAdminUser = u.roleId === 'admin';
                    const allowedMods = u.allowedModules || [];

                    return (
                      <div
                        key={u.id}
                        className="p-4 rounded-2xl bg-white border border-[#EEF0F5] shadow-xs hover:shadow-md transition-all space-y-3"
                      >
                        {/* Worker Header Info & Actions */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-xs ${
                              isAdminUser ? 'bg-[#cf8730] text-white' : 'bg-slate-100 text-slate-800 border border-slate-200'
                            }`}>
                              {u.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-extrabold text-sm text-[#161B26]">{u.name}</h4>
                                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono text-[10px] font-bold">
                                  {u.workerId}
                                </span>
                                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-bold">
                                  Active
                                </span>
                              </div>
                              <p className="text-xs text-[#cf8730] font-bold mt-0.5">{u.roleName}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold px-3 py-1 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
                              {allowedMods.length} / {MODULES.length} Modules Active
                            </span>
                            <button
                              onClick={() => {
                                store.setActiveUser(u.id);
                                onClose();
                                store.showToast({
                                  title: `Simulating logged in worker: “${u.name}” (${u.roleName})`,
                                  actionText: 'View Navigation'
                                });
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                                state.activeUserId === u.id
                                  ? 'bg-[#12162B] text-white shadow-xs'
                                  : 'bg-[#F5F6FA] text-slate-700 hover:bg-[#cf8730] hover:text-white'
                              }`}
                            >
                              {state.activeUserId === u.id ? 'Simulating Current User' : 'Simulate Worker Login'}
                            </button>
                          </div>
                        </div>

                        {/* Interactive Dynamic Permission Buttons Grid */}
                        <div>
                          <p className="text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wider">
                            Toggle Module Permissions for {u.name}:
                          </p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                            {MODULES.map(m => {
                              const isAllowed = allowedMods.includes(m.id);
                              const Icon = m.icon;

                              return (
                                <button
                                  type="button"
                                  key={m.id}
                                  onClick={() => handleToggleWorkerPermission(u.id, m.id)}
                                  className={`flex items-center gap-2 p-2.5 rounded-xl text-left text-xs transition-all cursor-pointer font-bold ${
                                    isAllowed
                                      ? 'bg-[#cf8730] text-white border-2 border-[#f5a742] shadow-md shadow-[#cf8730]/20 scale-[1.02]'
                                      : 'bg-[#F5F6FA] text-slate-500 border border-slate-200/80 hover:border-[#cf8730] hover:text-slate-800 opacity-60 hover:opacity-100'
                                  }`}
                                >
                                  {isAllowed ? (
                                    <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                                  ) : (
                                    <Plus className="w-4 h-4 text-slate-400 shrink-0" />
                                  )}
                                  <span className="truncate">{m.name}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: WORKERS LIST */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredUsers.map(u => {
                  const showPass = visiblePasswords[u.id];
                  const isAdmin = u.roleId === 'admin';

                  return (
                    <div
                      key={u.id}
                      className="p-4 rounded-2xl bg-white border border-[#EEF0F5] shadow-xs hover:shadow-md hover:border-[#cf8730]/40 transition-all flex flex-col justify-between space-y-3 relative"
                    >
                      {/* Top Info Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shadow-md ${
                            isAdmin
                              ? 'bg-[#cf8730] text-white'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {u.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-extrabold text-sm text-[#161B26]">{u.name}</h3>
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono text-[10px] font-bold">
                                {u.workerId}
                              </span>
                            </div>
                            <p className="text-xs text-[#cf8730] font-semibold">{u.roleName}</p>
                          </div>
                        </div>
                      </div>

                      {/* Credentials Box */}
                      <div className="p-2.5 rounded-xl bg-[#F5F6FA] border border-slate-200/60 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between text-slate-600">
                          <span className="font-medium flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-slate-400" /> Username:
                          </span>
                          <span className="font-mono font-bold text-slate-900">{u.username}</span>
                        </div>

                        <div className="flex items-center justify-between text-slate-600">
                          <span className="font-medium flex items-center gap-1">
                            <KeyRound className="w-3.5 h-3.5 text-[#cf8730]" /> Password:
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 text-xs">
                              {showPass ? u.password : '••••••••'}
                            </span>
                            <button
                              onClick={() => togglePasswordVisibility(u.id)}
                              className="p-1 rounded text-slate-500 hover:text-[#cf8730] hover:bg-slate-200 cursor-pointer"
                              title={showPass ? 'Hide Password' : 'Show Password'}
                            >
                              {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Category Module Access Badges */}
                      <div>
                        <p className="text-[10px] uppercase tracking-wider font-bold text-[#8A8FA3] mb-1">Allowed Categories & Modules:</p>
                        <div className="flex flex-wrap gap-1">
                          {(u.allowedModules || []).slice(0, 6).map(modId => {
                            const modObj = MODULES.find(m => m.id === modId);
                            return (
                              <span key={modId} className="px-2 py-0.5 rounded-lg bg-[#f4e7d7] text-[#cf8730] border border-[#e2cbb6] text-[10px] font-bold">
                                {modObj?.name || modId}
                              </span>
                            );
                          })}
                          {(u.allowedModules || []).length > 6 && (
                            <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold">
                              +{(u.allowedModules || []).length - 6} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Actions Footer */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <button
                          onClick={() => {
                            store.setActiveUser(u.id);
                            onClose();
                            store.showToast({
                              title: `Switched worker session to “${u.name}”`,
                              actionText: 'View profile'
                            });
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            state.activeUserId === u.id
                              ? 'bg-[#241b0f] text-white shadow-sm'
                              : 'bg-[#cf8730] text-white hover:bg-[#b87e47] shadow-xs'
                          }`}
                        >
                          {state.activeUserId === u.id ? 'Current User' : 'Switch To User'}
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:text-[#cf8730] hover:bg-[#f4e7d7] font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> Edit Details
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2 & 3: ADD / EDIT WORKER FORM */}
          {(activeTab === 'add' || activeTab === 'edit') && (
            <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-base text-[#161B26]">
                  {activeTab === 'add' ? 'Create New Worker Account' : `Edit Worker: ${selectedUser?.name}`}
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="text-xs font-bold text-[#cf8730] hover:underline cursor-pointer"
                >
                  &larr; Back to Worker List
                </button>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Worker ID / Badge Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.workerId}
                    onChange={e => setFormData({ ...formData, workerId: e.target.value })}
                    placeholder="e.g. EMP-006"
                    className="w-full p-2.5 rounded-xl bg-[#F5F6FA] border border-[#EEF0F5] font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#cf8730]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Worker Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full p-2.5 rounded-xl bg-[#F5F6FA] border border-[#EEF0F5] font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#cf8730]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Login Username *</label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                    placeholder="e.g. ramesh_boiler"
                    className="w-full p-2.5 rounded-xl bg-[#F5F6FA] border border-[#EEF0F5] font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#cf8730]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700">
                      {activeTab === 'edit' ? 'Worker Password (Read-Only)' : 'Set Worker Password *'}
                    </label>
                    {activeTab === 'edit' && selectedUser && (
                      <button
                        type="button"
                        onClick={() => {
                          setTargetResetWorker(selectedUser);
                        }}
                        className="px-3 py-1 rounded-xl bg-[#cf8730] text-white hover:bg-[#b87e47] font-extrabold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95"
                        title="Click to Reset Worker Password"
                      >
                        <KeyRound className="w-3.5 h-3.5" /> Reset Password
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showFormPassword ? "text" : "password"}
                      required={activeTab === 'add'}
                      readOnly={activeTab === 'edit'}
                      value={formData.password}
                      onChange={e => {
                        if (activeTab === 'add') {
                          setFormData({ ...formData, password: e.target.value });
                        }
                      }}
                      placeholder={activeTab === 'edit' ? "Worker Password" : "Set Worker Password"}
                      className={`w-full pl-3 pr-10 py-2.5 rounded-xl font-mono font-bold text-slate-900 focus:outline-none ${
                        activeTab === 'edit'
                          ? 'bg-slate-100 border border-slate-200 cursor-default'
                          : 'bg-[#F5F6FA] border border-[#EEF0F5] focus:ring-2 focus:ring-[#cf8730]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowFormPassword(!showFormPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-1"
                      title={showFormPassword ? "Hide Password" : "Show Password"}
                    >
                      {showFormPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mill Designation / Role *</label>
                  <select
                    value={formData.roleId}
                    onChange={e => setFormData({ ...formData, roleId: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#F5F6FA] border border-[#EEF0F5] font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#cf8730]"
                  >
                    {USER_ROLES.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Account Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#F5F6FA] border border-[#EEF0F5] font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#cf8730]"
                  >
                    <option value="active">Active (Full Access Enabled)</option>
                    <option value="inactive">Inactive (Suspended)</option>
                  </select>
                </div>
              </div>

              {/* Module & Category Permission Matrix */}
              <div className="p-4 rounded-2xl bg-[#F5F6FA] border border-[#EEF0F5] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-sm text-[#161B26] flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#cf8730]" /> Assigned Module Permissions (Category Access)
                    </h4>
                    <p className="text-[11px] text-[#8A8FA3]">Workers can only view and operate modules selected below</p>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={handleSelectAllModules}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[#cf8730] font-bold hover:bg-[#f4e7d7] cursor-pointer"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={handleClearAllModules}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-2">
                  {MODULES.map(m => {
                    const isChecked = (formData.allowedModules || []).includes(m.id);
                    return (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => handleToggleModulePermission(m.id)}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-white border-[#cf8730] text-[#cf8730] shadow-xs'
                            : 'bg-white/60 border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        {isChecked ? <CheckSquare className="w-4 h-4 text-[#cf8730] shrink-0" /> : <Square className="w-4 h-4 text-slate-300 shrink-0" />}
                        <span className="truncate">{m.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                {activeTab === 'edit' && selectedUser && selectedUser.roleId !== 'admin' ? (
                  <button
                    type="button"
                    onClick={() => handleDelete(selectedUser)}
                    className="px-4 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 font-bold text-xs hover:bg-rose-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 text-rose-500" />
                    Delete Worker Account
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('list')}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#cf8730] text-white font-bold text-xs shadow-lg shadow-[#cf8730]/25 hover:bg-[#b87e47] cursor-pointer"
                  >
                    {activeTab === 'add' ? 'Create Worker Account' : 'Save Worker Changes'}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 4: SECURITY AUDIT LOGS */}
          {activeTab === 'audit' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-extrabold text-sm text-[#161B26] flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#cf8730]" /> System Security & Access Audit Logs
                  </h3>
                  <p className="text-[11px] text-slate-500">Chronological history of worker logins, password changes & permission updates</p>
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                  {['all', 'login', 'password_change', 'permission_change'].map(filterType => (
                    <button
                      key={filterType}
                      onClick={() => setAuditFilter(filterType)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        auditFilter === filterType
                          ? 'bg-[#241b0f] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {filterType === 'all' ? 'All Logs' : filterType === 'login' ? 'Logins' : filterType === 'password_change' ? 'Password Changes' : 'Permissions'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Logs List View */}
              <div className="space-y-2.5">
                {filteredAuditLogs.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                    <ShieldCheck className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="font-bold text-xs text-slate-600">No security audit logs found</p>
                  </div>
                ) : (
                  filteredAuditLogs.map(log => {
                    let isPassChange = log.type === 'password_change';
                    let isLogin = log.type === 'login';
                    let isDeleted = log.type === 'user_deleted';

                    return (
                      <div
                        key={log.id}
                        className="p-3.5 rounded-2xl bg-white border border-[#EEF0F5] shadow-2xs hover:shadow-xs transition-all flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 mt-0.5 ${
                            isPassChange
                              ? 'bg-amber-100 text-amber-700 border border-amber-200'
                              : isLogin
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                              : isDeleted
                              ? 'bg-rose-100 text-rose-700 border border-rose-200'
                              : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                          }`}>
                            {isPassChange ? <KeyRound className="w-4 h-4" /> : isLogin ? <User className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                          </div>

                          <div className="min-w-0 space-y-0.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-extrabold text-slate-900">{log.userName}</span>
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono text-[10px] font-bold">
                                {log.workerId}
                              </span>
                              <span className={`px-2 py-0.5 rounded-md font-extrabold text-[9px] uppercase tracking-wider ${
                                isPassChange
                                  ? 'bg-amber-100 text-amber-800'
                                  : isLogin
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}>
                                {log.type.replace('_', ' ')}
                              </span>
                            </div>
                            <p className="text-slate-700 font-medium leading-relaxed">{log.action}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 shrink-0 mt-1 font-mono">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{log.formattedTime}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal UI */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        type={confirmModal.type}
        icon={confirmModal.icon}
      />

      {/* Direct Reset Password Modal for Target Worker */}
      <ResetPasswordModal
        isOpen={!!targetResetWorker}
        onClose={() => setTargetResetWorker(null)}
        worker={targetResetWorker}
        state={state}
      />
    </div>,
    document.body
  );
};
