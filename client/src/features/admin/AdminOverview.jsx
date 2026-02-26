import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../components/ui/Toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Users, LayoutGrid, CalendarClock, TrendingUp, Download } from 'lucide-react';
import { Skeleton } from '../../components/ui/Skeleton';
import { format } from 'date-fns';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend
} from 'recharts';

export default function AdminOverview() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const response = await api.get('/admin/analytics');
            setData(response.data.data);
        } catch (error) {
            addToast({
                title: 'Error loading analytics',
                description: 'Failed to fetch admin overview data',
                variant: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div>
                    <Skeleton className="h-8 w-64 mb-2" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <Card key={i} className="p-6">
                            <Skeleton className="h-4 w-1/2 mb-4" />
                            <Skeleton className="h-8 w-1/3 mb-2" />
                        </Card>
                    ))}
                </div>
                <Card className="h-96">
                    <CardContent className="h-full flex items-center justify-center">
                        <Skeleton className="h-full w-full rounded-xl" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Generate Mock Data for the Charts based on the actual today's stats 
    // (In a real app, this would be an array returned from the backend over 7 days)
    const occupancyData = [
        { name: 'Mon', occupancy: 45, waitlist: 0 },
        { name: 'Tue', occupancy: 70, waitlist: 5 },
        { name: 'Wed', occupancy: 85, waitlist: 12 },
        { name: 'Thu', occupancy: 60, waitlist: 2 },
        { name: 'Fri', occupancy: Number(data?.occupancy_percentage || 0), waitlist: Number(data?.waitlist_count || 0) },
    ];

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Admin Overview</h1>
                    <p className="text-slate-500 mt-1">Live metrics and system health for today ({format(new Date(), 'MMM d, yyyy')})</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
                    <Download className="w-4 h-4" />
                    Export Report
                </button>
            </div>

            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card glass className="relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <LayoutGrid className="w-16 h-16 text-indigo-600" />
                    </div>
                    <CardContent className="p-6 relative z-10">
                        <p className="text-sm font-medium text-slate-500 mb-1">Total Bookings Today</p>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-3xl font-bold text-slate-900">{data?.total_bookings || 0}</h3>
                            <span className="text-sm font-medium text-emerald-600 flex items-center">
                                <TrendingUp className="w-3 h-3 mr-1" /> +12%
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Out of {data?.total_seats || 50} total seats</p>
                    </CardContent>
                </Card>

                <Card glass className="relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingUp className="w-16 h-16 text-emerald-600" />
                    </div>
                    <CardContent className="p-6 relative z-10">
                        <p className="text-sm font-medium text-slate-500 mb-1">Current Occupancy</p>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-3xl font-bold text-slate-900">{data?.occupancy_percentage || 0}%</h3>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3">
                            <div
                                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${data?.occupancy_percentage || 0}%` }}
                            ></div>
                        </div>
                    </CardContent>
                </Card>

                <Card glass className="relative overflow-hidden group border-amber-200/50">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Users className="w-16 h-16 text-amber-600" />
                    </div>
                    <CardContent className="p-6 relative z-10">
                        <p className="text-sm font-medium text-slate-500 mb-1">Waitlist Count</p>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-3xl font-bold text-slate-900 text-amber-600">{data?.waitlist_count || 0}</h3>
                            <span className="text-xs font-medium bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                                Needs attention
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Users awaiting cancellation</p>
                    </CardContent>
                </Card>

                <Card glass className="relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <CalendarClock className="w-16 h-16 text-blue-600" />
                    </div>
                    <CardContent className="p-6 relative z-10">
                        <p className="text-sm font-medium text-slate-500 mb-1">Floater Seats Available</p>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-3xl font-bold text-slate-900">10</h3>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Designated seats unlock at 3 PM</p>
                    </CardContent>
                </Card>
            </div>

            {/* Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card glass className="shadow-lg shadow-indigo-100/20">
                    <CardHeader>
                        <CardTitle>Weekly Occupancy Trend</CardTitle>
                        <CardDescription>Percentage of seats booked over the last 5 days</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={occupancyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorOccupancy" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <Tooltip wrapperClassName="recharts-default-tooltip" />
                                    <Area type="monotone" dataKey="occupancy" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorOccupancy)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card glass className="shadow-lg shadow-emerald-100/20">
                    <CardHeader>
                        <CardTitle>Waitlist vs Capacity</CardTitle>
                        <CardDescription>Comparison of demand exceeding availability</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={occupancyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <Tooltip wrapperClassName="recharts-default-tooltip" cursor={{ fill: '#f1f5f9' }} />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                                    <Bar dataKey="occupancy" name="Occupied Seats" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                    <Bar dataKey="waitlist" name="Waitlist Queue" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
