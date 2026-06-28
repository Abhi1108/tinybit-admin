'use client';
import { Placeholder } from '@/src/components/Placeholder';
import { MapPin } from 'lucide-react';
export default function GeofencingPage() {
  return <Placeholder title="Geofencing" description="Configure safe zones for elders and get alerts when they leave boundaries." icon={<MapPin className="w-8 h-8 text-brand-400" />} />;
}
