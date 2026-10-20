import { Tabs } from 'expo-router';
import { useColors } from '@/components/Themed';

const TABS = [
  { name: 'folders', title: 'Folders' },
  { name: 'player', title: 'Player' },
  { name: 'queues', title: 'Queues' },
  { name: 'albums', title: 'Albums' },
  { name: 'artists', title: 'Artists' },
  { name: 'playlists', title: 'Playlists' },
  { name: 'settings', title: 'Settings' },
] as const;

export default function TabsLayout() {
  const colors = useColors();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.subtle,
        tabBarStyle: { backgroundColor: colors.background, borderTopColor: colors.border },
        tabBarIcon: () => null,
        tabBarLabelStyle: { fontSize: 12 },
        tabBarIconStyle: { display: 'none' },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen key={tab.name} name={tab.name} options={{ title: tab.title }} />
      ))}
    </Tabs>
  );
}
