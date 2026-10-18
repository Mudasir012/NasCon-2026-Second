import React, { useMemo, useState } from 'react';
import {
  Calendar,
  CalendarPlus,
  Clock,
  Link2,
  Link2Off,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Repeat,
  Globe,
  User,
  MapPin,
  Video,
  ListChecks,
  RefreshCw,
  ShieldCheck,
  History,
  Layers,
} from 'lucide-react';

const GOOGLE_OAUTH_SCOPES = [
  'See, edit, share and permanently delete all calendars you can access',
  'View your email address and basic profile',
  'Manage appointment slots and availability',
];

const EMPLOYEES = [
  { id: 'e1', name: 'Marcus Vance', role: 'Senior Sales Rep', tz: 'America/Los_Angeles', offset: -8, connected: true },
  { id: 'e2', name: 'Elena Rostova', role: 'Sales Manager', tz: 'America/New_York', offset: -5, connected: true },
  { id: 'e3', name: 'Priya Nair', role: 'Account Executive', tz: 'Europe/London', offset: 0, connected: true },
  { id: 'e4', name: 'David Okafor', role: 'Solutions Engineer', tz: 'Europe/London', offset: 0, connected: false },
  { id: 'e5', name: 'Sofia Almeida', role: 'Support Specialist', tz: 'Asia/Dubai', offset: 4, connected: true },
];

const CUSTOMER_TZ = { label: 'Customer time zone', tz: 'America/New_York', offset: -5 };

const CONTACTS = [
  { id: 'c1', name: 'Sarah Jenkins', opportunity: 'Commercial Solar Roof — 40 kW' },
  { id: 'c2', name: 'Daniel Mercer', opportunity: 'Portfolio Lead Routing Plan' },
  { id: 'c3', name: 'Aisha Rahman', opportunity: 'Multi-clinic Rollout' },
  { id: 'c4', name: "Liam O'Sullivan", opportunity: 'Industrial Rooftop Array — 320 kW' },
];

const WEEK_DAYS = [
  { label: 'Mon', date: 'Oct 20' },
  { label: 'Tue', date: 'Oct 21' },
  { label: 'Wed', date: 'Oct 22' },
  { label: 'Thu', date: 'Oct 23' },
  { label: 'Fri', date: 'Oct 24' },
];

const HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17];

const DURATIONS = [15, 30, 45, 60];

// Static "busy" slots (booked outside the app or personal holds) keyed by employeeId-day-hour.
const STATIC_BUSY = {
  'e1-2-10': 'Internal standup',
  'e1-4-14': 'Personal hold',
  'e2-0-9': 'Pipeline review',
  'e2-3-15': 'Account QBR',
  'e3-1-11': 'Demo — Cobalt Dental',
  'e5-4-16': 'Onboarding call',
};

function formatHour(hour) {
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const base = hour % 12 === 0 ? 12 : hour % 12;
  return `${base}:00 ${suffix}`;
}

// Convert an employee-local hour to a target timezone, using offsets relative to the same base.
function convertHour(employeeOffset, targetOffset, hour) {
  const delta = employeeOffset - targetOffset;
  const shifted = ((hour - delta) % 24 + 24) % 24;
  return formatHour(shifted);
}

function initialsOf(name) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
}

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[90] w-[min(92vw,22rem)]">
      <div className="pointer-events-auto flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
        <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${toast.tone === 'error' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
          {toast.tone === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
        </span>
        <p className="flex-1 text-sm text-slate-700">{toast.message}</p>
      </div>
    </div>
  );
}

const INITIAL_BOOKINGS = [
  { id: 'b1', title: 'On-site Inspection', contact: 'Sarah Jenkins', employeeId: 'e1', dayIndex: 4, hour: 10, duration: 60, dateLabel: 'Fri, Oct 24', status: 'Confirmed' },
  { id: 'b2', title: 'Contract Review Call', contact: 'Daniel Mercer', employeeId: 'e2', dayIndex: 1, hour: 14, duration: 30, dateLabel: 'Tue, Oct 21', status: 'Confirmed' },
  { id: 'b3', title: 'Compliance Discovery', contact: 'Aisha Rahman', employeeId: 'e3', dayIndex: 2, hour: 11, duration: 60, dateLabel: 'Wed, Oct 22', status: 'Pending' },
];

