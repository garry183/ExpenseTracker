import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session } from '@/types';
import { uid } from './codes';

const KEY = 'shopping-list.session';

export async function loadSession(): Promise<Session> {
  const raw = await AsyncStorage.getItem(KEY);
  if (raw) return JSON.parse(raw) as Session;
  const fresh: Session = { deviceId: uid(), userName: '', groupCode: null };
  await AsyncStorage.setItem(KEY, JSON.stringify(fresh));
  return fresh;
}

export async function saveSession(session: Session): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(session));
}
