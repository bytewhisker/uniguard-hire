import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useRecruitment } from '../../context/RecruitmentContext';
import {
  MessageCircle, X, Send, Check, CheckCheck, ShieldCheck, LogIn, UserPlus, Briefcase
} from 'lucide-react';

export const LiveChatWidget: React.FC = () => {
  const {
    publicUser,
    applicants,
    messages,
    sendMessage,
    markConversationRead,
    messagesByApplication,
    reloadMessages,
    setActivePage,
  } = useRecruitment();

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const myApps = useMemo(
    () => (publicUser
      ? applicants
          .filter(a => a.email.toLowerCase() === publicUser.email.toLowerCase())
          .sort((a, b) => b.appliedDate.localeCompare(a.appliedDate))
      : []),
    [applicants, publicUser]
  );

  const activeApp = myApps.find(a => a.id === selectedAppId) || myApps[0] || null;
  const msgs = activeApp ? messagesByApplication(activeApp.id) : [];

  const unreadCount = useMemo(() => {
    const ids = new Set(myApps.map(a => a.id));
    return messages.filter(m => ids.has(m.applicationId) && m.sender === 'admin' && !m.readByUser).length;
  }, [messages, myApps]);

  // Fresh fetch every time the widget opens (heals anything realtime missed)
  useEffect(() => {
    if (open) reloadMessages();
  }, [open]);

  useEffect(() => {
    if (open && activeApp) markConversationRead(activeApp.id, false);
  }, [open, activeApp?.id, msgs]);

  useEffect(() => {
    if (open && msgs.length > 0) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs.length, open]);

  const handleSend = () => {
    if (!activeApp || !draft.trim()) return;
    sendMessage(activeApp.id, draft, 'user');
    setDraft('');
  };

  const timeLabel = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  const dayLabel = (iso: string) => {
    const d = new Date(iso);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Today';
    const yest = new Date(today); yest.setDate(today.getDate() - 1);
    if (d.toDateString() === yest.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  const dayGroups: { label: string; items: typeof msgs }[] = [];
  let lastDate = '';
  for (const m of msgs) {
    const day = new Date(m.createdAt).toDateString();
    if (day !== lastDate) {
      lastDate = day;
      dayGroups.push({ label: dayLabel(m.createdAt), items: [] });
    }
    dayGroups[dayGroups.length - 1].items.push(m);
  }

  const quickReplies = [
    'Hi! I have a question about my application.',
    'Can I get an update on my application status?',
    'I have a question about my interview.',
  ];

  return (
    <>
      {/* Floating bubble (bottom-left) */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-5 right-5 z-[60] group"
        aria-label="Chat with us"
      >
        {unreadCount > 0 && !open && (
          <span className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow z-10">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        {!open && unreadCount > 0 && (
          <span className="absolute inset-0 rounded-full bg-[#AF7C28]/50 animate-ping" />
        )}
        <span
          className={`relative flex items-center justify-center w-14 h-14 rounded-full shadow-2xl shadow-amber-500/30 text-white transition-all duration-200 ${
            open
              ? 'bg-zinc-800 hover:bg-zinc-700 rotate-90'
              : 'bg-gradient-to-br from-[#AF7C28] to-[#c99a3e] group-hover:scale-105 active:scale-95'
          }`}
        >
          {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        </span>
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-5 z-[60] w-[360px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-8.5rem)] bg-white border border-line rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-[#7a5a22] to-[#AF7C28] flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/15 border border-white/25 flex items-center justify-center text-white shrink-0">
              <ShieldCheck className="w-4.5 h-4.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-bold text-[13px] flex items-center gap-2">
                Uniguard Team
                <span className="flex items-center gap-1 text-[9px] font-semibold bg-emerald-400/90 text-emerald-950 px-1.5 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 animate-pulse" />
                  Online
                </span>
              </div>
              <div className="text-white/75 text-[10px] truncate">
                Live support — replies within 1 working day
              </div>
            </div>
            {myApps.length > 1 && activeApp && (
              <select
                value={activeApp.id}
                onChange={e => setSelectedAppId(e.target.value)}
                className="bg-white/90 rounded-lg px-1.5 py-1 text-[10px] font-semibold text-[#7a5a22] outline-none max-w-28"
                title="Switch application"
              >
                {myApps.map(a => (
                  <option key={a.id} value={a.id}>{a.appliedJobTitle || 'Application'}</option>
                ))}
              </select>
            )}
          </div>

          {/* Body */}
          {!publicUser ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center bg-[#faf7f1]">
              <div className="w-14 h-14 rounded-full bg-[#AF7C28]/10 border border-[#AF7C28]/25 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-[#AF7C28]" />
              </div>
              <div>
                <p className="text-sm font-bold text-primary">Sign in to chat with our team</p>
                <p className="text-xs text-secondary mt-1 leading-relaxed">
                  Create a free account or sign in to message us about vacancies, interviews and vetting.
                </p>
              </div>
              <div className="flex flex-col gap-2 w-full">
                <button
                  onClick={() => { setOpen(false); setActivePage('login'); }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-br from-[#AF7C28] to-[#c99a3e] text-white text-xs font-bold transition-all hover:shadow-lg"
                >
                  <LogIn className="w-3.5 h-3.5" /> Sign In
                </button>
                <button
                  onClick={() => { setOpen(false); setActivePage('signup'); }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-line text-primary text-xs font-bold transition-colors hover:border-[#AF7C28]/40"
                >
                  <UserPlus className="w-3.5 h-3.5 text-[#AF7C28]" /> Create Free Account
                </button>
              </div>
            </div>
          ) : myApps.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center bg-[#faf7f1]">
              <div className="w-14 h-14 rounded-full bg-[#AF7C28]/10 border border-[#AF7C28]/25 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-[#AF7C28]" />
              </div>
              <div>
                <p className="text-sm font-bold text-primary">Submit an application first</p>
                <p className="text-xs text-secondary mt-1 leading-relaxed">
                  Once you apply for a vacancy, you can chat with our recruitment team right here.
                </p>
              </div>
              <button
                onClick={() => { setOpen(false); setActivePage('user-dashboard'); }}
                className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-br from-[#AF7C28] to-[#c99a3e] text-white text-xs font-bold transition-all hover:shadow-lg"
              >
                Browse Vacancies & Apply
              </button>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#faf7f1]">
                {msgs.length === 0 && (
                  <div className="text-center pt-6 pb-2 space-y-3">
                    <div className="w-12 h-12 mx-auto rounded-full bg-[#AF7C28]/10 border border-[#AF7C28]/20 flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-[#AF7C28]" />
                    </div>
                    <p className="text-xs font-semibold text-primary">How can we help?</p>
                    <p className="text-[11px] text-secondary">Pick a suggestion or type your own message.</p>
                    <div className="flex flex-col gap-1.5 pt-1">
                      {quickReplies.map(q => (
                        <button
                          key={q}
                          onClick={() => setDraft(q)}
                          className="text-left px-3 py-2 rounded-xl bg-white border border-[#AF7C28]/25 text-[11px] font-medium text-[#8f6420] hover:bg-[#AF7C28]/10 transition-colors"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {dayGroups.map(group => (
                  <div key={group.label} className="space-y-2.5">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-line" />
                      <span className="text-[9px] font-semibold text-tertiary uppercase tracking-wider">{group.label}</span>
                      <div className="flex-1 h-px bg-line" />
                    </div>
                    {group.items.map(m => {
                      const mine = m.sender === 'user';
                      return (
                        <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[82%] ${mine ? 'text-right' : 'text-left'}`}>
                            <div className={`inline-block px-3.5 py-2 text-xs leading-relaxed whitespace-pre-wrap break-words shadow-sm ${
                              mine
                                ? 'bg-gradient-to-br from-[#AF7C28] to-[#c99a3e] text-white rounded-2xl rounded-br-md'
                                : 'bg-white text-primary border border-line rounded-2xl rounded-bl-md'
                            }`}>
                              {m.body}
                              {m.editedAt && <span className={`ml-1 text-[9px] ${mine ? 'text-white/70' : 'text-tertiary'}`}>(edited)</span>}
                            </div>
                            <div className={`flex items-center gap-1 mt-0.5 px-1 text-[9px] text-tertiary ${mine ? 'justify-end' : 'justify-start'}`}>
                              <span>{timeLabel(m.createdAt)}</span>
                              {mine && (m.readByAdmin ? <CheckCheck className="w-3 h-3 text-emerald-500" /> : <Check className="w-3 h-3" />)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Composer */}
              <div className="p-3 border-t border-line bg-white flex items-end gap-2">
                <textarea
                  rows={1}
                  placeholder="Type a message... (Enter to send)"
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  className="flex-1 rounded-xl border border-line bg-[#faf7f1] px-3.5 py-2.5 text-xs text-primary outline-none focus:border-[#AF7C28]/60 focus:ring-2 focus:ring-[#AF7C28]/15 transition-all resize-none max-h-24 placeholder:text-tertiary"
                />
                <button
                  onClick={handleSend}
                  disabled={!draft.trim()}
                  className="px-3.5 py-2.5 rounded-xl bg-gradient-to-br from-[#AF7C28] to-[#c99a3e] text-white flex items-center justify-center transition-all hover:shadow-lg active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};