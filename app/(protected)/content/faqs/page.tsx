'use client';
import React, { useState } from 'react';
import { HelpCircle, Plus, Edit2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge, cn } from '@/src/components/ui';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  status: 'published' | 'draft';
  order: number;
}

const faqs: FAQ[] = [
  { id: 'f001', question: 'How do I add a guardian to my profile?', answer: 'Go to your profile page and tap "Add Guardian". Enter their mobile number and they will receive an invitation to connect.', category: 'Account', status: 'published', order: 1 },
  { id: 'f002', question: 'How does the SOS button work?', answer: 'Press and hold the red SOS button for 3 seconds. All registered guardians and emergency contacts will be notified immediately with your location.', category: 'SOS', status: 'published', order: 1 },
  { id: 'f003', question: 'What is Sathi AI?', answer: 'Sathi is your personal AI health companion. You can talk to Sathi using voice or text to get health tips, reminders, and emotional support.', category: 'AI', status: 'published', order: 1 },
  { id: 'f004', question: 'How do I set up medicine reminders?', answer: 'Navigate to the Medicine tab, tap "Add Medicine", enter the name, dosage, and schedule. You will receive reminders based on the times you set.', category: 'Medicine', status: 'published', order: 1 },
  { id: 'f005', question: 'Can I use TinyBit in my regional language?', answer: 'Yes! TinyBit supports English, Hindi, Gujarati, Tamil, Bengali, and Marathi. Change the language from Settings > Language.', category: 'General', status: 'published', order: 1 },
  { id: 'f006', question: 'How do I cancel my subscription?', answer: 'Draft answer pending review.', category: 'Billing', status: 'draft', order: 1 },
];

const categories = ['All', 'Account', 'SOS', 'AI', 'Medicine', 'General', 'Billing'];

export default function FAQManagementPage() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [category, setCategory] = useState('All');
  const [compose, setCompose] = useState(false);

  const filtered = faqs.filter(f => category === 'All' || f.category === category);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2"><HelpCircle className="w-6 h-6 text-brand-500" /> FAQ Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage frequently asked questions for the app</p>
        </div>
        <button className="btn-primary" onClick={() => setCompose(true)}>
          <Plus className="w-4 h-4" /> Add FAQ
        </button>
      </div>

      {/* Compose form */}
      {compose && (
        <div className="card p-6 border-2 border-brand-200 dark:border-brand-800">
          <h2 className="section-title mb-4">New FAQ</h2>
          <div className="space-y-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Category</label>
              <select className="input-field">
                {categories.slice(1).map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Question</label>
              <input type="text" className="input-field" placeholder="Enter the question..." />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Answer</label>
              <textarea className="input-field h-24 resize-none" placeholder="Write the answer..." />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button className="btn-secondary" onClick={() => setCompose(false)}>Cancel</button>
            <button className="btn-secondary">Save as Draft</button>
            <button className="btn-primary">Publish</button>
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium transition-colors border',
              category === c
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-brand-400'
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {/* FAQ List */}
      <div className="space-y-2">
        {filtered.map(faq => (
          <div key={faq.id} className="card overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              onClick={() => setExpanded(faq.id === expanded ? null : faq.id)}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 flex-shrink-0">{faq.category}</span>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{faq.question}</p>
                <Badge variant={faq.status === 'published' ? 'success' : 'default'} size="sm">{faq.status}</Badge>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded" onClick={e => e.stopPropagation()}>
                  <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                </button>
                <button className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded" onClick={e => e.stopPropagation()}>
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </button>
                {expanded === faq.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </button>
            {expanded === faq.id && (
              <div className="px-5 pb-4 pt-1 border-t border-slate-100 dark:border-slate-800">
                <p className="text-sm text-slate-600 dark:text-slate-400">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
