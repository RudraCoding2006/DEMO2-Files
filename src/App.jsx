import React, { useState, useEffect, useRef } from 'react';
import { store } from './data/storage';
import { Sidebar, MODULES } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { ScrollToTopButton } from './components/common/ScrollToTopButton';
import { ToastNotification } from './components/common/ToastNotification';
import { UserManagementModal } from './components/modals/UserManagementModal';
import { LoginScreen } from './components/auth/LoginScreen';
import { ChatBot } from './components/chat/ChatBot';
import { ShieldAlert } from 'lucide-react';

// Modules
import { DashboardModule } from './modules/dashboard/DashboardModule';
import { RawMaterialModule } from './modules/raw-material/RawMaterialModule';
import { PulpMillModule } from './modules/pulp-mill/PulpMillModule';
import { MachineModule } from './modules/machine/MachineModule';
import { RewinderModule } from './modules/rewinder/RewinderModule';
import { BoilerModule } from './modules/boiler/BoilerModule';
import { EtpModule } from './modules/etp/EtpModule';
import { ElectricityModule } from './modules/electricity/ElectricityModule';
import { PendingOrderModule } from './modules/pending-order/PendingOrderModule';
import { FinishStockModule } from './modules/finish-stock/FinishStockModule';
import { DispatchModule } from './modules/dispatch/DispatchModule';
import { StoreModule } from './modules/store/StoreModule';
import { ReportsModule } from './modules/reports/ReportsModule';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ERP Render Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0B0E1B] text-white flex flex-col items-center justify-center p-6 text-center space-y-4 font-sans">
          <div className="w-16 h-16 rounded-2xl bg-[#5B4FE9] flex items-center justify-center font-extrabold text-2xl shadow-xl shadow-[#5B4FE9]/30">
            SP
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Saheb Paper ERP &bull; View Restored</h2>
            <p className="text-xs text-rose-300 font-mono mt-1 max-w-lg bg-rose-950/40 p-3 rounded-xl border border-rose-800/40">
              {this.state.error ? String(this.state.error.message || this.state.error) : 'Dashboard view temporarily recovered.'}
            </p>
          </div>
          <button
            onClick={() => {
              try {
                localStorage.clear();
              } catch (e) {}
              window.location.reload();
            }}
            className="px-5 py-2.5 rounded-xl bg-[#5B4FE9] text-white font-extrabold text-xs shadow-lg shadow-[#5B4FE9]/30 hover:opacity-95 cursor-pointer"
          >
            Reload Clean Dashboard &rarr;
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const MODULE_PATHS = {
  'login': '/login',
  'dashboard': '/dashboard',
  'raw-material': '/raw-material',
  'pulp-mill': '/pulp-mill',
  'machine': '/machine',
  'rewinder': '/rewinder',
  'boiler': '/boiler',
  'etp': '/etp',
  'electricity': '/electricity',
  'pending-order': '/pending-order',
  'finish-stock': '/finish-stock',
  'dispatch': '/dispatch',
  'store': '/store',
  'reports': '/reports'
};

const getModuleIdFromPath = (pathname) => {
  const cleanPath = (pathname || '').toLowerCase().replace(/\/$/, '') || '/login';
  if (cleanPath === '/login') return 'login';
  if (cleanPath === '/' || cleanPath === '/dashboard') return 'dashboard';
  const entry = Object.entries(MODULE_PATHS).find(([id, path]) => path === cleanPath);
  return entry ? entry[0] : 'dashboard';
};

