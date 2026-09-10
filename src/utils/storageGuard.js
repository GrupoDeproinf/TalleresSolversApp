// Guardian de almacenamiento local (APP-SEC-1).
// 1) Toda escritura de '@userInfo' pasa por sanitizeUserInfo: nunca se guarda la contrasena
//    ni otros campos sensibles en el telefono, sin importar desde que pantalla se guarde.
// 2) Al arrancar, limpia el '@userInfo' que haya quedado de versiones anteriores.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sanitizeUserInfo } from './sanitizeUserInfo';

const USER_KEY = '@userInfo';

const cleanValue = value => {
  if (typeof value !== 'string') return value;
  try {
    return JSON.stringify(sanitizeUserInfo(JSON.parse(value)));
  } catch (e) {
    return value;
  }
};

const originalSetItem = AsyncStorage.setItem.bind(AsyncStorage);
AsyncStorage.setItem = (key, value, callback) =>
  originalSetItem(key, key === USER_KEY ? cleanValue(value) : value, callback);

const originalMergeItem = AsyncStorage.mergeItem
  ? AsyncStorage.mergeItem.bind(AsyncStorage)
  : null;
if (originalMergeItem) {
  AsyncStorage.mergeItem = (key, value, callback) =>
    originalMergeItem(key, key === USER_KEY ? cleanValue(value) : value, callback);
}

export const cleanStoredUserInfo = async () => {
  try {
    const current = await AsyncStorage.getItem(USER_KEY);
    if (current) {
      const cleaned = cleanValue(current);
      if (cleaned !== current) await originalSetItem(USER_KEY, cleaned);
    }
  } catch (e) {}
};

cleanStoredUserInfo();
