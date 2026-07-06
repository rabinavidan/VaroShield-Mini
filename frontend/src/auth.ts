import { useEffect, useState } from "react";

const AUTH_EVENT = "varoshield-auth-change";

export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function getRole(): string {
  return localStorage.getItem("role") || "";
}

export function setAuth(token: string, role: string): void {
  localStorage.setItem("token", token);
  localStorage.setItem("role", role);
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function clearAuth(): void {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function useIsAuthenticated(): boolean {
  const [token, setToken] = useState(getToken());

  useEffect(() => {
    function sync() {
      setToken(getToken());
    }
    window.addEventListener(AUTH_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(AUTH_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return Boolean(token);
}
