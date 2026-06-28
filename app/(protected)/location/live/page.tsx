'use client';
import { Placeholder } from '@/src/components/Placeholder';
import { Map } from 'lucide-react';
export default function LiveLocationPage() {
  return <Placeholder title="Live Locations" description="Real-time location tracking for all active elders on Google Maps." icon={<Map className="w-8 h-8 text-brand-400" />} />;
}
