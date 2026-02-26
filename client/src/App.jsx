import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/ui/Toast';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './layouts/ProtectedRoute';

// Pages - Auth
import Login from './features/auth/Login';

// Pages - Employee
import MyBookings from './features/booking/MyBookings';
import BookSeat from './features/booking/BookSeat';
import RulesHelp from './features/booking/RulesHelp';

// Pages - Admin
import AdminOverview from './features/admin/AdminOverview';
import Heatmap from './features/admin/AdminHeatmap';

// Placeholder Pages
const Placeholder = ({ title }) => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] text-center max-w-md mx-auto">
    <div className="w-16 h-16 bg-slate-100 rounded-2xl border flex items-center justify-center mb-4">
      <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    </div>
    <h1 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h1>
    <p className="mt-2 text-sm text-slate-500">This feature is currently being developed and will be available in the next iteration.</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Auth Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/login" replace />} />
            </Route>

            {/* Employee Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['EMPLOYEE', 'ADMIN']} />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<MyBookings />} />
                <Route path="/dashboard/book" element={<BookSeat />} />
                <Route path="/dashboard/help" element={<RulesHelp />} />
              </Route>
            </Route>

            {/* Admin Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route element={<DashboardLayout />}>
                <Route path="/admin" element={<AdminOverview />} />
                <Route path="/admin/heatmap" element={<Heatmap />} />
                <Route path="/admin/employees" element={<Placeholder title="Employee Management" />} />
                <Route path="/admin/settings" element={<Placeholder title="Admin Settings" />} />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
