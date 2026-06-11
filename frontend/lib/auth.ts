const TOKEN_KEY = "admin_token";
const EMAIL_KEY = "admin_email";

export function setToken(token: string, email: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(EMAIL_KEY, email);
  }
}

export function getToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
}

export function getAdminEmail(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem(EMAIL_KEY);
  }
  return null;
}

export function removeToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EMAIL_KEY);
  }
}

export function isAuthenticated(): boolean {
  const token = getToken();
  if (!token) return false;
  
  try {
    // Basic JWT expiry check (client-side only for UX validation)
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      removeToken();
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}