export default function CalendarBookingPage() {
  const [connection, setConnection] = useState('connected'); // connected | needs_reconnect | disconnected
  const [accountEmail, setAccountEmail] = useState('alex.mercer@omniflow.app');
  const [oauthOpen, setOauthOpen] = useState(false);
  const [view, setView] = useState('week');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('e1');
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS);
  const [timeline, setTimeline] = useState([
    { time: '1d ago', actor: 'Google Calendar Sync', text: 'Imported 14 external events into availability' },
    { time: '2d ago', actor: 'Elena Rostova', text: 'Rescheduled “Contract Review Call” to Tue, Oct 21 · 2:00 PM' },
  ]);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [toast, setToast] = useState(null);

  const [form, setForm] = useState({
    contactId: CONTACTS[0].id,
    employeeId: 'e1',
    dayIndex: 0,
    hour: 10,
    duration: 30,
    confirmOverlap: false,
  });
  const [rescheduleForm, setRescheduleForm] = useState({ dayIndex: 0, hour: 9 });

  const pushToast = (message, tone = 'success') => {
    setToast({ message, tone });
    window.setTimeout(() => setToast(null), 3200);
  };

  const selectedEmployee = EMPLOYEES.find((e) => e.id === selectedEmployeeId);
  const upcoming = useMemo(
    () => [...bookings].sort((a, b) => a.dayIndex - b.dayIndex || a.hour - b.hour),
    [bookings],
  );

  function busyLabel(employeeId, dayIndex, hour) {
    const staticBusy = STATIC_BUSY[`${employeeId}-${dayIndex}-${hour}`];
    if (staticBusy) return staticBusy;
    const booked = bookings.find((b) => b.employeeId === employeeId && b.dayIndex === dayIndex && b.hour === hour);
    if (booked) return booked.title;
    return null;
  }

  function isOverlap(employeeId, dayIndex, hour, duration, ignoreId) {
    const end = hour + duration / 60;
    return bookings.some((b) => {
      if (b.id === ignoreId) return false;
      if (b.employeeId !== employeeId || b.dayIndex !== dayIndex) return false;
      const bEnd = b.hour + b.duration / 60;
      return hour < bEnd && end > b.hour;
    });
  }

  function addTimeline(actor, text) {
    setTimeline((prev) => [{ time: 'Just now', actor, text }, ...prev]);
  }

  function handleConnect() {
    setOauthOpen(true);
  }

  function confirmOauth() {
    setOauthOpen(false);
    setConnection('connected');
    pushToast('Google Calendar connected via OAuth 2.0');
    addTimeline('Alex Mercer', 'Connected Google Calendar (OAuth consent granted)');
  }

  function handleDisconnect() {
    setConnection('disconnected');
    pushToast('Google Calendar disconnected', 'error');
    addTimeline('Alex Mercer', 'Disconnected Google Calendar');
  }

  function openBooking(dayIndex = form.dayIndex, hour = form.hour) {
    setForm((prev) => ({ ...prev, dayIndex, hour, employeeId: selectedEmployeeId, confirmOverlap: false }));
    setBookingOpen(true);
  }

  function submitBooking(event) {
    event.preventDefault();
    const employee = EMPLOYEES.find((e) => e.id === form.employeeId);
    if (!employee.connected) {
      pushToast('Cannot book: that employee has no connected calendar', 'error');
      return;
    }
    const overlap = isOverlap(form.employeeId, form.dayIndex, form.hour, form.duration);
    if (overlap && !form.confirmOverlap) {
      pushToast('Slot overlaps an existing booking — confirm to override', 'error');
      return;
    }
    const contact = CONTACTS.find((c) => c.id === form.contactId);
    const day = WEEK_DAYS[form.dayIndex];
    const booking = {
      id: `b-${Date.now()}`,
      title: `${contact.name} — ${contact.opportunity}`,
      contact: contact.name,
      employeeId: form.employeeId,
      dayIndex: form.dayIndex,
      hour: form.hour,
      duration: form.duration,
      dateLabel: `${day.label}, ${day.date}`,
      status: 'Confirmed',
    };
    setBookings((prev) => [...prev, booking]);
    setBookingOpen(false);
    pushToast(`Booked ${day.label} ${formatHour(form.hour)} with ${employee.name}`);
    addTimeline('Alex Mercer', `Booked “${booking.title}” on ${booking.dateLabel} · ${formatHour(booking.hour)}`);
  }

  function submitReschedule(event) {
    event.preventDefault();
    const target = rescheduleTarget;
    if (!target) return;
    const employee = EMPLOYEES.find((e) => e.id === target.employeeId);
    if (!employee.connected) {
      pushToast('Cannot reschedule: employee calendar not connected', 'error');
      return;
    }
    if (isOverlap(target.employeeId, rescheduleForm.dayIndex, rescheduleForm.hour, target.duration, target.id)) {
      pushToast('New slot overlaps an existing booking', 'error');
      return;
    }
    const day = WEEK_DAYS[rescheduleForm.dayIndex];
    setBookings((prev) =>
      prev.map((b) => (b.id === target.id ? { ...b, dayIndex: rescheduleForm.dayIndex, hour: rescheduleForm.hour, dateLabel: `${day.label}, ${day.date}` } : b)),
    );
    setRescheduleTarget(null);
    pushToast('Appointment rescheduled and invite updated');
    addTimeline('Alex Mercer', `Rescheduled “${target.title}” to ${day.label}, ${day.date} · ${formatHour(rescheduleForm.hour)}`);
  }

  function confirmCancel() {
    if (!cancelTarget) return;
    setBookings((prev) => prev.filter((b) => b.id !== cancelTarget.id));
    pushToast('Appointment cancelled — contact notified', 'error');
    addTimeline('Alex Mercer', `Cancelled “${cancelTarget.title}” originally on ${cancelTarget.dateLabel}`);
    setCancelTarget(null);
  }

  const connectionBadge = {
    connected: { label: 'Connected', chip: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20', dot: 'bg-emerald-500' },
    needs_reconnect: { label: 'Needs reconnection', chip: 'bg-amber-50 text-amber-700 ring-amber-600/20', dot: 'bg-amber-500' },
    disconnected: { label: 'Not connected', chip: 'bg-slate-100 text-slate-500 ring-slate-500/20', dot: 'bg-slate-400' },
  }[connection];

  const formEmployee = EMPLOYEES.find((e) => e.id === form.employeeId);
  const formOverlap = isOverlap(form.employeeId, form.dayIndex, form.hour, form.duration);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">Calendar & Appointments</h1>
            <p className="text-sm text-slate-500">Google Calendar booking with conflict detection (I3.1–I3.7).</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-sm">
              {[{ id: 'week', label: 'Week' }, { id: 'month', label: 'Month' }].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setView(option.id)}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${view === option.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => openBooking()}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              <CalendarPlus className="h-4 w-4" /> New booking
            </button>
          </div>
        </header>

        {/* Connection panel */}
        <section className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                  <path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.4z" />
                  <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.7-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z" />
                  <path fill="#FBBC05" d="M6.4 13.9a6 6 0 0 1 0-3.8V7.5H3.1a10 10 0 0 0 0 9l3.3-2.6z" />
                  <path fill="#EA4335" d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.8-2.8A10 10 0 0 0 3.1 7.5l3.3 2.6C7.2 7.6 9.4 5.9 12 5.9z" />
                </svg>
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-800">Google Calendar</p>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${connectionBadge.chip}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${connectionBadge.dot}`} /> {connectionBadge.label}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {connection === 'disconnected' ? 'Connect an account to enable booking and conflict checks.' : `Signed in as ${accountEmail} · primary calendar`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {connection !== 'connected' && (
                <button
                  type="button"
                  onClick={handleConnect}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
                >
                  <Link2 className="h-3.5 w-3.5" /> {connection === 'needs_reconnect' ? 'Reconnect' : 'Connect'}
                </button>
              )}
              {connection === 'connected' && (
                <button
                  type="button"
                  onClick={() => setConnection('needs_reconnect')}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Simulate token expiry
                </button>
              )}
              {connection !== 'disconnected' && (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  <Link2Off className="h-3.5 w-3.5" /> Disconnect
                </button>
              )}
            </div>
          </div>

          {connection === 'needs_reconnect' && (
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <p className="text-xs text-amber-800">
                <span className="font-semibold">Needs reconnection.</span> The OAuth refresh token was revoked or expired. Reconnect to resume syncing
                availability and creating events.
              </p>
            </div>
          )}
        </section>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Calendar */}
          <section className="lg:col-span-2">
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <h2 className="text-sm font-semibold text-slate-800">October 2026</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Employee:</span>
                  <select
                    value={selectedEmployeeId}
                    onChange={(event) => setSelectedEmployeeId(event.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-400"
                  >
                    {EMPLOYEES.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.name}{employee.connected ? '' : ' (no calendar)'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {!selectedEmployee?.connected ? (
                <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-500">
                    <AlertTriangle className="h-6 w-6" />
                  </span>
                  <p className="text-sm font-semibold text-slate-800">Cannot be booked: calendar not connected</p>
                  <p className="max-w-sm text-sm text-slate-500">
                    {selectedEmployee?.name} has no connected Google Calendar. Booking and conflict detection are disabled until they connect an account.
                  </p>
                </div>
              ) : view === 'week' ? (
                <div className="overflow-x-auto p-3">
                  <div className="min-w-[560px]">
                    <div className="grid grid-cols-[64px_repeat(5,1fr)] gap-1">
                      <div />
                      {WEEK_DAYS.map((day) => (
                        <div key={day.label} className="rounded-lg bg-slate-50 py-1.5 text-center">
                          <p className="text-xs font-semibold text-slate-600">{day.label}</p>
                          <p className="text-[10px] text-slate-400">{day.date}</p>
                        </div>
                      ))}
                      {HOURS.map((hour) => (
                        <React.Fragment key={hour}>
                          <div className="py-1 pr-1 text-right text-[10px] font-medium text-slate-400">{formatHour(hour)}</div>
                          {WEEK_DAYS.map((day, dayIndex) => {
                            const busy = busyLabel(selectedEmployeeId, dayIndex, hour);
                            return (
                              <button
                                key={`${day.label}-${hour}`}
                                type="button"
                                onClick={() => !busy && openBooking(dayIndex, hour)}
                                className={`min-h-[42px] rounded-lg border px-2 py-1 text-left text-[10px] transition ${
                                  busy
                                    ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
                                    : 'border-slate-100 bg-white text-transparent hover:border-indigo-300 hover:bg-indigo-50/50'
                                }`}
                              >
                                {busy && (
                                  <span className="flex items-center gap-1 font-medium leading-tight">
                                    <Clock className="h-2.5 w-2.5 shrink-0" />
                                    <span className="line-clamp-2">{busy}</span>
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </div>
                    <p className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
                      <Layers className="h-3 w-3" /> Greyed slots are busy (booked or external holds). Times shown in {selectedEmployee.tz}.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3">
                  <div className="grid grid-cols-7 gap-1">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                      <div key={d} className="py-1 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-400">{d}</div>
                    ))}
                    {Array.from({ length: 35 }).map((_, index) => {
                      const dayNumber = index - 2;
                      const inMonth = dayNumber >= 1 && dayNumber <= 31;
                      const dayIndex = WEEK_DAYS.findIndex((d) => Number(d.date.split(' ')[1]) === dayNumber);
                      const dayBookings = inMonth ? bookings.filter((b) => b.dayIndex === dayIndex && dayIndex !== -1) : [];
                      return (
                        <div
                          key={index}
                          className={`min-h-[70px] rounded-lg border p-1.5 ${
                            inMonth ? 'border-slate-100 bg-white' : 'border-transparent bg-slate-50/50'
                          }`}
                        >
                          {inMonth && (
                            <>
                              <p className="text-[10px] font-semibold text-slate-500">{dayNumber}</p>
                              {dayBookings.slice(0, 2).map((b) => (
                                <p key={b.id} className="mt-0.5 truncate rounded bg-indigo-50 px-1 py-0.5 text-[9px] font-medium text-indigo-700">
                                  {formatHour(b.hour)}
                                </p>
                              ))}
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Upcoming + timeline */}
          <section className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
                <ListChecks className="h-4 w-4 text-slate-400" /> Upcoming appointments
              </h2>
              {upcoming.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-400">No appointments scheduled.</p>
              ) : (
                <ul className="space-y-2.5">
                  {upcoming.map((booking) => {
                    const employee = EMPLOYEES.find((e) => e.id === booking.employeeId);
                    return (
                      <li key={booking.id} className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-slate-800">{booking.title}</p>
                            <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-500">
                              <Clock className="h-3 w-3" /> {booking.dateLabel} · {formatHour(booking.hour)} ({booking.duration}m)
                            </p>
                            <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-400">
                              <User className="h-3 w-3" /> {employee?.name} · {employee?.tz}
                            </p>
                          </div>
                          <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${booking.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : 'bg-amber-50 text-amber-700 ring-amber-600/20'}`}>
                            {booking.status}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setRescheduleTarget(booking);
                              setRescheduleForm({ dayIndex: booking.dayIndex, hour: booking.hour });
                            }}
                            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50"
                          >
                            <Repeat className="h-3 w-3" /> Reschedule
                          </button>
                          <button
                            type="button"
                            onClick={() => setCancelTarget(booking)}
                            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-rose-600 transition hover:bg-rose-50"
                          >
                            <X className="h-3 w-3" /> Cancel
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
                <History className="h-4 w-4 text-slate-400" /> Activity timeline
              </h2>
              <ol className="space-y-3">
                {timeline.map((entry, index) => (
                  <li key={index} className="flex gap-2.5">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
                    <div className="min-w-0">
                      <p className="text-xs text-slate-600">{entry.text}</p>
                      <p className="text-[10px] text-slate-400">{entry.actor} · {entry.time}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        </div>
      </div>

      {/* OAuth consent modal */}
      {oauthOpen && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-4">
          <button type="button" aria-label="Close dialog" className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setOauthOpen(false)} />
          <div className="relative z-10 w-full rounded-t-2xl bg-white p-5 shadow-2xl sm:max-w-md sm:rounded-2xl">
            <div className="mb-3 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                <ShieldCheck className="h-5 w-5 text-slate-600" />
              </span>
              <div>
                <h2 className="text-base font-semibold text-slate-900">Sign in with Google</h2>
                <p className="text-xs text-slate-500">Mock OAuth 2.0 consent screen</p>
              </div>
            </div>
            <p className="text-sm text-slate-600">OmniFlow is requesting access to your Google Account:</p>
            <ul className="mt-3 space-y-2">
              {GOOGLE_OAUTH_SCOPES.map((scope) => (
                <li key={scope} className="flex items-start gap-2 text-xs text-slate-600">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" /> {scope}
                </li>
              ))}
            </ul>
            <label className="mt-4 block">
              <span className="mb-1.5 block text-xs font-medium text-slate-500">Google account</span>
              <input
                value={accountEmail}
                onChange={(event) => setAccountEmail(event.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </label>
            <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
              <button type="button" onClick={() => setOauthOpen(false)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
                Cancel
              </button>
              <button type="button" onClick={confirmOauth} className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700">
                <Link2 className="h-4 w-4" /> Allow access
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking modal */}
      {bookingOpen && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-4">
          <button type="button" aria-label="Close dialog" className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setBookingOpen(false)} />
          <div className="relative z-10 max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl sm:max-w-lg sm:rounded-2xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">New booking</h2>
                <p className="text-sm text-slate-500">Conflict detection runs against the employee&apos;s Google Calendar.</p>
              </div>
              <button type="button" aria-label="Close" onClick={() => setBookingOpen(false)} className="rounded-lg border border-slate-200 p-1.5 text-slate-400 transition hover:bg-slate-50">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={submitBooking} className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-slate-500">Contact / opportunity</span>
                <select
                  value={form.contactId}
                  onChange={(event) => setForm((prev) => ({ ...prev, contactId: event.target.value }))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                >
                  {CONTACTS.map((contact) => (
                    <option key={contact.id} value={contact.id}>{contact.name} · {contact.opportunity}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-slate-500">Employee</span>
                <select
                  value={form.employeeId}
                  onChange={(event) => setForm((prev) => ({ ...prev, employeeId: event.target.value, confirmOverlap: false }))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                >
                  {EMPLOYEES.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name} — {employee.connected ? employee.tz : 'calendar not connected'}
                    </option>
                  ))}
                </select>
              </label>

              {!formEmployee?.connected ? (
                <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  <p className="text-xs text-amber-800">
                    <span className="font-semibold">Cannot be booked: calendar not connected.</span> Select another employee or ask {formEmployee?.name} to connect Google Calendar.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <label className="block sm:col-span-1">
                      <span className="mb-1.5 block text-xs font-medium text-slate-500">Date</span>
                      <select
                        value={form.dayIndex}
                        onChange={(event) => setForm((prev) => ({ ...prev, dayIndex: Number(event.target.value), confirmOverlap: false }))}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-400"
                      >
                        {WEEK_DAYS.map((day, index) => (
                          <option key={day.label} value={index}>{day.label}, {day.date}</option>
                        ))}
                      </select>
                    </label>
                    <label className="block sm:col-span-1">
                      <span className="mb-1.5 block text-xs font-medium text-slate-500">Time</span>
                      <select
                        value={form.hour}
                        onChange={(event) => setForm((prev) => ({ ...prev, hour: Number(event.target.value), confirmOverlap: false }))}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-400"
                      >
                        {HOURS.map((hour) => {
                          const busy = busyLabel(form.employeeId, form.dayIndex, hour);
                          return (
                            <option key={hour} value={hour} disabled={Boolean(busy)}>
                              {formatHour(hour)}{busy ? ` — busy (${busy})` : ''}
                            </option>
                          );
                        })}
                      </select>
                    </label>
                    <label className="block sm:col-span-1">
                      <span className="mb-1.5 block text-xs font-medium text-slate-500">Duration</span>
                      <select
                        value={form.duration}
                        onChange={(event) => setForm((prev) => ({ ...prev, duration: Number(event.target.value), confirmOverlap: false }))}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-400"
                      >
                        {DURATIONS.map((duration) => (
                          <option key={duration} value={duration}>{duration} min</option>
                        ))}
                      </select>
                    </label>
                  </div>

                  {/* Dual time zone display */}
                  <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-slate-50/60 p-3">
                    <div>
                      <p className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                        <Globe className="h-3 w-3" /> {formEmployee.tz} (employee)
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-slate-800">{formatHour(form.hour)}</p>
                    </div>
                    <div>
                      <p className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                        <Globe className="h-3 w-3" /> {CUSTOMER_TZ.tz} (customer)
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-slate-800">{convertHour(formEmployee.offset, CUSTOMER_TZ.offset, form.hour)}</p>
                    </div>
                  </div>

                  {formOverlap && (
                    <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                      <div className="text-xs text-rose-700">
                        <p className="font-semibold">This slot overlaps an existing booking.</p>
                        <label className="mt-1.5 flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={form.confirmOverlap}
                            onChange={(event) => setForm((prev) => ({ ...prev, confirmOverlap: event.target.checked }))}
                            className="h-3.5 w-3.5 rounded border-rose-300"
                          />
                          Override and double-book anyway
                        </label>
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                <button type="button" onClick={() => setBookingOpen(false)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!formEmployee?.connected || (formOverlap && !form.confirmOverlap)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <CalendarPlus className="h-4 w-4" /> Book slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reschedule modal */}
      {rescheduleTarget && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-4">
          <button type="button" aria-label="Close dialog" className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setRescheduleTarget(null)} />
          <div className="relative z-10 w-full rounded-t-2xl bg-white p-5 shadow-2xl sm:max-w-md sm:rounded-2xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Reschedule appointment</h2>
                <p className="text-sm text-slate-500">{rescheduleTarget.title}</p>
              </div>
              <button type="button" aria-label="Close" onClick={() => setRescheduleTarget(null)} className="rounded-lg border border-slate-200 p-1.5 text-slate-400 transition hover:bg-slate-50">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={submitReschedule} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-500">New date</span>
                  <select
                    value={rescheduleForm.dayIndex}
                    onChange={(event) => setRescheduleForm((prev) => ({ ...prev, dayIndex: Number(event.target.value) }))}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-indigo-400"
                  >
                    {WEEK_DAYS.map((day, index) => (
                      <option key={day.label} value={index}>{day.label}, {day.date}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-500">New time</span>
                  <select
                    value={rescheduleForm.hour}
                    onChange={(event) => setRescheduleForm((prev) => ({ ...prev, hour: Number(event.target.value) }))}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-indigo-400"
                  >
                    {HOURS.map((hour) => (
                      <option key={hour} value={hour}>{formatHour(hour)}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                <button type="button" onClick={() => setRescheduleTarget(null)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
                  Keep current
                </button>
                <button type="submit" className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700">
                  <Repeat className="h-4 w-4" /> Confirm reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel confirmation */}
      {cancelTarget && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-4">
          <button type="button" aria-label="Close dialog" className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setCancelTarget(null)} />
          <div className="relative z-10 w-full rounded-t-2xl bg-white p-5 shadow-2xl sm:max-w-md sm:rounded-2xl">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                <AlertTriangle className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-base font-semibold text-slate-900">Cancel this appointment?</h2>
                <p className="mt-1 text-sm text-slate-500">
                  “{cancelTarget.title}” on {cancelTarget.dateLabel} · {formatHour(cancelTarget.hour)} will be removed from the employee&apos;s Google Calendar
                  and the contact will be notified. This adds an entry to the activity timeline.
                </p>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
              <button type="button" onClick={() => setCancelTarget(null)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
                Keep appointment
              </button>
              <button type="button" onClick={confirmCancel} className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700">
                <X className="h-4 w-4" /> Cancel appointment
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast toast={toast} />
    </div>
  );
}
