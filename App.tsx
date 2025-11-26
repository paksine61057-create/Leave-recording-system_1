import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { User, Role } from './types';
import { authenticate } from './services/dataService';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import LeaveEntry from './pages/LeaveEntry';
import Reports from './pages/Reports';
import Personnel from './pages/Personnel';
import History from './pages/History';
import AccessLogs from './pages/AccessLogs';
import Login from './pages/Login';
import { Menu, LogOut, User as UserIcon } from 'lucide-react';

const ProtectedRoute = ({ children, user, requiredRole }: { children?: React.ReactNode, user: User | null, requiredRole?: Role }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const Layout = ({ children, user, onLogout }: { children?: React.ReactNode, user: User, onLogout: () => void }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Close sidebar on mobile route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans print:h-auto print:overflow-visible print:block">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-20 lg:hidden print:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Hidden on Print */}
      <div className={`fixed lg:static inset-y-0 left-0 z-30 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out print:hidden`}>
        <Sidebar user={user} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden print:overflow-visible print:h-auto print:block relative">
        {/* Header - Glassmorphism */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 z-10 print:hidden sticky top-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 focus:outline-none transition-colors"
              >
                <Menu size={24} />
              </button>
              <div className="flex items-center ml-2 lg:ml-0">
                 <img src="https://img5.pic.in.th/file/secure-sv1/5bc66fd0-c76e-41c4-87ed-46d11f4a36fa.png" alt="Logo" className="h-9 w-9 mr-3 drop-shadow-sm" />
                 <div>
                   <h1 className="text-lg font-bold text-slate-800 leading-tight">ระบบบันทึกการลา</h1>
                   <p className="text-xs text-slate-500 font-medium">โรงเรียนประจักษ์ศิลปาคม</p>
                 </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center text-sm text-slate-700 bg-slate-50 py-1 px-3 rounded-full border border-slate-200">
                <UserIcon size={16} className="mr-2 text-slate-400" />
                <span className="font-semibold">{user.fullName}</span>
                <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider border ${
                    user.role === Role.ADMIN 
                    ? 'bg-indigo-100 text-indigo-700 border-indigo-200' 
                    : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                }`}>
                  {user.role === Role.ADMIN ? 'Admin' : 'User'}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                title="ออกจากระบบ"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-100 p-4 md:p-8 print:p-0 print:bg-white print:overflow-visible print:h-auto print:w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('prajak_current_user');
    return stored ? JSON.parse(stored) : null;
  });

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem('prajak_current_user', JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('prajak_current_user');
  };

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
        
        <Route path="/" element={
          <ProtectedRoute user={user}>
            <Layout user={user!} onLogout={handleLogout}>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/leave-entry" element={
          <ProtectedRoute user={user} requiredRole={Role.ADMIN}>
            <Layout user={user!} onLogout={handleLogout}>
              <LeaveEntry />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/history" element={
          <ProtectedRoute user={user}>
            <Layout user={user!} onLogout={handleLogout}>
              <History user={user!} />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/reports" element={
          <ProtectedRoute user={user} requiredRole={Role.ADMIN}>
            <Layout user={user!} onLogout={handleLogout}>
              <Reports />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/personnel" element={
          <ProtectedRoute user={user} requiredRole={Role.ADMIN}>
            <Layout user={user!} onLogout={handleLogout}>
              <Personnel />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/access-logs" element={
          <ProtectedRoute user={user} requiredRole={Role.ADMIN}>
            <Layout user={user!} onLogout={handleLogout}>
              <AccessLogs />
            </Layout>
          </ProtectedRoute>
        } />

      </Routes>
    </HashRouter>
  );
}