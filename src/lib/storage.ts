import Cookies from "js-cookie";

const ACCESS_TOKEN_KEY = "accessToken";

export const tokenStorage = {
  getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem(ACCESS_TOKEN_KEY) || Cookies.get(ACCESS_TOKEN_KEY) || null;
  },

  setAccessToken(token: string): void {
    if (typeof window === "undefined") return;
    // 1. Save in sessionStorage (cleared when tab closes)
    sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
    
    // 2. Save in Cookie (readable by Next.js middleware / SSR)
    Cookies.set(ACCESS_TOKEN_KEY, token, {
      secure: true,
      sameSite: "strict",
      expires: 1, // 1 day fallback expiration
    });
  },

  clearTokens(): void {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    Cookies.remove(ACCESS_TOKEN_KEY);
  },
};