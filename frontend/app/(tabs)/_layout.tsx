import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="today/index" options={{ title: 'Today' }} />
      <Tabs.Screen name="chat/index" options={{ title: 'Chat' }} />
      <Tabs.Screen name="library/index" options={{ title: 'Library' }} />
      <Tabs.Screen name="library/quotes/[id]" options={{ href: null }} />
      <Tabs.Screen name="library/books/[id]" options={{ href: null }} />
    </Tabs>
  );
}
