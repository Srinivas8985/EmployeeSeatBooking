import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import api from '../../services/api';
import { format, addDays, isWeekend, isSameDay, startOfToday } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { CheckCircle, Info, Calendar as CalendarIcon, Server, Search } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function BookSeat() {
    const [selectedDate, setSelectedDate] = useState(null);
    const [availableDates, setAvailableDates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [bookingLoading, setBookingLoading] = useState(false);
    const { user } = useAuth();
    const { addToast } = useToast();

    useEffect(() => {
        // Generate valid bookable dates (next 14 days, excluding weekends)
        const today = startOfToday();
        const dates = [];
        for (let i = 0; i < 14; i++) {
            const date = addDays(today, i);
            if (!isWeekend(date)) {
                dates.push(date);
            }
        }
        setAvailableDates(dates);
        if (dates.length > 0) setSelectedDate(dates[0]);
    }, []);

    const handleBookSeat = async () => {
        if (!selectedDate) return;

        setBookingLoading(true);
        try {
            // Format as YYYY-MM-DD
            const dateStr = format(selectedDate, 'yyyy-MM-dd');
            const response = await api.post('/bookings', { date: dateStr });

            const data = response.data.data;
            if (data.status === 'WAITLISTED') {
                addToast({
                    title: 'Waitlisted',
                    description: `No seats available. You're on the waitlist for ${format(selectedDate, 'MMM d')}.`,
                    variant: 'warning',
                    duration: 6000
                });
            } else {
                addToast({
                    title: 'Seat Confirmed!',
                    description: `You have successfully booked seat ${data.seat} for ${format(selectedDate, 'MMM d')}.`,
                    variant: 'success',
                    duration: 5000
                });
            }
        } catch (error) {
            addToast({
                title: 'Booking Failed',
                description: error.response?.data?.error || 'Could not complete booking request.',
                variant: 'error',
                duration: 5000
            });
        } finally {
            setBookingLoading(false);
        }
    };

    // Mock real-time logic block / visualization for aesthetic depth
    const renderVisualizer = () => {
        if (!selectedDate) return null;

        // Create an aesthetic, mocked layout wrapper for the concept of physical seats
        return (
            <div className="relative mt-8 bg-slate-900 rounded-3xl p-8 shadow-inner overflow-hidden border border-slate-800">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
                <div className="absolute top-0 right-0 p-4 flex items-center gap-2 text-xs text-emerald-400 bg-emerald-400/10 rounded-bl-2xl border-b border-l border-emerald-400/20 backdrop-blur-md">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Live Sync Active
                </div>

                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-white font-medium flex items-center gap-2">
                            <Server className="w-4 h-4 text-indigo-400" />
                            Floor Plan Preview
                        </h3>
                        <p className="text-slate-400 text-sm mt-1">Real-time mock visualization for {format(selectedDate, 'MMM d, yyyy')}</p>
                    </div>
                    <div className="flex gap-4 text-xs font-medium border border-white/10 p-2 rounded-lg bg-white/5 backdrop-blur-md">
                        <div className="flex items-center gap-2 text-emerald-400 font-medium tracking-wide">
                            <div className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div> Available
                        </div>
                        <div className="flex items-center gap-2 text-rose-400 font-medium tracking-wide">
                            <div className="w-3 h-3 rounded bg-rose-500/20 border border-rose-500"></div> Booked
                        </div>
                        <div className="flex items-center gap-2 text-slate-400 font-medium tracking-wide">
                            <div className="w-3 h-3 rounded bg-slate-700/50 border border-slate-600"></div> Unavailable
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-10 gap-3 gap-y-6">
                    {/* Render 50 mocked visual physical seats */}
                    {Array.from({ length: 50 }).map((_, i) => {
                        // pseudo random logic tied to date string to make it stable per date
                        const hash = (i * selectedDate.getDate()) % 100;
                        const isBooked = hash > 60;
                        const isUnavailable = hash < 10;
                        let stateClass = "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/30 hover:border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.15)]";
                        if (isUnavailable) stateClass = "bg-slate-800/80 border-slate-700 text-slate-600 cursor-not-allowed";
                        else if (isBooked) stateClass = "bg-rose-500/10 border-rose-500/30 text-rose-400 cursor-not-allowed";

                        return (
                            <div key={i} className="flex flex-col items-center gap-1 group">
                                <div className={cn(
                                    "w-10 h-10 rounded-xl border transition-all duration-300 flex items-center justify-center font-semibold text-xs relative",
                                    stateClass
                                )}>
                                    {i + 1}
                                    {!isUnavailable && !isBooked && (
                                        <div className="absolute inset-0 border border-emerald-400 rounded-xl scale-110 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300"></div>
                                    )}
                                </div>
                                <div className="w-6 h-1 rounded-full bg-slate-800"></div>
                            </div>
                        )
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Book a Seat</h1>
                <p className="text-slate-500 mt-1">Select an upcoming date to reserve your spot.</p>
            </div>

            <div className="grid lg:grid-cols-[300px_1fr] gap-8 items-start">
                {/* Date Selector Sidebar */}
                <Card glass className="sticky top-24">
                    <CardHeader>
                        <CardTitle className="text-lg">Select Date</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                            {availableDates.map(date => {
                                const isSelected = selectedDate && isSameDay(date, selectedDate);
                                const isPast3PM = new Date().getHours() >= 15;
                                const isTomorrow = isSameDay(date, addDays(startOfToday(), 1));

                                return (
                                    <button
                                        key={date.toISOString()}
                                        onClick={() => setSelectedDate(date)}
                                        className={cn(
                                            "w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-200 text-left",
                                            isSelected
                                                ? "bg-indigo-50 border-indigo-200 shadow-sm"
                                                : "bg-white border-transparent hover:border-slate-200 hover:bg-slate-50"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold",
                                                isSelected ? "bg-indigo-600 text-white shadow-md" : "bg-slate-100 text-slate-500"
                                            )}>
                                                {format(date, 'd')}
                                            </div>
                                            <div>
                                                <div className={cn("font-medium text-sm", isSelected ? "text-indigo-900" : "text-slate-700")}>
                                                    {format(date, 'EEEE')}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    {format(date, 'MMM yyyy')}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Booking Main Area */}
                <div className="space-y-6">
                    <Card glass className="overflow-hidden border-indigo-100 shadow-lg shadow-indigo-100/40">
                        <div className="bg-gradient-to-r from-indigo-600 to-emerald-500 h-2 w-full"></div>
                        <CardContent className="p-8">
                            {selectedDate ? (
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div>
                                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                                            {format(selectedDate, 'EEEE, MMMM d')}
                                        </h2>
                                        <p className="text-slate-500 mt-2 flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                                            Dynamic seat mapping active
                                        </p>
                                    </div>

                                    <div className="flex-shrink-0">
                                        <Button
                                            size="lg"
                                            className="w-full md:w-auto text-lg px-8 py-6 rounded-2xl shadow-indigo-200"
                                            onClick={handleBookSeat}
                                            isLoading={bookingLoading}
                                        >
                                            Confirm Booking
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                    <p className="text-slate-500 text-lg">Please select a date from the calendar</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* SaaS Notification / Warning Card */}
                    <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 flex items-start gap-4">
                        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div className="text-sm text-amber-900">
                            <strong className="block mb-1">Important Rule for Hybrid Workers</strong>
                            If you are attempting to book a day that is NOT part of your assigned Batch (floater attempt), the booking
                            will only be permitted exactly 1 day in advance, strictly after 3:00 PM server time. Otherwise, the request will be denied.
                        </div>
                    </div>

                    {/* Real-time Heatmap Mock View */}
                    {renderVisualizer()}

                </div>
            </div>
        </div>
    );
}
