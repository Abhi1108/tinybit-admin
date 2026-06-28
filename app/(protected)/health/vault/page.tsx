'use client';
import { Placeholder } from '@/src/components/Placeholder';
import { FileText } from 'lucide-react';
export default function VaultPage() {
  return <Placeholder title="Health Vault" description="Manage medical documents, lab reports, and prescriptions uploaded by elders." icon={<FileText className="w-8 h-8 text-brand-400" />} />;
}
