import { UserProfileClient } from '@/src/components/users/UserProfileClient';

export function generateStaticParams() {
  return [{ id: 'dummy' }];
}

export default function GuardianProfilePage({ params }: { params: { id: string } }) {
  return <UserProfileClient id={params.id} roleLabel="Guardian" />;
}
