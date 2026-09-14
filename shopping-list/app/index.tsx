import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useStore } from '@/store/useStore';
import { colors } from '@/constants/theme';

export default function Gate() {
  const hydrated = useStore((s) => s.hydrated);
  const groupCode = useStore((s) => s.session?.groupCode);

  if (!hydrated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  return <Redirect href={groupCode ? '/home' : '/onboarding'} />;
}
