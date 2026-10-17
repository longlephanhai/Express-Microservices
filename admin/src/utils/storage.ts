export const storage = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  getString(key: string, defaultValue: string = ''): string {
    try {
      return localStorage.getItem(key) ?? defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set(key: string, value: unknown): void {
    try {
      if (typeof value === 'string') {
        localStorage.setItem(key, value);
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn('LocalStorage remove error:', e);
    }
  },

  clear(): void {
    try {
      localStorage.clear();
    } catch (e) {
      console.warn('LocalStorage clear error:', e);
    }
  },
};
