import { UserProfileClient } from '@/src/components/users/UserProfileClient';

export default function ElderProfilePage({ params }: { params: { id: string } }) {
  return <UserProfileClient id={params.id} roleLabel="Elder" />;
}
