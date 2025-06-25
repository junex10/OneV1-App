import AsyncStorage from "@react-native-async-storage/async-storage";

const Storage = {
  async set(key: string, value: any): Promise<void> {
    const toStore = typeof value === "string" ? value : JSON.stringify(value);
    await AsyncStorage.setItem(key, toStore);
  },

  async get<T = any>(key: string): Promise<T | null> {
    const value = await AsyncStorage.getItem(key);
    if (value === null) return null;
    try {
      return JSON.parse(value);
    } catch {
      return value as unknown as T;
    }
  },

  async remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  },

  async clear(): Promise<void> {
    await AsyncStorage.clear();
  },

  async has(key: string): Promise<boolean> {
    const value = await AsyncStorage.getItem(key);
    return value !== null;
  },
};

export default Storage;
