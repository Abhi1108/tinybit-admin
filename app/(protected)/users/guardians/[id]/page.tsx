import { UserProfileClient } from '@/src/components/users/UserProfileClient';

// Required for `output: 'export'` dynamic routes — not product data.
export function generateStaticParams() {
  return [{ id: '_' }];
}

export default function GuardianProfilePage({ params }: { params: { id: string } }) {
  return <UserProfileClient id={params.id} roleLabel="Guardian" />;
}
