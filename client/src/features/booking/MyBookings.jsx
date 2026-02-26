import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import api from '../../services/api';
import { format, isFuture, isToday } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { CalendarDays, MapPin, Tag, Clock, CheckCircle, Ban, AlertCircle } from 'lucide-react';
import { Skeleton } from '../../components/ui/Skeleton';

export default function MyBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancellingId, setCancellingId] = useState(null);
    const { addToast } = useToast();

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const { data } = await api.get('/bookings/my');
            setBookings(data.data || []);
        } catch (error) {
            addToast({
                title: 'Error loading bookings',
                description: error.response?.data?.error || 'Failed to fetch your bookings',
                variant: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCancelBooking = async (id) => {
        if (!window.confirm("Are you sure you want to cancel this booking?")) return;

        setCancellingId(id);
        try {
            await api.delete(`/bookings/${id}`);
            addToast({
                title: 'Booking Cancelled',
                description: 'Your seat has been released successfully.',
                variant: 'success'
            });
            // Optionally re-fetch, but optimistic UI removal is snappier
            setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'CANCELLED' } : b));
        } catch (error) {
            addToast({
                title: 'Cancellation Failed',
                description: error.response?.data?.error || 'Could not cancel booking',
                variant: 'error'
            });
        } finally {
            setCancellingId(null);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'BOOKED':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"><CheckCircle className="w-3 h-3 mr-1" /> Confirmed</span>;
            case 'WAITLISTED':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800"><AlertCircle className="w-3 h-3 mr-1" /> Waitlist</span>;
            case 'CANCELLED':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800"><Ban className="w-3 h-3 mr-1" /> Cancelled</span>;
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Bookings</h1>
                    <p className="text-slate-500">Manage your upcoming office visits</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map(i => (
                        <Card key={i} className="p-6">
                            <Skeleton className="h-6 w-1/2 mb-4" />
                            <Skeleton className="h-4 w-1/3 mb-2" />
                            <Skeleton className="h-4 w-1/4 mb-6" />
                            <Skeleton className="h-10 w-full" />
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    const upcomingBookings = bookings.filter(b => b.status !== 'CANCELLED' && b.booking_date && (isFuture(new Date(b.booking_date)) || isToday(new Date(b.booking_date))));
    const pastBookings = bookings.filter(b => b.status === 'CANCELLED' || !b.booking_date || (!isFuture(new Date(b.booking_date)) && !isToday(new Date(b.booking_date))));

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Bookings</h1>
            </div>

            <section>
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Upcoming Schedule</h2>
                {upcomingBookings.length === 0 ? (
                    <Card className="border-dashed shadow-none bg-slate-50/50">
                        <CardContent className="flex flex-col items-center justify-center h-48 text-center">
                            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-3">
                                <CalendarDays className="w-6 h-6" />
                            </div>
                            <h3 className="text-sm font-medium text-slate-900 mb-1">No upcoming bookings</h3>
                            <p className="text-sm text-slate-500 max-w-sm mb-4">You haven't scheduled any in-office days. Book a seat to collaborate with your team.</p>
                            <Button onClick={() => window.location.href = '/dashboard/book'}>Book a Seat</Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {upcomingBookings.map((booking) => (
                            <Card key={booking.id} glass className="group hover:border-indigo-200 transition-all">
                                <CardHeader className="pb-3 border-b border-slate-100/50">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-lg flex items-center text-slate-800 gap-2">
                                                {booking.booking_date ? format(new Date(booking.booking_date), 'EEEE') : 'Unknown Date'}
                                            </CardTitle>
                                            <CardDescription className="text-slate-500 font-medium">
                                                {booking.booking_date ? format(new Date(booking.booking_date), 'MMM d, yyyy') : ''}
                                            </CardDescription>
                                        </div>
                                        {getStatusBadge(booking.status)}
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4 pb-2 space-y-3">
                                    {booking.status === 'BOOKED' && (
                                        <div className="flex items-center text-sm text-slate-600 bg-indigo-50/50 rounded-lg p-2.5 border border-indigo-100">
                                            <MapPin className="w-4 h-4 mr-2 text-indigo-500 shrink-0" />
                                            <span className="font-semibold text-indigo-900 mr-2">Seat {booking.seat?.seat_number}</span>
                                            <span className="text-xs px-2 py-0.5 bg-white rounded text-slate-500 border border-slate-200 ml-auto">
                                                {booking.seat?.seat_type}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex items-center text-sm text-slate-600">
                                        <Tag className="w-4 h-4 mr-3 text-slate-400" />
                                        Booking Type: <span className="ml-1 font-medium text-slate-800">{booking.booking_type}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-slate-600">
                                        Booked at: {booking.created_at ? format(new Date(booking.created_at), 'MMM d, h:mm a') : 'Unknown'}
                                    </div>
                                </CardContent>
                                <div className="p-4 pt-0">
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        className="w-full opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity disabled:opacity-50"
                                        isLoading={cancellingId === booking.id}
                                        onClick={() => handleCancelBooking(booking.id)}
                                    >
                                        Cancel Booking
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </section>

            {pastBookings.length > 0 && (
                <section>
                    <h2 className="text-lg font-semibold text-slate-800 mb-4">Past & Cancelled</h2>
                    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                        <div className="divide-y divide-slate-100">
                            {pastBookings.slice(0, 5).map((booking) => (
                                <div key={booking.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                            <CalendarDays className="w-5 h-5 text-slate-500" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-800">{booking.booking_date ? format(new Date(booking.booking_date), 'MMM d, yyyy') : 'Unknown Date'}</p>
                                            <p className="text-xs text-slate-500">
                                                {booking.seat?.seat_number ? `Seat ${booking.seat.seat_number}` : 'No seat assigned'} • {booking.booking_type}
                                            </p>
                                        </div>
                                    </div>
                                    <div>{getStatusBadge(booking.status)}</div>
                                </div>
                            ))}
                        </div>
                        {pastBookings.length > 5 && (
                            <div className="p-3 border-t bg-slate-50 text-center text-sm text-indigo-600 font-medium tracking-wide">
                                Showing most recent 5 entries
                            </div>
                        )}
                    </div>
                </section>
            )}
        </div>
    );
}
