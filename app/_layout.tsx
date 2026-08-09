import { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useStore } from '@/store/useStore';
import { colors } from '@/constants/theme';

export default function RootLayout() {
  const hydrate = useStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textFaint,
          headerShown: false,
          tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Records',
            tabBarIcon: ({ color, size }) => <Ionicons name="receipt-outline" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="charts"
          options={{
            title: 'Charts',
            tabBarIcon: ({ color, size }) => <Ionicons name="pie-chart-outline" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="add"
          options={{
            title: 'Add',
            tabBarIcon: ({ color, size }) => <Ionicons name="add-circle" size={size + 12} color={colors.primary} />,
          }}
        />
        <Tabs.Screen
          name="budget"
          options={{
            title: 'Budget',
            tabBarIcon: ({ color, size }) => <Ionicons name="wallet-outline" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="plan"
          options={{
            title: 'Plan',
            tabBarIcon: ({ color, size }) => <Ionicons name="calculator-outline" size={size} color={color} />,
          }}
        />
        <Tabs.Screen name="settings" options={{ href: null }} />
      </Tabs>
    </SafeAreaProvider>
  );
}
