'use client';
import { Placeholder } from '@/src/components/Placeholder';
import { Activity } from 'lucide-react';
export default function WellnessPage() {
  return <Placeholder title="Wellness Logs" description="View and analyze elder wellness data including vitals, sleep, hydration, and activity tracking." icon={<Activity className="w-8 h-8 text-brand-400" />} />;
}
