import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../components/ui/Toast';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Users, UserPlus, Briefcase, Mail, Calendar } from 'lucide-react';
import { Skeleton } from '../../components/ui/Skeleton';

export default function EmployeeManagement() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newEmployee, setNewEmployee] = useState({ name: '', email: '', password: '', role: 'EMPLOYEE', batch_id: 1 });
    const { addToast } = useToast();

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await api.get('/admin/users');
            setEmployees(response.data.data);
            setLoading(false);
        } catch (error) {
            addToast({
                title: 'Error loading employees',
                description: 'Failed to fetch employee list',
                variant: 'error'
            });
            setLoading(false);
        }
    };

    const handleAddEmployee = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/users', newEmployee);
            addToast({
                title: 'Employee Added',
                description: `${newEmployee.name} has been added to the system.`,
                variant: 'success'
            });
            fetchEmployees();
            setIsAdding(false);
            setNewEmployee({ name: '', email: '', password: '', role: 'EMPLOYEE', batch_id: 1 });
        } catch (error) {
            addToast({
                title: 'Failed to add employee',
                description: error.response?.data?.error || 'An error occurred',
                variant: 'error'
            });
        }
    };

    const handleDeleteEmployee = async (id, name) => {
        if (!window.confirm(`Are you sure you want to completely remove ${name} from the system?`)) return;

        try {
            await api.delete(`/admin/users/${id}`);
            addToast({
                title: 'Employee Removed',
                description: `${name} has been successfully deleted.`,
                variant: 'success'
            });
            setEmployees(prev => prev.filter(emp => emp.id !== id));
        } catch (error) {
            addToast({
                title: 'Failed to delete',
                description: error.response?.data?.error || 'An error occurred',
                variant: 'error'
            });
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div>
                    <Skeleton className="h-8 w-64 mb-2" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <Card>
                    <CardContent className="p-6 space-y-4">
                        {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Employee Management</h1>
                    <p className="text-slate-500 mt-1">Manage users, roles, and batch assignments.</p>
                </div>
                <Button onClick={() => setIsAdding(!isAdding)} className="flex items-center gap-2">
                    {isAdding ? 'Cancel' : <><UserPlus className="w-4 h-4" /> Add Employee</>}
                </Button>
            </div>

            {isAdding && (
                <Card glass className="border-indigo-100 shadow-lg animate-in slide-in-from-top-4">
                    <CardHeader>
                        <CardTitle className="text-indigo-700">Register New User</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAddEmployee} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                    <Input required value={newEmployee.name} onChange={e => setNewEmployee({ ...newEmployee, name: e.target.value })} placeholder="Jane Doe" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                                    <Input required type="email" value={newEmployee.email} onChange={e => setNewEmployee({ ...newEmployee, email: e.target.value })} placeholder="jane@company.com" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Temporary Password</label>
                                    <Input required type="password" value={newEmployee.password} onChange={e => setNewEmployee({ ...newEmployee, password: e.target.value })} placeholder="••••••••" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Batch Assignment</label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={newEmployee.batch_id}
                                        onChange={e => setNewEmployee({ ...newEmployee, batch_id: Number(e.target.value) })}
                                    >
                                        <option value={1}>Batch 1 (Mon, Tue, Wed)</option>
                                        <option value={2}>Batch 2 (Thu, Fri)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end pt-4">
                                <Button type="submit">Create User Account</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Card glass>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Employee</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Batch</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {employees.map(emp => (
                                <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
                                                {emp.name.charAt(0)}
                                            </div>
                                            <div className="ml-4">
                                                <div className="font-medium text-slate-900">{emp.name}</div>
                                                <div className="text-sm text-slate-500 flex items-center gap-1">
                                                    <Mail className="w-3 h-3" /> {emp.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${emp.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-800'
                                            }`}>
                                            {emp.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {emp.role === 'ADMIN' ? (
                                            <span className="text-sm text-slate-400 italic">N/A</span>
                                        ) : (
                                            <div className="flex items-center text-sm text-slate-600 bg-slate-50 px-3 py-1 rounded-md border border-slate-200 inline-flex">
                                                <Calendar className="w-4 h-4 mr-2 text-indigo-500" />
                                                {emp.batch_name}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm font-medium">
                                        <button className="text-indigo-600 hover:text-indigo-900 mx-2 hidden">Edit</button>
                                        {emp.role !== 'ADMIN' && (
                                            <button
                                                onClick={() => handleDeleteEmployee(emp.id, emp.name)}
                                                className="text-rose-600 hover:text-rose-900 font-bold"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
