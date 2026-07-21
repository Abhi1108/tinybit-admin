'use client';
import React from 'react';
import { Bot, AlertCircle } from 'lucide-react';

/** Read-only view of the Gemini stack actually running on tinybit-server. */
const RUNTIME = {
  provider: 'Google Gemini',
  chatModel: 'gemini-3.1-flash-lite',
  visionModel: 'gemini-3.1-flash-lite',
  voiceModel: 'gemini-3.1-flash-lite',
  notes: 'Configured in tinybit-server/src/services/gemini.service.js — not editable from admin yet.',
};

export default function AISettingsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="page-title flex items-center gap-2">
          <Bot className="w-6 h-6 text-indigo-500" /> AI Settings
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Runtime AI configuration for the Sathi companion
        </p>
      </div>

      <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-sm text-amber-800 dark:text-amber-300">
        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <span>
          AI settings are not persisted via an admin API yet. Values below reflect the live Gemini deployment (no GPT / OpenAI models).
        </span>
      </div>

      <div className="card p-5">
        <h2 className="section-title mb-4">AI Model Configuration</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Provider</label>
            <input className="input-field" value={RUNTIME.provider} readOnly />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Chat Model</label>
            <input className="input-field font-mono text-sm" value={RUNTIME.chatModel} readOnly />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Vision / Health Insights Model</label>
            <input className="input-field font-mono text-sm" value={RUNTIME.visionModel} readOnly />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Voice Transcription Model</label>
            <input className="input-field font-mono text-sm" value={RUNTIME.voiceModel} readOnly />
            <p className="text-xs text-slate-400 mt-1">Same Gemini model handles audio transcription (no Whisper).</p>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="section-title mb-4">Usage Limits & Budget</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Monthly USD budget and per-user token limits are not configured in the database. Token usage is available under AI Usage / Token Analytics.
        </p>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Monthly Budget (USD)</label>
            <input className="input-field" value="—" readOnly />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Daily Token Limit (per user)</label>
            <input className="input-field" value="—" readOnly />
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="section-title mb-2">Notes</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">{RUNTIME.notes}</p>
      </div>
    </div>
  );
}
