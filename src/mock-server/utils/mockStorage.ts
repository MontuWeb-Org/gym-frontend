export function getStorage<T>(
  key: string,
  fallback: T
): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  const item = localStorage.getItem(key);

  if (!item) {
    return fallback;
  }

  try {
    return JSON.parse(item) as T;
  } catch {
    return fallback;
  }
}

export function setStorage<T>(
  key: string,
  data: T
): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(
    key,
    JSON.stringify(data)
  );
}