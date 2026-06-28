'use client';
import React from 'react';
import { Cpu, CheckCircle, Settings, Activity } from 'lucide-react';
import { Badge, cn } from '@/src/components/ui';

interface AIModel {
  id: string;
  name: string;
  provider: string;
  useCase: string;
  status: 'active' | 'inactive';
  requestsToday: number;
  avgLatency: string;
  costPer1k: string;
}

const models: AIModel[] = [
  { id: 'm001', name: 'gpt-4o-mini', provider: 'OpenAI', useCase: 'Sathi AI Chat Companion', status: 'active', requestsToday: 3240, avgLatency: '1.2s', costPer1k: '$0.15' },
  { id: 'm002', name: 'whisper-1', provider: 'OpenAI', useCase: 'Voice Transcription', status: 'active', requestsToday: 820, avgLatency: '2.1s', costPer1k: '$0.006/min' },
  { id: 'm003', name: 'tts-1 (nova)', provider: 'OpenAI', useCase: 'Text-to-Speech (Sathi Voice)', status: 'active', requestsToday: 680, avgLatency: '0.8s', costPer1k: '$0.015' },
  { id: 'm004', name: 'gpt-4o', provider: 'OpenAI', useCase: 'Advanced Analysis (Reserved)', status: 'inactive', requestsToday: 0, avgLatency: '—', costPer1k: '$2.50' },
];

export default function AIModelsPage() {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2"><Cpu className="w-6 h-6 text-indigo-500" /> AI Models</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Active AI models powering the TinyBit platform</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {models.map(model => (
          <div key={model.id} className={cn('card p-5', model.status === 'inactive' && 'opacity-60')}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-sm font-mono">{model.name}</p>
                  <p className="text-xs text-slate-400">{model.provider}</p>
                </div>
              </div>
              <Badge variant={model.status === 'active' ? 'success' : 'default'} size="sm">{model.status}</Badge>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-brand-400" />
              {model.useCase}
            </p>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Requests Today', value: model.requestsToday.toLocaleString() },
                { label: 'Avg. Latency', value: model.avgLatency },
                { label: 'Cost / 1K', value: model.costPer1k },
              ].map(stat => (
                <div key={stat.label} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-2.5 text-center">
                  <p className="text-sm font-bold text-slate-800 dark:text-white">{stat.value}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-3 flex justify-end">
              <button className="btn-secondary text-xs py-1.5 px-3">
                <Settings className="w-3.5 h-3.5" /> Configure
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
