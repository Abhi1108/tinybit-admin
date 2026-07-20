'use client';
import { Placeholder } from '@/src/components/Placeholder';
import { Activity } from 'lucide-react';

export default function MovementHistoryPage() {
  return (
    <Placeholder
      title="Movement History"
      description="Skipped for now — elder_locations only stores the latest live point. GPS history needs a new table before this page can be wired."
      icon={<Activity className="w-8 h-8 text-brand-400" />}
    />
  );
}
