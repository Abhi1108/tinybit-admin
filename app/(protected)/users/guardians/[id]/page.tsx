import { UserProfileClient } from '@/src/components/users/UserProfileClient';

export default function GuardianProfilePage({ params }: { params: { id: string } }) {
  return <UserProfileClient id={params.id} roleLabel="Guardian" />;
}
