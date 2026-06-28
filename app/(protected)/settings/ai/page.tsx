'use client';
import React, { useState } from 'react';
import { Bot, Save } from 'lucide-react';
import { cn } from '@/src/components/ui';

export default function AISettingsPage() {
  const [saved, setSaved] = useState(false);
  const [model, setModel] = useState('gpt-4o-mini');
  const [monthlyBudget, setMonthlyBudget] = useState('5000');
  const [tokenLimit, setTokenLimit] = useState('200000');
  const [features, setFeatures] = useState({ chatEnabled: true, voiceEnabled: true, ttsEnabled: true, safeMode: true });

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="page-title flex items-center gap-2"><Bot className="w-6 h-6 text-indigo-500" /> AI Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Configure AI models, budgets, and feature flags for the Sathi AI companion</p>
      </div>

      {/* Model Selection */}
      <div className="card p-5">
        <h2 className="section-title mb-4">AI Model Configuration</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Chat Model</label>
            <select className="input-field" value={model} onChange={e => setModel(e.target.value)}>
              <option value="gpt-4o-mini">gpt-4o-mini (Recommended — Cost efficient)</option>
              <option value="gpt-4o">gpt-4o (Higher quality, higher cost)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Voice Transcription Model</label>
            <select className="input-field" defaultValue="whisper-1">
              <option value="whisper-1">whisper-1</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">TTS Voice</label>
            <select className="input-field" defaultValue="nova">
              <option value="nova">nova (Default — warm, natural)</option>
              <option value="alloy">alloy</option>
              <option value="echo">echo</option>
              <option value="shimmer">shimmer</option>
            </select>
          </div>
        </div>
      </div>

      {/* Budget / Limits */}
      <div className="card p-5">
        <h2 className="section-title mb-4">Usage Limits & Budget</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Monthly Budget (USD)</label>
            <input type="number" className="input-field" value={monthlyBudget} onChange={e => setMonthlyBudget(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Daily Token Limit (per user)</label>
            <input type="number" className="input-field" value={tokenLimit} onChange={e => setTokenLimit(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Feature Flags */}
      <div className="card p-5">
        <h2 className="section-title mb-4">AI Feature Flags</h2>
        <div className="space-y-0">
          {[
            { key: 'chatEnabled', label: 'Chat Companion', desc: 'Allow users to chat with Sathi AI' },
            { key: 'voiceEnabled', label: 'Voice Input', desc: 'Allow voice messages via Whisper transcription' },
            { key: 'ttsEnabled', label: 'Text-to-Speech', desc: 'Read AI responses aloud using TTS' },
            { key: 'safeMode', label: 'Safe Mode Filter', desc: 'Block inappropriate or harmful responses' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{item.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
              </div>
              <button
                onClick={() => setFeatures(f => ({ ...f, [item.key]: !f[item.key as keyof typeof f] }))}
                className={cn('relative w-11 h-6 rounded-full transition-colors duration-200', features[item.key as keyof typeof features] ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-700')}
              >
                <span className={cn('absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200', features[item.key as keyof typeof features] && 'translate-x-5')} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} className="btn-primary px-6">
          <Save className="w-4 h-4" />
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
