import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast({ title: 'Validation Error', description: 'Please fill in all fields', variant: 'warning' });
      return;
    }

    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      addToast({ title: 'Welcome Back!', description: 'Successfully securely logged in.', variant: 'success' });
      // Navigation is handled automatically by AuthLayout / ProtectedRoute reactions
    } else {
      addToast({ title: 'Access Denied', description: result.message, variant: 'error' });
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl py-10 px-6 sm:px-10 shadow-2xl rounded-3xl border border-white/50">
      <div className="mb-6 text-center">
        <h3 className="text-xl font-bold text-slate-800">Sign in to your account</h3>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email address</label>
          <Input 
            type="email" 
            placeholder="john@company.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            autoComplete="email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
          <Input 
            type="password" 
            placeholder="••••••••" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            autoComplete="current-password"
          />
        </div>

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Sign in
        </Button>
      </form>

      {/* Helper text for the demo/interview */}
      <div className="mt-6 border-t border-slate-200 pt-6">
        <p className="text-xs text-center text-slate-500 mb-2 font-medium uppercase tracking-wider">Demo Accounts</p>
        <div className="flex justify-between text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
          <div>
            <span className="font-semibold block text-indigo-700">Admin</span>
            admin@company.com
            <br/> admin123
          </div>
          <div className="text-right">
            <span className="font-semibold block text-emerald-700">Employee</span>
            john@company.com
            <br/> password123
          </div>
        </div>
      </div>
    </div>
  );
}