function MainApp() {
  const [activeModule, setActiveModuleState] = useState(() => getModuleIdFromPath(window.location.pathname));
  const [appState, setAppState] = useState(store.getState());
  const [isUserMgmtOpen, setIsUserMgmtOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  const prevUserIdRef = useRef(appState.activeUserId);

  // Handle auth URL redirects (/login <-> /dashboard)
  useEffect(() => {
    if (!appState.isAuthenticated) {
      if (window.location.pathname !== '/login') {
        window.history.replaceState({ moduleId: 'login' }, '', '/login');
        setActiveModuleState('login');
      }
    } else {
      if (window.location.pathname === '/login' || activeModule === 'login') {
        window.history.replaceState({ moduleId: 'dashboard' }, '', '/dashboard');
        setActiveModuleState('dashboard');
      }
    }
  }, [appState.isAuthenticated, activeModule]);

  // Sync state & push browser URL history on module selection
  const setActiveModule = (moduleId) => {
    setActiveModuleState(moduleId);
    const targetPath = MODULE_PATHS[moduleId] || `/${moduleId}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ moduleId }, '', targetPath);
    }
  };

  // Sync state on Browser Back / Forward buttons (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const currentModule = getModuleIdFromPath(window.location.pathname);
      setActiveModuleState(currentModule);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const unsubscribe = store.subscribe((newState) => {
      setAppState({ ...newState });
    });
    return unsubscribe;
  }, []);

  // Determine active user and allowed modules
  const activeUser = (appState.users || []).find(u => u.id === appState.activeUserId) || appState.users?.[0];
  const allowedModuleIds = activeUser?.roleId === 'admin'
    ? MODULES.map(m => m.id)
    : (activeUser?.allowedModules || ['dashboard']);

  // Refresh screen overlay when active worker session changes
  useEffect(() => {
    if (prevUserIdRef.current && prevUserIdRef.current !== appState.activeUserId) {
      setIsRefreshing(true);
      const timer = setTimeout(() => {
        setIsRefreshing(false);
      }, 150); // 150ms quick refresh flash
      prevUserIdRef.current = appState.activeUserId;
      return () => clearTimeout(timer);
    } else {
      prevUserIdRef.current = appState.activeUserId;
    }
  }, [appState.activeUserId]);

  // Auto-switch to first allowed module if currently selected module is restricted
  useEffect(() => {
    if (appState.isAuthenticated && activeModule !== 'login' && !allowedModuleIds.includes(activeModule)) {
      setActiveModule(allowedModuleIds[0] || 'dashboard');
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [appState.activeUserId, activeModule, allowedModuleIds, appState.isAuthenticated]);

  // If not authenticated, render Login Screen
  if (!appState.isAuthenticated) {
    return (
      <>
        <LoginScreen state={appState} />
        <ToastNotification
          toast={appState.activeToast}
          onClose={() => store.hideToast()}
        />
      </>
    );
  }

  const activeModuleObj = MODULES.find(m => m.id === activeModule);

  const renderModule = () => {
    // Permission Guard
    if (!allowedModuleIds.includes(activeModule)) {
      return (
        <div className="bg-white rounded-3xl p-8 border border-[#EEF0F5] shadow-lg text-center space-y-4 max-w-md mx-auto my-12">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-[#F1533C] flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-[#161B26]">Access Restricted</h3>
            <p className="text-xs text-slate-500 mt-1">
              Your worker profile (<strong>{activeUser?.name}</strong> &bull; {activeUser?.roleName}) does not have permission to access the {activeModuleObj?.name || 'requested'} module.
            </p>
          </div>
          <button
            onClick={() => setActiveModule(allowedModuleIds[0] || 'dashboard')}
            className="px-5 py-2.5 rounded-xl bg-[#5B4FE9] text-white font-bold text-xs shadow-md shadow-[#5B4FE9]/25 hover:bg-[#4E42D4]"
          >
            Go to Allowed Module ({allowedModuleIds[0]})
          </button>
        </div>
      );
    }

    switch (activeModule) {
      case 'dashboard':
        return <DashboardModule state={appState} isSidebarExpanded={isSidebarExpanded} />;
      case 'raw-material':
        return <RawMaterialModule state={appState} isSidebarExpanded={isSidebarExpanded} />;
      case 'pulp-mill':
        return <PulpMillModule state={appState} isSidebarExpanded={isSidebarExpanded} />;
      case 'machine':
        return <MachineModule state={appState} isSidebarExpanded={isSidebarExpanded} />;
      case 'rewinder':
        return <RewinderModule state={appState} isSidebarExpanded={isSidebarExpanded} />;
      case 'boiler':
        return <BoilerModule state={appState} isSidebarExpanded={isSidebarExpanded} />;
      case 'etp':
        return <EtpModule state={appState} isSidebarExpanded={isSidebarExpanded} />;
      case 'electricity':
        return <ElectricityModule state={appState} isSidebarExpanded={isSidebarExpanded} />;
      case 'pending-order':
        return <PendingOrderModule state={appState} isSidebarExpanded={isSidebarExpanded} />;
      case 'finish-stock':
        return <FinishStockModule state={appState} isSidebarExpanded={isSidebarExpanded} />;
      case 'dispatch':
        return <DispatchModule state={appState} isSidebarExpanded={isSidebarExpanded} />;
      case 'store':
        return <StoreModule state={appState} isSidebarExpanded={isSidebarExpanded} />;
      case 'reports':
        return <ReportsModule state={appState} isSidebarExpanded={isSidebarExpanded} />;
      default:
        return <DashboardModule state={appState} isSidebarExpanded={isSidebarExpanded} />;
    }
  };

  const isDark = appState.theme === 'dark';

  return (
    <div className={`h-screen w-screen overflow-hidden flex font-sans antialiased selection:bg-[#cf8730] selection:text-[#fff] relative ${
      isDark ? 'dark bg-[#0B0E1B] text-slate-100' : 'light bg-[#eee0d3] text-[#12162b]'
    }`}>
      {/* Quick 150ms Screen Refresh Flash */}
      {isRefreshing && (
        <div className="fixed inset-0 z-50 bg-white/70 backdrop-blur-xs pointer-events-none transition-opacity duration-150 animate-in fade-in" />
      )}

      {/* Hover-Expandable Desktop Sidebar Rail / Mobile Bottom Bar (Filtered by Worker Access!) */}
      <Sidebar
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        state={appState}
        onExpandChange={setIsSidebarExpanded}
      />

      {/* Main Canvas Container (Dynamic Push Layout — smooth margin transition synced with sidebar) */}
      <div className={`flex-1 flex flex-col min-w-0 h-screen overflow-hidden transition-[margin-left] duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] transform-gpu ml-0 ${
        isSidebarExpanded ? 'lg:ml-64' : 'lg:ml-20'
      }`}>
        {/* Fixed Top Bar */}
        <TopBar
          activeRole={appState.activeRole}
          selectedDate={appState.selectedDate}
          title={activeModuleObj?.name}
          state={appState}
          onSelectModule={setActiveModule}
          isSidebarExpanded={isSidebarExpanded}
        />

        {/* Content Area (Attached flush to TopBar with zero gap & smooth slide-up entrance animation!) */}
        <main className="flex-1 min-w-0 overflow-y-auto custom-scrollbar pt-6 pb-24 lg:pb-12 px-4 sm:px-6 lg:px-8 w-full transition-all duration-300">
          <div key={activeModule} className="animate-page-slide-up">
            {renderModule()}
          </div>
        </main>
      </div>

      {/* Floating Scroll-Up Button */}
      <ScrollToTopButton activeModule={activeModule} />

      {/* Floating Demo UI Toast Notification Popup */}
      <ToastNotification
        toast={appState.activeToast}
        onClose={() => store.hideToast()}
        onViewProfile={() => setIsUserMgmtOpen(true)}
      />

      {/* User Management Modal */}
      <UserManagementModal
        isOpen={isUserMgmtOpen}
        onClose={() => setIsUserMgmtOpen(false)}
        state={appState}
      />

      {/* Saheb AI Chatbot — Floating Bubble */}
      <ChatBot state={appState} />
    </div>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
  );
}

export default App;
