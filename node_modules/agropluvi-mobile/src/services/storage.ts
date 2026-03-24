const KEY_TOKEN = '@agropluvi_token';
const KEY_USER = '@agropluvi_user';
const KEY_ORGANIZATION_ID = '@agropluvi_organizationId';
type UserRole = 'owner' | 'admin' | 'user';
type StorageApi = {
  multiSet: (pairs: [string, string][]) => Promise<void>;
  getItem: (key: string) => Promise<string | null>;
  multiRemove: (keys: string[]) => Promise<void>;
};

const memoryStore: Record<string, string> = {};
const memoryStorage = {
  getItem: (key: string) => Promise.resolve(memoryStore[key] ?? null),
  multiSet: (pairs: [string, string][]) => {
    pairs.forEach(([k, v]) => { memoryStore[k] = v; });
    return Promise.resolve();
  },
  multiRemove: (keys: string[]) => {
    keys.forEach((k) => delete memoryStore[k]);
    return Promise.resolve();
  },
};

let asyncStorageRef: StorageApi | null = null;
let preferMemoryStorage = false;

function isExpoGo(): boolean {
  try {
    const Constants = require('expo-constants').default;
    return Constants?.appOwnership === 'expo';
  } catch {
    return false;
  }
}

function getStorage(): StorageApi {
  if (preferMemoryStorage) return memoryStorage;
  if (isExpoGo()) {
    preferMemoryStorage = true;
    return memoryStorage;
  }
  if (asyncStorageRef) return asyncStorageRef;
  try {
    asyncStorageRef = require('@react-native-async-storage/async-storage').default as StorageApi;
    return asyncStorageRef;
  } catch {
    preferMemoryStorage = true;
    return memoryStorage;
  }
}

export async function saveSession(
  token: string,
  user: { id: string; name: string; email: string; organizationId: string; role?: UserRole },
  organizationId: string
): Promise<void> {
  const storage = getStorage();
  try {
    await storage.multiSet([
      [KEY_TOKEN, token],
      [KEY_USER, JSON.stringify(user)],
      [KEY_ORGANIZATION_ID, organizationId],
    ]);
  } catch {
    // Em alguns ambientes (ex.: Expo Go) o módulo pode existir mas não estar linkado.
    preferMemoryStorage = true;
    await memoryStorage.multiSet([
      [KEY_TOKEN, token],
      [KEY_USER, JSON.stringify(user)],
      [KEY_ORGANIZATION_ID, organizationId],
    ]);
  }
}

export async function getToken(): Promise<string | null> {
  const storage = getStorage();
  try {
    return await storage.getItem(KEY_TOKEN);
  } catch {
    preferMemoryStorage = true;
    return memoryStorage.getItem(KEY_TOKEN);
  }
}

export async function getUser(): Promise<{ id: string; name: string; email: string; organizationId: string; role?: UserRole } | null> {
  const storage = getStorage();
  try {
    const raw = await storage.getItem(KEY_USER);
    return raw ? (JSON.parse(raw) as { id: string; name: string; email: string; organizationId: string; role?: UserRole }) : null;
  } catch {
    preferMemoryStorage = true;
    const raw = await memoryStorage.getItem(KEY_USER);
    return raw ? (JSON.parse(raw) as { id: string; name: string; email: string; organizationId: string; role?: UserRole }) : null;
  }
}

export async function clearSession(): Promise<void> {
  const storage = getStorage();
  try {
    await storage.multiRemove([KEY_TOKEN, KEY_USER, KEY_ORGANIZATION_ID]);
  } catch {
    preferMemoryStorage = true;
    await memoryStorage.multiRemove([KEY_TOKEN, KEY_USER, KEY_ORGANIZATION_ID]);
  }
}
