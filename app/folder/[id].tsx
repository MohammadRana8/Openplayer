import { useLocalSearchParams } from 'expo-router';
import { FolderDetailScreen } from '@/screens/FolderDetailScreen';

export default function FolderRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <FolderDetailScreen folderId={Number(id)} />;
}
