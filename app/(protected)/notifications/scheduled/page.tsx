'use client';

import React from 'react';
import { Clock, AlertCircle } from 'lucide-react';

export default function ScheduledNotificationsPage() {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Clock className="w-6 h-6 text-brand-500" /> Scheduled Notifications
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Create and monitor automated notification campaigns
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-sm text-amber-800 dark:text-amber-300">
        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-medium">Scheduling engine is not available yet</p>
          <p className="mt-1 text-amber-700 dark:text-amber-400">
            There is no campaign scheduler or job table on the server. Recurring/one-time schedules
            previously used in-memory mock data and have been removed until a real scheduling
            subsystem is built. Use <strong>Push Notifications</strong> for immediate in-app broadcasts.
          </p>
        </div>
      </div>

      <div className="card py-16 text-center text-slate-400 text-sm">
        No scheduled campaigns.
      </div>
    </div>
  );
}
