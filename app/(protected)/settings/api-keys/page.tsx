'use client';
import { Placeholder } from '@/src/components/Placeholder';
import { Key } from 'lucide-react';
export default function APIKeysPage() {
  return <Placeholder title="API Keys" description="Manage API keys for OpenAI, Supabase, and third-party integrations." icon={<Key className="w-8 h-8 text-brand-400" />} />;
}
