import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T, migrate?: (data: unknown) => T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        if (migrate) {
          const migrated = migrate(parsed);
          localStorage.setItem(key, JSON.stringify(migrated));
          return migrated;
        }
        return parsed;
      }
      return initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(storedValue));
    } catch { /* empty */ }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
