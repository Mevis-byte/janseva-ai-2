import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Lang } from "./i18n";

type Theme = "light" | "dark";

interface AppState {
  lang: Lang;
  setLang: (l: Lang) => void;
  theme: Theme;
  toggleTheme: () => void;
  isAuthed: boolean;
  login: () => void;
  logout: () => void;
}

const AppCtx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  const [theme, setTheme] = useState<Theme>("light");
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const t = (localStorage.getItem("janseva.theme") as Theme) || "light";
    const l = (localStorage.getItem("janseva.lang") as Lang) || "en";
    const a = localStorage.getItem("janseva.auth") === "1";
    setTheme(t);
    setLangState(l);
    setIsAuthed(a);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("janseva.theme", theme);
  }, [theme]);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("janseva.lang", l);
  };

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const login = () => {
    setIsAuthed(true);
    localStorage.setItem("janseva.auth", "1");
  };
  const logout = () => {
    setIsAuthed(false);
    localStorage.removeItem("janseva.auth");
  };

  return (
    <AppCtx.Provider value={{ lang, setLang, theme, toggleTheme, isAuthed, login, logout }}>
      {children}
    </AppCtx.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
