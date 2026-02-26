import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  CalendarDays, 
  LogOut, 
  Users, 
  Settings, 
  Menu,
  X,
  HelpCircle
} from 'lucide-react';
import { cn } from '../utils/cn';

export default function DashboardLayout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = isAdmin ? [
    { label: 'Analytics', icon: LayoutDashboard, path: '/admin' },
    { label: 'Heatmap', icon: CalendarDays, path: '/admin/heatmap' },
    { label: 'Employees', icon: Users, path: '/admin/employees' },
    { label: 'Settings', icon: Settings, path: '/admin/settings' },
  ] : [
    { label: 'My Bookings', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Book Seat', icon: CalendarDays, path: '/dashboard/book' },
    { label: 'Rules & Help', icon: HelpCircle, path: '/dashboard/help' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Core */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col",
        sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-100 bg-indigo-600/5">
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-emerald-500 bg-clip-text text-transparent">
            HybridSeat
          </span>
          <button className="lg:hidden text-slate-500" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <div className="mb-6 px-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {isAdmin ? 'Admin Console' : 'Workspace'}
            </p>
          </div>
          
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 relative",
                isActive 
                  ? "bg-indigo-50 text-indigo-700" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              {({ isActive }) => (
                <>
                  {/* Glowing active indicator */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-600 rounded-r-full shadow-[0_0_8px_rgba(79,70,229,0.5)]" />
                  )}
                  <item.icon className={cn(
                    "w-5 h-5 mr-3 transition-colors",
                    isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
                  )} />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </div>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center px-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="ml-3 truncate">
              <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center px-3 py-2 text-sm font-medium text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 flex items-center justify-between px-4 h-16 sm:px-6 lg:px-8">
          <button 
            className="text-slate-500 hover:text-slate-700 focus:outline-none lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1"></div>
          <div className="flex items-center space-x-4">
            {/* Simple notification bell mock */}
            <button className="relative text-slate-400 hover:text-slate-600 transition-colors">
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
          </div>
        </header>

        {/* Scrollable Main Block */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-slate-50/50">
          <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
