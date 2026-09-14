import { useCallback, useState } from "react";
import storageService from "../services/storageService";

export default function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const stored = storageService.getJSON(key);
    return stored == null ? initialValue : stored;
  });

  const setStoredValue = useCallback(
    (next) => {
      setValue((prev) => {
        const resolved = typeof next === "function" ? next(prev) : next;
        storageService.setJSON(key, resolved);
        return resolved;
      });
    },
    [key]
  );

  return [value, setStoredValue];
}
