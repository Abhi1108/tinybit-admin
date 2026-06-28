'use client';
import React, { useState } from 'react';
import { Settings, Bell, Shield, Globe, Palette, Database, Save, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/src/contexts/ThemeContext';
import { cn } from '@/src/components/ui';

export default function GeneralSettingsPage() {
  const { isDark, toggleTheme } = useTheme();
  const [appName, setAppName] = useState('TinyBit Admin');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [language, setLanguage] = useState('en');
  const [notifications, setNotifications] = useState({ sos: true, medicine: true, checkin: false, ai: false });
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="page-title flex items-center gap-2"><Settings className="w-6 h-6 text-brand-500" /> General Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage your admin panel preferences</p>
      </div>

      {/* Appearance */}
      <div className="card p-5">
        <h2 className="section-title mb-4 flex items-center gap-2"><Palette className="w-4 h-4 text-violet-500" /> Appearance</h2>
        <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Theme Mode</p>
            <p className="text-xs text-slate-500 mt-0.5">Switch between light and dark theme</p>
          </div>
          <button
            onClick={toggleTheme}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors',
              isDark
                ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            )}
          >
            {isDark ? <><Sun className="w-4 h-4" /> Light Mode</> : <><Moon className="w-4 h-4" /> Dark Mode</>}
          </button>
        </div>
      </div>

      {/* General */}
      <div className="card p-5">
        <h2 className="section-title mb-4 flex items-center gap-2"><Globe className="w-4 h-4 text-brand-500" /> General</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Application Name</label>
            <input type="text" className="input-field" value={appName} onChange={e => setAppName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Timezone</label>
              <select className="input-field" value={timezone} onChange={e => setTimezone(e.target.value)}>
                <option value="Asia/Kolkata">India (IST)</option>
                <option value="America/New_York">Eastern (EST)</option>
                <option value="Europe/London">London (GMT)</option>
                <option value="Asia/Dubai">Dubai (GST)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Language</label>
              <select className="input-field" value={language} onChange={e => setLanguage(e.target.value)}>
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="gu">Gujarati</option>
                <option value="ta">Tamil</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="card p-5">
        <h2 className="section-title mb-4 flex items-center gap-2"><Bell className="w-4 h-4 text-amber-500" /> Admin Notifications</h2>
        <div className="space-y-3">
          {[
            { key: 'sos', label: 'SOS Alerts', desc: 'Get notified for every new SOS event' },
            { key: 'medicine', label: 'Missed Medications', desc: 'Daily summary of missed medications' },
            { key: 'checkin', label: 'Check-in Summaries', desc: 'Daily health check-in completion summary' },
            { key: 'ai', label: 'AI Usage Alerts', desc: 'Notify when token usage exceeds threshold' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{item.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
              </div>
              <button
                onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                className={cn(
                  'relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none',
                  notifications[item.key as keyof typeof notifications] ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-700'
                )}
              >
                <span className={cn(
                  'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200',
                  notifications[item.key as keyof typeof notifications] && 'translate-x-5'
                )} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Security */}
      <div className="card p-5">
        <h2 className="section-title mb-4 flex items-center gap-2"><Shield className="w-4 h-4 text-emerald-500" /> Security</h2>
        <div className="space-y-3">
          {[
            { label: 'Two-Factor Authentication', desc: 'Require 2FA for all admin logins', enabled: true },
            { label: 'Session Timeout', desc: 'Auto-logout after 30 minutes of inactivity', enabled: true },
            { label: 'IP Allowlist', desc: 'Restrict access to specific IP ranges', enabled: false },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{item.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
              </div>
              <button className={cn(
                'relative w-11 h-6 rounded-full transition-colors duration-200',
                item.enabled ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-700'
              )}>
                <span className={cn(
                  'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200',
                  item.enabled && 'translate-x-5'
                )} />
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
