import React, { useMemo, useRef, useState } from 'react';
import {
  Search,
  Send,
  Check,
  CheckCheck,
  AlertCircle,
  AlertTriangle,
  RotateCcw,
  MessageSquare,
  Phone,
  BellOff,
  Zap,
  ChevronLeft,
  Info,
  ShieldCheck,
  UserPlus,
  Link2,
  X,
  FlaskConical,
  Plus,
  Paperclip,
} from 'lucide-react';

const CHANNELS = {
  WhatsApp: { chip: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20', dot: 'bg-emerald-500' },
  SMS: { chip: 'bg-sky-50 text-sky-700 ring-sky-600/20', dot: 'bg-sky-500' },
};

const MATCH_STATES = {
  matched: { label: 'Matched to existing contact', tone: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20', icon: Link2 },
  created: { label: 'New contact and lead created', tone: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20', icon: UserPlus },
};

const INITIAL_CONVERSATIONS = [
  {
    id: 'cv1',
    name: 'Sarah Jenkins',
    phone: '+1 (415) 555-0132',
    channel: 'WhatsApp',
    assignee: { name: 'Marcus Vance', initials: 'MV' },
    unread: 2,
    optedOut: false,
    match: 'matched',
    messages: [
      { id: 'm1', dir: 'in', body: 'Hi! We reviewed the proposal — it looks good. Can we lock in the site inspection for Friday?', time: '09:14', status: 'delivered' },
      { id: 'm2', dir: 'out', body: 'Absolutely. Friday 10:00 AM works — I have just sent the calendar invite.', time: '09:22', status: 'read' },
      { id: 'm3', dir: 'out', body: 'I also generated the $500 deposit link so we can hold the crew slot.', time: '09:23', status: 'delivered' },
      { id: 'm4', dir: 'out', body: 'Reminder: please confirm the loading-dock access window.', time: '09:25', status: 'failed', error: 'Undeliverable — recipient has not opted in to the Twilio sandbox (error 63015).' },
    ],
  },
  {
    id: 'cv2',
    name: 'Daniel Mercer',
    phone: '+1 (206) 555-0177',
    channel: 'WhatsApp',
    assignee: { name: 'Elena Rostova', initials: 'ER' },
    unread: 0,
    optedOut: false,
    match: 'matched',
    messages: [
      { id: 'm1', dir: 'in', body: 'Can we discount if we commit to 24 months instead of 12?', time: '11:02', status: 'delivered' },
      { id: 'm2', dir: 'out', body: 'Yes — annual commitment unlocks the 15% tier. Sending the revised quote now.', time: '11:09', status: 'read' },
    ],
  },
  {
    id: 'cv3',
    name: 'Aisha Rahman',
    phone: '+1 (312) 555-0198',
    channel: 'SMS',
    assignee: { name: 'Priya Nair', initials: 'PN' },
    unread: 1,
    optedOut: false,
    match: 'matched',
    messages: [
      { id: 'm1', dir: 'in', body: 'Our compliance officer needs a summary of where patient data is stored.', time: '08:40', status: 'delivered' },
    ],
  },
  {
    id: 'cv4',
    name: 'Grace Lin',
    phone: '+1 (646) 555-0121',
    channel: 'WhatsApp',
    assignee: { name: 'Elena Rostova', initials: 'ER' },
    unread: 0,
    optedOut: true,
    match: 'matched',
    messages: [
      { id: 'm1', dir: 'out', body: 'Welcome aboard, Grace! Your workspace is live.', time: 'Oct 09 · 14:05', status: 'read' },
      { id: 'm2', dir: 'in', body: 'STOP', time: 'Oct 09 · 14:30', status: 'delivered' },
    ],
  },
  {
    id: 'cv5',
    name: '+1 (480) 555-0166',
    phone: '+1 (480) 555-0166',
    channel: 'WhatsApp',
    assignee: { name: 'Jonas Weber', initials: 'JW' },
    unread: 3,
    optedOut: false,
    match: 'created',
    messages: [
      { id: 'm1', dir: 'in', body: 'Hi, I saw your ad — can you send pricing for a rooftop system?', time: '07:12', status: 'delivered' },
    ],
  },
];

function lastMessage(conversation) {
  return conversation.messages[conversation.messages.length - 1];
}

function StatusIcon({ status }) {
  if (status === 'failed') return <AlertCircle className="h-3.5 w-3.5 text-rose-300" />;
  if (status === 'read') return <CheckCheck className="h-3.5 w-3.5 text-sky-300" />;
  if (status === 'delivered') return <CheckCheck className="h-3.5 w-3.5" />;
  return <Check className="h-3.5 w-3.5" />;
}

const STATUS_LABEL = { sent: 'Sent', delivered: 'Delivered', read: 'Read', failed: 'Failed' };

export default function MessagingChatPage() {
  const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS);
  const [selectedId, setSelectedId] = useState('cv1');
  const [mobilePane, setMobilePane] = useState('thread');
  const [search, setSearch] = useState('');
  const [channelFilter, setChannelFilter] = useState('all');
  const [draft, setDraft] = useState('');
  const [toast, setToast] = useState(null);
  const incomingCount = useRef(0);

  const pushToast = (message, tone = 'success') => {
    setToast({ message, tone });
    window.setTimeout(() => setToast(null), 3000);
  };

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return conversations.filter((conversation) => {
      const matchesQuery = !query || `${conversation.name} ${conversation.phone}`.toLowerCase().includes(query);
      const matchesChannel = channelFilter === 'all' || conversation.channel === channelFilter;
      return matchesQuery && matchesChannel;
    });
  }, [conversations, search, channelFilter]);

  const selected = conversations.find((conversation) => conversation.id === selectedId) || null;
  const totalUnread = conversations.reduce((sum, conversation) => sum + conversation.unread, 0);

  function openConversation(id) {
    setSelectedId(id);
    setMobilePane('thread');
    setConversations((prev) => prev.map((conversation) => (conversation.id === id ? { ...conversation, unread: 0 } : conversation)));
  }

  function patchSelected(updater) {
    setConversations((prev) => prev.map((conversation) => (conversation.id === selectedId ? updater(conversation) : conversation)));
  }

  function sendMessage() {
    const body = draft.trim();
    if (!body || !selected || selected.optedOut) return;
    const id = `m-${Date.now()}`;
    patchSelected((conversation) => ({
      ...conversation,
      messages: [...conversation.messages, { id, dir: 'out', body, time: 'Just now', status: 'sent' }],
    }));
    setDraft('');
    window.setTimeout(() => {
      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === selectedId
            ? { ...conversation, messages: conversation.messages.map((message) => (message.id === id ? { ...message, status: 'delivered' } : message)) }
            : conversation,
        ),
      );
    }, 1200);
  }

  function retryMessage(messageId) {
    setConversations((prev) =>
      prev.map((conversation) => {
        if (conversation.id !== selectedId) return conversation;
        return {
          ...conversation,
          messages: conversation.messages.map((message) =>
            message.id === messageId ? { ...message, status: 'sent', error: undefined } : message,
          ),
        };
      }),
    );
    pushToast('Retrying delivery via Twilio…');
    window.setTimeout(() => {
      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === selectedId
            ? {
                ...conversation,
                messages: conversation.messages.map((message) => (message.id === messageId ? { ...message, status: 'delivered' } : message)),
              }
            : conversation,
        ),
      );
    }, 1400);
  }

  function simulateIncoming() {
    if (!selected) return;
    incomingCount.current += 1;
    const samples = [
      'Perfect, thanks — see you Friday at 10.',
      'Can you also quote the battery add-on?',
      'Please send the invoice to our AP inbox.',
    ];
    const body = samples[incomingCount.current % samples.length];
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === selectedId
          ? { ...conversation, messages: [...conversation.messages, { id: `in-${Date.now()}`, dir: 'in', body, time: 'Just now', status: 'delivered' }] }
          : conversation,
      ),
    );
    pushToast('Simulated inbound Twilio message received');
  }

  function toggleOptOut() {
    patchSelected((conversation) => ({ ...conversation, optedOut: !conversation.optedOut }));
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">Messaging Inbox</h1>
            <p className="text-sm text-slate-500">Unified WhatsApp & SMS conversations via Twilio (I1.1–I1.9).</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Twilio connected
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
              {totalUnread} unread
            </span>
          </div>
        </header>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-[336px_1fr]">
            {/* Conversation list */}
            <aside className={`flex max-h-[calc(100vh-12rem)] min-h-[32rem] flex-col border-slate-200 lg:border-r ${mobilePane === 'thread' ? 'hidden lg:flex' : 'flex'}`}>
              <div className="space-y-2 border-b border-slate-100 p-3">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search conversations…"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
                <div className="flex gap-1">
                  {[{ id: 'all', label: 'All' }, { id: 'WhatsApp', label: 'WhatsApp' }, { id: 'SMS', label: 'SMS' }].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setChannelFilter(tab.id)}
                      className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition ${
                        channelFilter === tab.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                      <MessageSquare className="h-6 w-6" />
                    </span>
                    <p className="text-sm font-semibold text-slate-700">No conversations found</p>
                    <p className="text-sm text-slate-500">Try a different search or channel filter.</p>
                  </div>
                ) : (
                  filtered.map((conversation) => {
                    const last = lastMessage(conversation);
                    const active = conversation.id === selectedId;
                    return (
                      <button
                        key={conversation.id}
                        type="button"
                        onClick={() => openConversation(conversation.id)}
                        className={`flex w-full items-start gap-3 border-b border-slate-100 px-3 py-3 text-left transition ${
                          active ? 'bg-indigo-50/60' : 'hover:bg-slate-50'
                        }`}
                      >
                        <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-xs font-semibold text-white">
                          {conversation.name.startsWith('+') ? '#' : conversation.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate text-sm font-semibold text-slate-800">{conversation.name}</span>
                            <span className="shrink-0 text-[10px] text-slate-400">{last.time}</span>
                          </div>
                          <p className="mt-0.5 truncate text-xs text-slate-500">
                            {last.dir === 'out' ? 'You: ' : ''}{last.body}
                          </p>
                          <div className="mt-1.5 flex items-center gap-1.5">
                            <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${CHANNELS[conversation.channel].chip}`}>
                              {conversation.channel}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                              {conversation.assignee.initials} · {conversation.assignee.name.split(' ')[0]}
                            </span>
                            {conversation.unread > 0 && (
                              <span className="ml-auto inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold text-white">
                                {conversation.unread}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </aside>

            {/* Thread */}
            <section className={`flex min-h-[32rem] flex-col ${mobilePane === 'list' ? 'hidden lg:flex' : 'flex'}`}>
              {selected ? (
                <>
                  <div className="border-b border-slate-100">
                    <div className="flex items-center justify-between gap-3 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <button type="button" onClick={() => setMobilePane('list')} className="rounded-lg border border-slate-200 p-1.5 text-slate-500 transition hover:bg-slate-50 lg:hidden">
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-slate-800">{selected.name}</p>
                            <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${CHANNELS[selected.channel].chip}`}>
                              {selected.channel}
                            </span>
                          </div>
                          <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
                            <Phone className="h-3 w-3" /> {selected.phone} · Assigned to {selected.assignee.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={simulateIncoming}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                        >
                          <Zap className="h-3.5 w-3.5 text-amber-500" /> Simulate incoming
                        </button>
                        <button
                          type="button"
                          onClick={toggleOptOut}
                          aria-pressed={selected.optedOut}
                          className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
                            selected.optedOut ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <BellOff className="h-3.5 w-3.5" /> {selected.optedOut ? 'Opted-out' : 'Opt-out'}
                        </button>
                      </div>
                    </div>

                    {/* Contact matching banner */}
                    <div className={`flex items-center gap-2 border-t border-slate-100 px-4 py-2 ${MATCH_STATES[selected.match].tone.split(' ')[0]}`}>
                      {React.createElement(MATCH_STATES[selected.match].icon, { className: 'h-3.5 w-3.5' })}
                      <span className={`text-[11px] font-semibold ${MATCH_STATES[selected.match].tone.split(' ')[1]}`}>
                        {MATCH_STATES[selected.match].label}
                      </span>
                      <span className="text-[11px] text-slate-400">· inbound number {selected.phone}</span>
                    </div>
                  </div>

                  {/* Message stream */}
                  <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/50 px-4 py-4">
                    {selected.messages.map((message) => {
                      const outbound = message.dir === 'out';
                      return (
                        <div key={message.id} className={`flex flex-col ${outbound ? 'items-end' : 'items-start'}`}>
                          <div
                            className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm ${
                              outbound
                                ? message.status === 'failed'
                                  ? 'rounded-br-md bg-rose-100 text-rose-900 ring-1 ring-inset ring-rose-200'
                                  : 'rounded-br-md bg-indigo-600 text-white'
                                : 'rounded-bl-md border border-slate-200 bg-white text-slate-700'
                            }`}
                          >
                            <p className="leading-relaxed">{message.body}</p>
                            <div className={`mt-1.5 flex items-center justify-end gap-1 text-[10px] ${outbound && message.status !== 'failed' ? 'text-indigo-100' : 'text-slate-400'}`}>
                              {message.time}
                              {outbound && (
                                <>
                                  <StatusIcon status={message.status} />
                                  <span>{STATUS_LABEL[message.status]}</span>
                                </>
                              )}
                            </div>
                          </div>
                          {message.status === 'failed' && (
                            <div className="mt-1.5 max-w-[80%] rounded-lg border border-rose-200 bg-rose-50 px-3 py-2">
                              <p className="flex items-start gap-1.5 text-[11px] font-medium text-rose-700">
                                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                {message.error}
                              </p>
                              <button
                                type="button"
                                onClick={() => retryMessage(message.id)}
                                className="mt-1.5 inline-flex items-center gap-1 rounded-md border border-rose-200 bg-white px-2 py-1 text-[11px] font-semibold text-rose-700 transition hover:bg-rose-100"
                              >
                                <RotateCcw className="h-3 w-3" /> Retry
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Composer / opt-out state */}
                  <div className="border-t border-slate-100 p-3">
                    {selected.optedOut ? (
                      <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5">
                        <BellOff className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                        <p className="text-xs text-rose-700">
                          <span className="font-semibold">{selected.name} has opted out of messaging.</span> The composer is disabled. Under Twilio policy, re-enabling requires explicit inbound consent (e.g. the contact replies <span className="font-mono font-semibold">START</span>).
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-end gap-2">
                          <button type="button" aria-label="Attach" className="rounded-lg border border-slate-200 p-2 text-slate-400 transition hover:bg-slate-50">
                            <Paperclip className="h-4 w-4" />
                          </button>
                          <textarea
                            value={draft}
                            onChange={(event) => setDraft(event.target.value)}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' && !event.shiftKey) {
                                event.preventDefault();
                                sendMessage();
                              }
                            }}
                            rows={1}
                            placeholder={`Message ${selected.name} on ${selected.channel}…`}
                            className="max-h-32 flex-1 resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                          />
                          <button
                            type="button"
                            onClick={sendMessage}
                            disabled={!draft.trim()}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Send className="h-4 w-4" /> Send
                          </button>
                        </div>
                        <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-400">
                          <Info className="h-3 w-3" />
                          Enter to send · Shift+Enter for a new line · Delivery status updates live from Twilio.
                        </p>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <MessageSquare className="h-6 w-6" />
                  </span>
                  <p className="text-sm font-semibold text-slate-700">Select a conversation</p>
                  <p className="text-sm text-slate-500">Choose a thread on the left to view messages.</p>
                </div>
              )}
            </section>
          </div>
        </div>

        {/* Sandbox testing note */}
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <FlaskConical className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-800">Sandbox testing note</p>
            <p className="text-slate-500">
              This inbox runs against the <span className="font-semibold text-slate-700">Twilio WhatsApp Sandbox</span>. Recipients must join the sandbox
              (send the join code to the sandbox number) before messages deliver. Use <span className="font-semibold text-slate-700">Simulate incoming</span> above
              to test an inbound webhook without a live phone.
            </p>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="pointer-events-none fixed bottom-4 right-4 z-[90] w-[min(92vw,22rem)]">
          <div className="pointer-events-auto flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
            <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${toast.tone === 'error' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
              {toast.tone === 'error' ? <AlertCircle className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
            </span>
            <p className="flex-1 text-sm text-slate-700">{toast.message}</p>
            <button type="button" aria-label="Dismiss" onClick={() => setToast(null)} className="text-slate-300 transition hover:text-slate-500">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
