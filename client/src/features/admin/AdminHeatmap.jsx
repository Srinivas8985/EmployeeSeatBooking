import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { format, addDays, isWeekend, startOfToday } from 'date-fns';
import { cn } from '../../utils/cn';
import { Calendar as CalendarIcon, Server, ShieldAlert } from 'lucide-react';

export default function Heatmap() {
    const [selectedDate, setSelectedDate] = useState(startOfToday());

    // Generate valid bookable dates
    const today = startOfToday();
    const dates = [];
    for (let i = 0; i < 7; i++) {
        const date = addDays(today, i);
        if (!isWeekend(date)) {
            dates.push(date);
        }
    }

    // Render a highly interactive, simulated floor plan using React
    const renderFloorPlan = () => {
        return (
            <div className="relative bg-slate-900 rounded-3xl p-8 shadow-2xl overflow-hidden border border-slate-800 w-full min-h-[500px]">
                {/* Aesthetic grid background */}
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>

                <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center border-b border-white/5 bg-black/20 backdrop-blur-md z-10">
                    <div className="flex items-center gap-3 text-white font-medium">
                        <Server className="w-5 h-5 text-indigo-400" />
                        Floor 3HQ - Live Operations View
                    </div>
                    <div className="flex gap-4 text-xs font-medium">
                        <div className="flex items-center gap-2 text-emerald-400 px-3 py-1.5 rounded-full bg-emerald-400/10 border border-emerald-400/20">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Available (Designated)
                        </div>
                        <div className="flex items-center gap-2 text-rose-400 px-3 py-1.5 rounded-full bg-rose-400/10 border border-rose-400/20">
                            <span className="w-2 h-2 rounded-full bg-rose-500"></span> Booked
                        </div>
                        <div className="flex items-center gap-2 text-blue-400 px-3 py-1.5 rounded-full bg-blue-400/10 border border-blue-400/20">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span> Floater
                        </div>
                    </div>
                </div>

                <div className="pt-20 grid grid-cols-5 md:grid-cols-10 gap-x-4 gap-y-8 relative z-10 w-full max-w-5xl mx-auto">
                    {Array.from({ length: 50 }).map((_, i) => {
                        // Mock deterministic logic for visualization based on the selected date
                        const hash = (i * selectedDate.getDate()) % 100;
                        const isBooked = hash > 50;
                        const isFloater = i >= 40; // Last 10 seats are floaters

                        let stateClass = "";
                        if (isBooked) {
                            stateClass = "bg-rose-500/20 border-rose-500/40 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)]";
                        } else if (isFloater) {
                            stateClass = "bg-blue-500/20 border-blue-500/40 text-blue-300 hover:bg-blue-500/30";
                        } else {
                            stateClass = "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 hover:scale-[1.05]";
                        }

                        return (
                            <div key={i} className="flex flex-col items-center gap-2 group cursor-crosshair">
                                <div className={cn(
                                    "w-12 h-12 rounded-lg border transition-all duration-300 flex items-center justify-center font-bold text-sm relative",
                                    stateClass
                                )}>
                                    {isFloater ? `F${i - 39}` : `D${i + 1}`}

                                    {/* Hover Tooltip inside mapping */}
                                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-3 py-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl border border-slate-700">
                                        {isBooked ? 'Booked by User' : (isFloater ? 'Floater Seat' : 'Available')}
                                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45 border-r border-b border-slate-700"></div>
                                    </div>
                                </div>
                                {/* Desk shape indicator line */}
                                <div className={cn(
                                    "w-8 h-1.5 rounded-full opacity-60",
                                    isBooked ? "bg-rose-900" : (isFloater ? "bg-blue-900" : "bg-slate-700")
                                )}></div>
                            </div>
                        )
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Live Seat Heatmap</h1>
                <p className="text-slate-500 mt-1">Visualize physical floor occupancy and seat density in real-time.</p>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                {dates.map(date => {
                    const isSelected = selectedDate.getTime() === date.getTime();
                    return (
                        <button
                            key={date.toISOString()}
                            onClick={() => setSelectedDate(date)}
                            className={cn(
                                "flex-shrink-0 px-6 py-3 rounded-xl border transition-all duration-200 text-left min-w-[140px]",
                                isSelected
                                    ? "bg-indigo-600 border-indigo-700 text-white shadow-lg shadow-indigo-200"
                                    : "bg-white border-slate-200 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50"
                            )}
                        >
                            <div className="font-semibold text-sm">
                                {format(date, 'EEEE')}
                            </div>
                            <div className={cn("text-xs mt-1", isSelected ? "text-indigo-100" : "text-slate-400")}>
                                {format(date, 'MMM d, yyyy')}
                            </div>
                        </button>
                    );
                })}
            </div>

            {renderFloorPlan()}

            {/* Advanced SaaS details section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card glass>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5 text-indigo-600" />
                            Zone Activity Insights
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-600 font-medium">High Density Area</span>
                                <span className="text-rose-600 font-semibold">Row D (Desks D10-D20)</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                                <div className="bg-rose-500 h-2 rounded-full w-[85%]"></div>
                            </div>

                            <div className="flex justify-between items-center text-sm pt-4 border-t border-slate-100">
                                <span className="text-slate-600 font-medium">Available Clusters</span>
                                <span className="text-emerald-600 font-semibold">Row A (Desks D1-D9)</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                                <div className="bg-emerald-500 h-2 rounded-full w-[25%]"></div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
