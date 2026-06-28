'use client';
import { Placeholder } from '@/src/components/Placeholder';
import { Stethoscope } from 'lucide-react';
export default function DoctorsPage() {
  return <Placeholder title="Doctor Records" icon={<Stethoscope className="w-8 h-8 text-brand-400" />} />;
}
