import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import api from '../../services/api';
import { format, addDays, isSameDay, startOfToday } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { CheckCircle, Info, Calendar as CalendarIcon, Clock, ShieldAlert, Users, Layers, AlertTriangle, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function BookSeat() {
    const [selectedDate, setSelectedDate] = useState(null);
    const [availableDates, setAvailableDates] = useState([]);
    const [availabilityMap, setAvailabilityMap] = useState({});
    const [loadingMap, setLoadingMap] = useState({});
    const [bookingLoading, setBookingLoading] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        const today = startOfToday();
        const dates = [];
        for (let i = 0; i < 14; i++) {
            dates.push(addDays(today, i));
        }
        setAvailableDates(dates);
        if (dates.length > 0) setSelectedDate(dates[0]);

        dates.forEach(date => {
            fetchAvailability(date);
        });
    }, []);

    const fetchAvailability = async (date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        setLoadingMap(prev => ({ ...prev, [dateStr]: true }));
        try {
            const res = await api.get(`/bookings/availability?date=${dateStr}`);
            setAvailabilityMap(prev => ({ ...prev, [dateStr]: res.data.data }));
        } catch (e) {
            console.error('Failed to fetch availability', e);
        } finally {
            setLoadingMap(prev => ({ ...prev, [dateStr]: false }));
        }
    };

    const handleBookSeat = async () => {
        if (!selectedDate) return;
        const dateStr = format(selectedDate, 'yyyy-MM-dd');

        setBookingLoading(true);
        try {
            const response = await api.post('/bookings', { date: dateStr });
            const data = response.data.data;

            if (data.status === 'WAITLISTED') {
                addToast({
                    title: 'Waitlist Joined',
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
            // Refresh data for the booked date
            fetchAvailability(selectedDate);
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

    const selectedDateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null;
    const currentAvail = selectedDateStr ? availabilityMap[selectedDateStr] : null;
    const isLoadingAvail = selectedDateStr ? loadingMap[selectedDateStr] : true;

    const renderDateSelector = () => (
        <Card glass className="sticky top-24 shadow-xl border-slate-200/50">
            <CardHeader className="border-b border-slate-100 bg-white/50 pb-4">
                <CardTitle className="text-lg text-slate-800">Select Date</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="max-h-[65vh] overflow-y-auto custom-scrollbar p-3 space-y-2">
                    {availableDates.map(date => {
                        const dateStr = format(date, 'yyyy-MM-dd');
                        const isSelected = selectedDate && isSameDay(date, selectedDate);
                        const avail = availabilityMap[dateStr];
                        const loading = loadingMap[dateStr];

                        let borderClass = "border-transparent";
                        let bgClass = "bg-white hover:bg-slate-50";
                        let textClass = "text-slate-700";

                        if (isSelected) {
                            bgClass = "bg-indigo-50 shadow-md";
                            borderClass = "border-indigo-200";
                            textClass = "text-indigo-900";
                        }

                        return (
                            <div key={dateStr} className="relative group">
                                <button
                                    onClick={() => setSelectedDate(date)}
                                    className={cn(
                                        "w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-300 text-left relative overflow-hidden",
                                        bgClass, borderClass
                                    )}
                                >
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm transition-colors",
                                            isSelected ? "bg-indigo-600 text-white shadow-indigo-200" : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                                        )}>
                                            {format(date, 'd')}
                                        </div>
                                        <div>
                                            <div className={cn("font-semibold text-sm", textClass)}>
                                                {format(date, 'EEEE')}
                                            </div>
                                            <div className="text-xs font-medium text-slate-400">
                                                {format(date, 'MMM yyyy')}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="relative z-10">
                                        {loading ? (
                                            <div className="w-4 h-4 rounded-full border-2 border-slate-200 border-t-indigo-500 animate-spin"></div>
                                        ) : avail ? (
                                            <div className="flex items-center gap-2">
                                                {!avail.is_eligible && (
                                                    <div className="w-2 h-2 rounded-full bg-rose-400"></div>
                                                )}
                                                {avail.is_eligible && avail.booking_type === 'DESIGNATED' && (
                                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                )}
                                                {avail.is_eligible && avail.booking_type === 'FLOATER' && (
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                                )}
                                            </div>
                                        ) : null}
                                    </div>
                                </button>

                                {/* Hover Tooltip */}
                                {!isSelected && avail && (
                                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 w-48 p-3 bg-slate-900 text-white text-xs rounded-xl shadow-2xl opacity-0 translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 z-50">
                                        <div className="font-semibold mb-2 border-b border-slate-700 pb-1">{format(date, 'MMM d')} - {avail.batch_name}</div>
                                        {avail.is_holiday ? (
                                            <div className="text-rose-400">Company Holiday</div>
                                        ) : avail.is_weekend ? (
                                            <div className="text-amber-400">Weekend</div>
                                        ) : (
                                            <div className="space-y-1 text-slate-300">
                                                <div className="flex justify-between"><span>Designated:</span> <span className="text-blue-400">{avail.designated_available} left</span></div>
                                                <div className="flex justify-between"><span>Floater:</span> <span className="text-emerald-400">{avail.floater_available} left</span></div>
                                                {!avail.is_eligible && <div className="text-rose-400 mt-2 block">{avail.eligibility_reason}</div>}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );

    const renderBookingPanel = () => {
        if (!selectedDate) {
            return (
                <div className="text-center py-16 bg-white/50 rounded-3xl border border-slate-100 shadow-sm backdrop-blur-sm">
                    <CalendarIcon className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-500 text-lg font-medium">Please select a date from the calendar</p>
                </div>
            );
        }

        if (isLoadingAvail) {
            return (
                <div className="flex items-center justify-center p-20">
                    <div className="w-8 h-8 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
                </div>
            );
        }

        if (!currentAvail) return null;

        const {
            is_working_batch,
            booking_type,
            is_holiday,
            is_weekend,
            total_seats,
            designated_available,
            floater_available,
            waitlist_count,
            is_eligible,
            eligibility_reason,
            batch_name
        } = currentAvail;

        // Visual Mode Badge Colors
        let badgeColor = "bg-slate-100 text-slate-600 border-slate-200";
        if (booking_type === 'DESIGNATED') badgeColor = "bg-blue-50 text-blue-700 border-blue-200 shadow-blue-100";
        if (booking_type === 'FLOATER') badgeColor = "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-emerald-100";
        if (designated_available === 0 && floater_available === 0) badgeColor = "bg-amber-50 text-amber-700 border-amber-200 shadow-amber-100";

        const isFull = (booking_type === 'DESIGNATED' && designated_available === 0) ||
            (booking_type === 'FLOATER' && floater_available === 0);

        return (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                {/* Main Action Header */}
                <Card glass className="overflow-hidden border-slate-200/60 shadow-xl shadow-slate-200/40">
                    <div className={cn(
                        "h-2 w-full transition-colors duration-500",
                        booking_type === 'DESIGNATED' ? "bg-gradient-to-r from-blue-500 to-indigo-500" :
                            booking_type === 'FLOATER' ? "bg-gradient-to-r from-emerald-400 to-teal-500" : "bg-slate-300"
                    )}></div>
                    <CardContent className="p-8">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                                        {format(selectedDate, 'EEEE, MMMM d')}
                                    </h2>
                                    <span className={cn("px-3 py-1 rounded-full text-xs font-bold border tracking-wide uppercase", badgeColor)}>
                                        {isFull ? (waitlist_count > 0 ? 'Waitlist' : 'Full') : booking_type + ' SEAT'}
                                    </span>
                                </div>
                                <p className="text-slate-500 flex items-center gap-2 mt-2">
                                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                                    Live availability synced
                                </p>
                            </div>

                            <div className="flex-shrink-0">
                                <Button
                                    size="lg"
                                    className={cn(
                                        "w-full lg:w-auto text-lg px-8 py-6 rounded-2xl shadow-xl transition-all duration-300",
                                        isFull && is_eligible ? "bg-amber-500 hover:bg-amber-600 shadow-amber-200" : ""
                                    )}
                                    onClick={handleBookSeat}
                                    isLoading={bookingLoading}
                                    disabled={!is_eligible}
                                >
                                    {isFull ? 'Join Waitlist' : 'Confirm Booking'}
                                </Button>
                            </div>
                        </div>

                        {/* Eligibility / Error Display */}
                        {!is_eligible && (
                            <div className="mt-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-4">
                                <ShieldAlert className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-rose-900">Booking Currently Disabled</h4>
                                    <p className="text-rose-700 mt-1">{eligibility_reason}</p>
                                </div>
                            </div>
                        )}
                        {isFull && is_eligible && (
                            <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-4">
                                <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-amber-900">All Seats are Booked</h4>
                                    <p className="text-amber-700 mt-1">You may join the waitlist. You will be automatically assigned a seat if one becomes available before the day of the booking.</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Dynamic Eligibility Indicator */}
                    <Card glass className="shadow-lg border-slate-200/50 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 bg-indigo-50/50 rounded-full blur-3xl -mr-10 -mt-10"></div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                                <Info className="w-5 h-5 text-indigo-500" />
                                Your Status Overview
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-4 relative z-10">
                                <li className="flex justify-between items-center p-3 bg-white/60 rounded-lg border border-slate-100">
                                    <span className="text-slate-500 flex items-center gap-2"><Layers className="w-4 h-4" /> Assigned Batch</span>
                                    <span className="font-semibold text-slate-900">{batch_name}</span>
                                </li>
                                <li className="flex justify-between items-center p-3 bg-white/60 rounded-lg border border-slate-100">
                                    <span className="text-slate-500 flex items-center gap-2"><CalendarIcon className="w-4 h-4" /> Selected Date</span>
                                    <span className="font-semibold text-slate-900">{format(selectedDate, 'EEEE')}</span>
                                </li>
                                <li className="flex justify-between items-center p-3 bg-white/60 rounded-lg border border-slate-100">
                                    <span className="text-slate-500 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Eligible to Book</span>
                                    <span className={cn("font-bold", is_eligible ? "text-emerald-600" : "text-rose-600")}>
                                        {is_eligible ? 'YES' : 'NO'}
                                    </span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Seat Availability Counters */}
                    <Card glass className="shadow-lg border-slate-200/50 relative overflow-hidden">
                        <div className="absolute bottom-0 right-0 p-12 bg-emerald-50/50 rounded-full blur-3xl -mr-10 -mb-10"></div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                                <Server className="w-5 h-5 text-emerald-500" />
                                Floor Capacity Waitlist
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-3 relative z-10">
                                <div className="p-4 bg-white/80 rounded-xl border border-slate-100 text-center shadow-sm hover:shadow-md transition-all">
                                    <div className="text-3xl font-bold text-slate-800">{total_seats}</div>
                                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Total Seats</div>
                                </div>
                                <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-100 text-center shadow-sm hover:shadow-md transition-all">
                                    <div className="text-3xl font-bold text-amber-600">{waitlist_count}</div>
                                    <div className="text-xs font-semibold text-amber-700/70 uppercase tracking-wider mt-1">Waitlisted</div>
                                </div>
                                <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 text-center shadow-sm hover:shadow-md transition-all">
                                    <div className="text-3xl font-bold text-blue-600">{designated_available}</div>
                                    <div className="text-xs font-semibold text-blue-700/70 uppercase tracking-wider mt-1">Designated Available</div>
                                </div>
                                <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 text-center shadow-sm hover:shadow-md transition-all">
                                    <div className="text-3xl font-bold text-emerald-600">{floater_available}</div>
                                    <div className="text-xs font-semibold text-emerald-700/70 uppercase tracking-wider mt-1">Floater Available</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Non-Working Day Warning Banner & Floater Rules */}
                {!is_working_batch && !is_holiday && !is_weekend && (
                    <div className="bg-gradient-to-r from-sky-50 to-indigo-50 rounded-2xl p-6 border border-indigo-100/50 shadow-inner">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-indigo-100 rounded-xl">
                                <AlertTriangle className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-indigo-900">This is not your assigned batch working day.</h4>
                                <p className="text-indigo-800/80 mt-1 leading-relaxed">
                                    You may only reserve a <strong className="text-emerald-700">Floater Seat</strong> for this date.
                                </p>

                                <div className="mt-4 flex flex-col sm:flex-row gap-4">
                                    <div className="flex items-center gap-2 text-sm bg-white/60 px-4 py-2 rounded-lg border border-indigo-200/50">
                                        <Clock className="w-4 h-4 text-indigo-600" />
                                        <span className="text-indigo-900 font-medium">Book exactly 1 day before</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm bg-white/60 px-4 py-2 rounded-lg border border-indigo-200/50">
                                        <Clock className="w-4 h-4 text-indigo-600" />
                                        <span className="text-indigo-900 font-medium">Available after 3:00 PM</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Book a Workspace</h1>
                <p className="text-slate-500 mt-2 text-lg">Select an upcoming date to reserve your dedicated spot or floater seat.</p>
            </div>

            <div className="grid lg:grid-cols-[320px_1fr] gap-8 items-start">
                {/* Date Selector Sidebar */}
                {renderDateSelector()}

                {/* Booking Main Area */}
                {renderBookingPanel()}
            </div>
        </div>
    );
}
