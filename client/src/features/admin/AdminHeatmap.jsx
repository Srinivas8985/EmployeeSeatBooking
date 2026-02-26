import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { format, parseISO, subDays, addDays, startOfToday } from 'date-fns';
import { cn } from '../../utils/cn';
import { Calendar as CalendarIcon, Info, ShieldAlert } from 'lucide-react';
import { useToast } from '../../components/ui/Toast';
import { Skeleton } from '../../components/ui/Skeleton';

export default function Heatmap() {
    const [occupancyData, setOccupancyData] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();

    useEffect(() => {
        fetchOccupancyData();
    }, []);

    const fetchOccupancyData = async () => {
        try {
            const response = await api.get('/admin/analytics/daily-occupancy');
            // Backend returns last 30 days DESC
            // Let's reverse it to show chronologically if needed, or map it directly to a 30-grid day.
            const rawData = response.data.data;

            // Build a continuous 30 day array up to +14 days ahead, and some days behind, 
            // or just render the exact dates returned from backend (if any exist).
            // Actually, we want to show a calendar view. 
            // A simple grid of the last 30 days (up to 14 days in the future).
            // We'll standardise it: 30 days total ending 14 days from today.

            const standardGrid = [];
            const endDate = addDays(startOfToday(), 14); // 14 days future
            for (let i = 29; i >= 0; i--) {
                const dateObj = subDays(endDate, i);
                const dateStr = format(dateObj, 'yyyy-MM-dd');
                const matchedDay = rawData.find(d => d.date === dateStr);

                standardGrid.push({
                    date: dateObj,
                    dateStr: dateStr,
                    booked: matchedDay ? matchedDay.booked : 0,
                    capacity: matchedDay ? matchedDay.capacity : 50,
                    occupancy_percentage: matchedDay ? parseFloat(matchedDay.occupancy_percentage) : 0
                });
            }

            setOccupancyData(standardGrid);
        } catch (error) {
            addToast({
                title: 'Error loading heatmap',
                description: 'Failed to fetch real-time occupancy data',
                variant: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const getColorClass = (percent) => {
        if (percent === 0) return 'bg-slate-100 border-slate-200 text-slate-400';
        if (percent <= 25) return 'bg-emerald-200 border-emerald-300 text-emerald-800 shadow-sm';
        if (percent <= 50) return 'bg-emerald-400 border-emerald-500 text-emerald-900 shadow-md';
        if (percent <= 75) return 'bg-emerald-600 border-emerald-700 text-white shadow-lg';
        return 'bg-emerald-800 border-emerald-900 text-emerald-50 shadow-xl';
    };

    if (loading) {
        return (
            <div className="space-y-8 max-w-7xl mx-auto">
                <Skeleton className="h-8 w-64 mb-2" />
                <Skeleton className="h-4 w-96 mb-8" />
                <Card className="h-96">
                    <CardContent className="h-full flex items-center justify-center p-8">
                        <Skeleton className="h-full w-full rounded-2xl" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Occupancy Heatmap</h1>
                <p className="text-slate-500 mt-2 text-lg">Visualize true daily booking capacity and seat density over a 30-day window.</p>
            </div>

            <Card glass className="shadow-2xl border-slate-200/50 relative overflow-hidden">
                {/* Decorative background gradients */}
                <div className="absolute top-0 right-0 p-32 bg-emerald-50/50 rounded-full blur-3xl opacity-60 pointer-events-none -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 p-32 bg-indigo-50/50 rounded-full blur-3xl opacity-60 pointer-events-none -ml-16 -mb-16"></div>

                <CardHeader className="border-b border-slate-100 bg-white/40 pb-6 relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-slate-800 text-xl">
                            <CalendarIcon className="w-6 h-6 text-emerald-600" />
                            30-Day Calendar Projection
                        </CardTitle>
                        <CardDescription className="mt-1">Color intensity reflects real database occupancy percentages.</CardDescription>
                    </div>

                    {/* Legend block */}
                    <div className="flex gap-2 text-xs font-semibold uppercase tracking-wider items-center bg-white/60 p-2 rounded-xl border border-slate-200 shadow-sm">
                        <span className="text-slate-500 mr-1">Scale</span>
                        <div title="0%" className="w-6 h-6 rounded-md bg-slate-100 border border-slate-200"></div>
                        <div title="1-25%" className="w-6 h-6 rounded-md bg-emerald-200 border border-emerald-300"></div>
                        <div title="26-50%" className="w-6 h-6 rounded-md bg-emerald-400 border border-emerald-500"></div>
                        <div title="51-75%" className="w-6 h-6 rounded-md bg-emerald-600 border border-emerald-700"></div>
                        <div title="76-100%" className="w-6 h-6 rounded-md bg-emerald-800 border border-emerald-900"></div>
                    </div>
                </CardHeader>
                <CardContent className="p-8 relative z-10">

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-10 gap-4">
                        {occupancyData.map((day, i) => {
                            const isToday = format(day.date, 'yyyy-MM-dd') === format(startOfToday(), 'yyyy-MM-dd');

                            return (
                                <div key={day.dateStr} className="relative group perspective-1000">
                                    <div className={cn(
                                        "w-full aspect-square rounded-2xl border flex flex-col items-center justify-center transition-all duration-300 ease-in-out cursor-default relative hover:-translate-y-1 hover:scale-[1.03]",
                                        getColorClass(day.occupancy_percentage),
                                        isToday && "ring-4 ring-indigo-500/30 ring-offset-2"
                                    )}>
                                        <div className="font-bold text-lg mb-1">{format(day.date, 'd')}</div>
                                        <div className="text-xs opacity-80 font-medium uppercase tracking-widest">{format(day.date, 'MMM')}</div>

                                        {/* Overlay tooltips */}
                                        <div className="absolute -top-14 left-1/2 -translate-x-1/2 min-w-max bg-slate-900 border border-slate-700 text-white text-xs px-4 py-3 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none shadow-2xl z-50 flex flex-col gap-1">
                                            <span className="font-bold border-b border-slate-700 pb-1 mb-1">{format(day.date, 'EEEE, MMM d')}</span>
                                            <span className="text-emerald-400">Booked: {day.booked} / {day.capacity}</span>
                                            <span className="text-indigo-300">Occupancy: {day.occupancy_percentage}%</span>
                                            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 rotate-45 border-r border-b border-slate-700"></div>
                                        </div>
                                    </div>
                                    {isToday && (
                                        <div className="absolute -bottom-6 w-full text-center text-[10px] font-bold text-indigo-600 uppercase tracking-widest pointer-events-none">Today</div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Explanatory SaaS details section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card glass className="shadow-lg border-indigo-100/40">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-indigo-900">
                            <Info className="w-5 h-5 text-indigo-600" />
                            Dynamic Calculation
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-600 leading-relaxed text-sm">
                            This heatmap represents actual database records pulled live from
                            <code className="text-xs bg-slate-100 px-1 py-0.5 rounded mx-1 text-slate-800">bookings</code> table across the last 30 operational days (inclusive of future allowed ranges). Null days indicate 0% usage or weekend blockouts natively resolved.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
