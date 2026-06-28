'use client';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, Send, X, ArrowRightLeft, MessageCircle, CheckCheck, Clock, Zap } from 'lucide-react';
import { Badge, Avatar, StatCard, Tabs, Button, Modal, Select, cn } from '@/src/components/ui';

type ChatStatus = 'active' | 'waiting' | 'completed';

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent' | 'system';
  text: string;
  time: string;
}

interface Chat {
  id: string;
  userName: string;
  userEmail: string;
  status: ChatStatus;
  subject: string;
  assignedAgent: string | null;
  startedAt: string;
  lastMessage: string;
  lastMessageTime: string;
  waitTime?: string;
  messages: ChatMessage[];
  unread: number;
}

const AGENTS = ['Priya Sharma', 'Rohan Verma', 'Sunita Patel', 'Ankit Joshi', 'Meera Nair'];

const QUICK_REPLIES = [
  'Hello! How can I help you today?',
  'Thank you for reaching out to TinyBit support.',
  'Could you please provide more details about the issue?',
  'I understand your concern. Let me look into this for you.',
  'Your issue has been escalated to our technical team.',
  'Is there anything else I can help you with?',
  'Your query has been resolved. Please close the chat if satisfied.',
];

const MOCK_CHATS: Chat[] = [
  {
    id: 'CHT-001', userName: 'Ramesh Gupta', userEmail: 'ramesh.gupta@email.com', status: 'active',
    subject: 'Medicine reminder issue', assignedAgent: 'Priya Sharma',
    startedAt: '2026-06-15T09:10:00Z', lastMessage: 'Yes, the notifications are still not working after reinstalling.', lastMessageTime: '2026-06-15T09:28:00Z', waitTime: undefined, unread: 2,
    messages: [
      { id: 'm1', sender: 'user', text: 'Hello, my medicine reminders are not working.', time: '09:10 AM' },
      { id: 'm2', sender: 'agent', text: 'Hello Ramesh! I am Priya from TinyBit support. Have you tried reinstalling the app?', time: '09:12 AM' },
      { id: 'm3', sender: 'user', text: 'Yes, I tried that just now.', time: '09:14 AM' },
      { id: 'm4', sender: 'agent', text: 'Please go to Settings > Notifications and ensure TinyBit has permission to send notifications.', time: '09:20 AM' },
      { id: 'm5', sender: 'user', text: 'Yes, the notifications are still not working after reinstalling.', time: '09:28 AM' },
    ],
  },
  {
    id: 'CHT-002', userName: 'Kavita Nair', userEmail: 'kavita.nair@email.com', status: 'waiting',
    subject: 'Subscription renewal problem', assignedAgent: null,
    startedAt: '2026-06-15T09:30:00Z', lastMessage: 'I was charged but my plan still shows expired.', lastMessageTime: '2026-06-15T09:31:00Z', waitTime: '8m', unread: 1,
    messages: [
      { id: 'm1', sender: 'user', text: 'Hi, I have a problem with my subscription renewal.', time: '09:30 AM' },
      { id: 'm2', sender: 'system', text: 'You are connected to TinyBit support. An agent will be with you shortly.', time: '09:30 AM' },
      { id: 'm3', sender: 'user', text: 'I was charged but my plan still shows expired.', time: '09:31 AM' },
    ],
  },
  {
    id: 'CHT-003', userName: 'Vijay Reddy', userEmail: 'vijay.reddy@email.com', status: 'active',
    subject: 'SOS alert not sending to contacts', assignedAgent: 'Rohan Verma',
    startedAt: '2026-06-15T08:45:00Z', lastMessage: 'My son confirmed he never received any alert.', lastMessageTime: '2026-06-15T09:15:00Z', waitTime: undefined, unread: 0,
    messages: [
      { id: 'm1', sender: 'user', text: 'The SOS button is not alerting my emergency contacts.', time: '08:45 AM' },
      { id: 'm2', sender: 'agent', text: "Hi Vijay! Can you confirm the contact's phone number is correctly saved?", time: '08:48 AM' },
      { id: 'm3', sender: 'user', text: 'Yes I checked it twice, number is correct.', time: '09:00 AM' },
      { id: 'm4', sender: 'agent', text: 'Let me check the delivery logs on our end. Please hold on.', time: '09:05 AM' },
      { id: 'm5', sender: 'user', text: 'My son confirmed he never received any alert.', time: '09:15 AM' },
    ],
  },
  {
    id: 'CHT-004', userName: 'Sunita Desai', userEmail: 'sunita.desai@email.com', status: 'active',
    subject: 'Health vault upload failing', assignedAgent: 'Ankit Joshi',
    startedAt: '2026-06-15T08:00:00Z', lastMessage: 'Thank you, the upload worked now!', lastMessageTime: '2026-06-15T08:55:00Z', waitTime: undefined, unread: 0,
    messages: [
      { id: 'm1', sender: 'user', text: 'PDF upload keeps failing in the health vault.', time: '08:00 AM' },
      { id: 'm2', sender: 'agent', text: 'Hi Sunita! What is the file size of the PDF you are trying to upload?', time: '08:03 AM' },
      { id: 'm3', sender: 'user', text: 'It is about 25MB, a scan of multiple pages.', time: '08:10 AM' },
      { id: 'm4', sender: 'agent', text: 'I have raised the limit to 50MB for your account. Please try again.', time: '08:50 AM' },
      { id: 'm5', sender: 'user', text: 'Thank you, the upload worked now!', time: '08:55 AM' },
    ],
  },
  {
    id: 'CHT-005', userName: 'Mohan Iyer', userEmail: 'mohan.iyer@email.com', status: 'completed',
    subject: 'Voice journal transcription issue', assignedAgent: 'Meera Nair',
    startedAt: '2026-06-14T16:00:00Z', lastMessage: 'Issue resolved, thank you Meera!', lastMessageTime: '2026-06-14T17:30:00Z', waitTime: undefined, unread: 0,
    messages: [
      { id: 'm1', sender: 'user', text: 'Voice recording is not being transcribed to text correctly.', time: '04:00 PM' },
      { id: 'm2', sender: 'agent', text: 'Hi Mohan! Which language are you recording in?', time: '04:05 PM' },
      { id: 'm3', sender: 'user', text: 'Gujarati.', time: '04:10 PM' },
      { id: 'm4', sender: 'agent', text: 'There was a known issue with Gujarati transcription fixed in v2.4.1. Please update the app.', time: '04:20 PM' },
      { id: 'm5', sender: 'user', text: 'Issue resolved, thank you Meera!', time: '05:30 PM' },
      { id: 'm6', sender: 'system', text: 'Chat session closed.', time: '05:31 PM' },
    ],
  },
  {
    id: 'CHT-006', userName: 'Anjali Singh', userEmail: 'anjali.singh@email.com', status: 'completed',
    subject: 'Location tracking not updating', assignedAgent: 'Rohan Verma',
    startedAt: '2026-06-14T11:00:00Z', lastMessage: 'Great, location is updating now. Thank you!', lastMessageTime: '2026-06-14T12:30:00Z', waitTime: undefined, unread: 0,
    messages: [
      { id: 'm1', sender: 'user', text: 'Location is stuck and not updating in real time.', time: '11:00 AM' },
      { id: 'm2', sender: 'agent', text: 'Hi Anjali! Please check if background app refresh is enabled for TinyBit.', time: '11:05 AM' },
      { id: 'm3', sender: 'user', text: 'I found it and enabled it. Let me check.', time: '11:20 AM' },
      { id: 'm4', sender: 'user', text: 'Great, location is updating now. Thank you!', time: '12:30 PM' },
      { id: 'm5', sender: 'system', text: 'Chat session closed.', time: '12:31 PM' },
    ],
  },
];

