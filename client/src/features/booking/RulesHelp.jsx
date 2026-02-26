import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Clock, Briefcase, CalendarX, AlertTriangle, Users } from 'lucide-react';

export default function RulesHelp() {
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Workspace Rules & Help</h1>
                <p className="text-slate-500 mt-1">Understanding how our Hybrid Seat Booking system works.</p>
            </div>

            <div className="grid gap-6">
                <Card glass className="border-indigo-100 shadow-lg shadow-indigo-100/40">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-indigo-700">
                            <Briefcase className="w-5 h-5" />
                            1. The "Batch" System (Designated Days)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-slate-600">
                        <p>Every employee belongs to a specific working batch that designates which days they are expected in the office.</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li><strong>Batch 1:</strong> Works Monday, Tuesday, Wednesday.</li>
                            <li><strong>Batch 2:</strong> Works Thursday, Friday.</li>
                        </ul>
                        <p className="text-sm bg-indigo-50 p-3 rounded-lg border border-indigo-100 mt-4 text-indigo-800">
                            On your designated working days, you have priority access to reserve a <strong>Designated Seat</strong>. You can book these seats up to 14 days in advance without any restrictions.
                        </p>
                    </CardContent>
                </Card>

                <Card glass className="border-amber-100 shadow-lg shadow-amber-100/40 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-amber-700">
                            <Clock className="w-5 h-5" />
                            2. The "3 PM Rule" (Floater Access)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-slate-600">
                        <p>If you want to come into the office on a day that is <strong>NOT</strong> part of your Batch (e.g., a Batch 1 employee wanting to come in on Thursday), you must book a <strong>Floater Seat</strong>.</p>

                        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 mt-4">
                            <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                Strict Booking Condition
                            </h4>
                            <p className="text-sm text-amber-800">
                                Floater seats can <strong>ONLY</strong> be booked exactly one day in advance, and <strong>strictly after 3:00 PM</strong> server time.
                            </p>
                            <p className="text-sm text-amber-800 mt-2">
                                At 3:00 PM, any unbooked Designated seats for the following day are automatically converted into additional Floater seats for anyone to grab.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card glass className="border-emerald-100 shadow-lg shadow-emerald-100/40">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-emerald-700">
                            <Users className="w-5 h-5" />
                            3. The Automatic Waitlist
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-slate-600">
                        <p>If all 50 seats (40 designated, 10 floaters) are fully booked for a given day, our system will prevent further bookings. Instead, your request will automatically place you on the <strong>Waitlist</strong>.</p>
                        <p>If someone cancels their booking, the system will immediately and automatically promote the first person on the waitlist into that newly freed seat.</p>
                    </CardContent>
                </Card>

                <Card glass className="border-rose-100 shadow-lg shadow-rose-100/40">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-rose-700">
                            <CalendarX className="w-5 h-5" />
                            4. Weekends & Holidays
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-slate-600">
                        <p>The office is closed on Weekends. The system will inherently grey-out and block any attempt to book a seat on a Saturday or Sunday.</p>
                        <p>Similarly, Administrators can configure company-wide Public Holidays in the settings, which will also completely restrict all seat bookings for that specific date.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