const STATUS_DOT: Record<ChatStatus, string> = {
  active: 'bg-emerald-500',
  waiting: 'bg-amber-500',
  completed: 'bg-slate-400',
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function ChatListItem({ chat, active, onClick }: { chat: Chat; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={cn('w-full text-left px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60', active && 'bg-brand-50 dark:bg-brand-900/20 border-r-2 border-r-brand-600')}>
      <div className="flex items-start gap-3">
        <div className="relative flex-shrink-0">
          <Avatar name={chat.userName} size="sm" />
          <span className={cn('absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900', STATUS_DOT[chat.status])} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-medium text-sm text-slate-900 dark:text-white truncate">{chat.userName}</p>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {chat.unread > 0 && <span className="w-4 h-4 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center">{chat.unread}</span>}
              <span className="text-[10px] text-slate-400">{formatTime(chat.lastMessageTime)}</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{chat.subject}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">{chat.lastMessage}</p>
          {chat.waitTime && (
            <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 mt-1">
              <Clock className="w-2.5 h-2.5" /> Waiting {chat.waitTime}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function ChatPanel({ chat, onClose, onTransfer, onAssign }: {
  chat: Chat;
  onClose: () => void;
  onTransfer: (chatId: string, agent: string) => void;
  onAssign: (chatId: string, agent: string) => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(chat.messages);
  const [input, setInput] = useState('');
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferAgent, setTransferAgent] = useState('');
  const [assignAgent, setAssignAgent] = useState(chat.assignedAgent ?? '');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    setMessages(chat.messages);
    setAssignAgent(chat.assignedAgent ?? '');
    setInput('');
    setShowQuickReplies(false);
  }, [chat.id]);

  function sendMessage(text: string) {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { id: `m${Date.now()}`, sender: 'agent', text, time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) }]);
    setInput('');
    setShowQuickReplies(false);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex-shrink-0">
        <div className="relative">
          <Avatar name={chat.userName} size="md" />
          <span className={cn('absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900', STATUS_DOT[chat.status])} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900 dark:text-white text-sm">{chat.userName}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{chat.subject}</p>
        </div>
        {chat.status !== 'completed' && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <select value={assignAgent} onChange={e => { setAssignAgent(e.target.value); onAssign(chat.id, e.target.value); }} className="input-field !py-1 !text-xs w-32">
              <option value="">Assign to…</option>
              {AGENTS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <Button variant="ghost" size="xs" icon={<ArrowRightLeft className="w-3 h-3" />} onClick={() => setShowTransfer(true)}>Transfer</Button>
            <Button variant="danger" size="xs" icon={<X className="w-3 h-3" />} onClick={onClose}>Close</Button>
          </div>
        )}
        {chat.status === 'completed' && <Badge variant="default">Completed</Badge>}
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-slate-50 dark:bg-slate-950">
        {messages.map(msg => (
          <div key={msg.id} className={cn('flex', msg.sender === 'agent' ? 'justify-end' : msg.sender === 'system' ? 'justify-center' : 'justify-start')}>
            {msg.sender === 'system' ? (
              <span className="text-[11px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">{msg.text}</span>
            ) : (
              <div className={cn('max-w-[70%] flex items-end gap-2', msg.sender === 'agent' && 'flex-row-reverse')}>
                {msg.sender === 'user' && <Avatar name={chat.userName} size="xs" />}
                <div>
                  <div className={cn('px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm', msg.sender === 'agent' ? 'bg-brand-600 text-white rounded-br-sm' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-sm')}>
                    {msg.text}
                  </div>
                  <p className={cn('text-[10px] text-slate-400 mt-1', msg.sender === 'agent' && 'text-right')}>{msg.time}</p>
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {showQuickReplies && (
        <div className="px-4 py-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Quick Replies</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_REPLIES.map((r, i) => (
              <button key={i} onClick={() => sendMessage(r)} className="text-xs px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-brand-100 dark:hover:bg-brand-900/30 text-slate-700 dark:text-slate-300 hover:text-brand-700 dark:hover:text-brand-400 rounded-full transition-colors">
                {r.length > 42 ? r.slice(0, 42) + '…' : r}
              </button>
            ))}
          </div>
        </div>
      )}

      {chat.status !== 'completed' && (
        <div className="px-4 py-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <button onClick={() => setShowQuickReplies(v => !v)} className={cn('p-2 rounded-lg transition-colors flex-shrink-0', showQuickReplies ? 'bg-brand-100 text-brand-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800')} title="Quick Replies">
              <Zap className="w-4 h-4" />
            </button>
            <input type="text" className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500 dark:focus:border-brand-500 text-slate-800 dark:text-slate-200 placeholder-slate-400" placeholder="Type a message..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage(input)} />
            <button onClick={() => sendMessage(input)} disabled={!input.trim()} className="p-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white rounded-lg transition-colors flex-shrink-0">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <Modal open={showTransfer} onClose={() => setShowTransfer(false)} title="Transfer Chat"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowTransfer(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => { if (transferAgent) { onTransfer(chat.id, transferAgent); setShowTransfer(false); } }}>Transfer</Button>
          </>
        }
      >
        <Select label="Transfer to Agent" value={transferAgent} onChange={e => setTransferAgent(e.target.value)}
          options={[{ value: '', label: 'Select agent…' }, ...AGENTS.filter(a => a !== chat.assignedAgent).map(a => ({ value: a, label: a }))]}
        />
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">The chat will be transferred and the new agent will be notified.</p>
      </Modal>
    </div>
  );
}

export default function ChatSupportPage() {
  const [chats, setChats] = useState<Chat[]>(MOCK_CHATS);
  const [activeTab, setActiveTab] = useState('active');
  const [selectedChatId, setSelectedChatId] = useState<string>(MOCK_CHATS[0].id);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => chats.filter(c => {
    const matchTab = activeTab === 'active' ? c.status !== 'completed' : c.status === 'completed';
    const s = search.toLowerCase();
    const matchSearch = !s || c.userName.toLowerCase().includes(s) || c.id.toLowerCase().includes(s) || c.subject.toLowerCase().includes(s);
    return matchTab && matchSearch;
  }), [chats, activeTab, search]);

  const selectedChat = filtered.find(c => c.id === selectedChatId) ?? filtered[0];

  const stats = useMemo(() => ({
    active: chats.filter(c => c.status === 'active').length,
    waiting: chats.filter(c => c.status === 'waiting').length,
    completed: chats.filter(c => c.status === 'completed').length,
  }), [chats]);

  function handleCloseChat(chatId: string) {
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, status: 'completed' as ChatStatus } : c));
  }

  function handleTransfer(chatId: string, agent: string) {
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, assignedAgent: agent, status: 'active' as ChatStatus } : c));
  }

  function handleAssign(chatId: string, agent: string) {
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, assignedAgent: agent || null } : c));
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Chat Support</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage live chat sessions with users</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Chats" value={stats.active} icon={<MessageCircle className="w-5 h-5" />} gradient="bg-gradient-to-br from-brand-500 to-brand-700" />
        <StatCard title="Waiting in Queue" value={stats.waiting} icon={<Clock className="w-5 h-5" />} gradient="bg-gradient-to-br from-amber-500 to-amber-700" />
        <StatCard title="Resolved Today" value={stats.completed} icon={<CheckCheck className="w-5 h-5" />} gradient="bg-gradient-to-br from-emerald-500 to-emerald-700" change={15} />
        <StatCard title="Avg. Response" value="3.2" suffix="min" icon={<Zap className="w-5 h-5" />} gradient="bg-gradient-to-br from-violet-500 to-violet-700" change={-8} />
      </div>

      <div className="card overflow-hidden flex" style={{ height: '600px' }}>
        <div className="w-72 flex-shrink-0 border-r border-slate-100 dark:border-slate-800 flex flex-col">
          <div className="p-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
              <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <input type="text" placeholder="Search chats..." className="bg-transparent text-sm outline-none w-full text-slate-700 dark:text-slate-200 placeholder-slate-400" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="px-3 pt-2">
            <Tabs
              tabs={[
                { id: 'active', label: 'Active', count: stats.active + stats.waiting },
                { id: 'completed', label: 'History', count: stats.completed },
              ]}
              active={activeTab}
              onChange={tab => { setActiveTab(tab); setSelectedChatId(''); }}
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 && <div className="py-12 text-center text-sm text-slate-400">No chats found.</div>}
            {filtered.map(chat => (
              <ChatListItem key={chat.id} chat={chat} active={chat.id === selectedChat?.id} onClick={() => setSelectedChatId(chat.id)} />
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          {selectedChat ? (
            <ChatPanel key={selectedChat.id} chat={selectedChat} onClose={() => handleCloseChat(selectedChat.id)} onTransfer={handleTransfer} onAssign={handleAssign} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Select a chat to view</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
