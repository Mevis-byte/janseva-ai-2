import { useApp } from "@/lib/app-context";
import { langLabel, type Lang } from "@/lib/i18n";
import { Languages, Moon, Sun, Shield, User as UserIcon, LogOut } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function TopBar({ showLogout = false }: { showLogout?: boolean }) {
  const { lang, setLang, theme, toggleTheme, logout, user, isAuthed } = useApp();

  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ||
    (user?.user_metadata?.name as string | undefined) ||
    user?.email ||
    user?.phone ||
    "Citizen";
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
  const initials = displayName
    .split(/[\s@]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("") || "C";

  return (
    <header className="sticky top-0 z-30 glass border-b border-border">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="h-9 w-9 rounded-xl bg-gradient-primary grid place-items-center shadow-glow">
            <Shield className="h-4.5 w-4.5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div className="leading-tight">
            <div className="font-display font-bold text-base">JanSeva AI</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Citizen Grievance</div>
          </div>
        </Link>
        <div className="flex items-center gap-1.5">
          <div className="hidden sm:flex items-center gap-1 px-2 py-1.5 rounded-full bg-secondary text-secondary-foreground">
            <Languages className="h-3.5 w-3.5 ml-1 text-muted-foreground" />
            {(Object.keys(langLabel) as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`text-xs px-2.5 py-1 rounded-full transition-all ${
                  lang === l ? "bg-card shadow-soft font-semibold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {langLabel[l]}
              </button>
            ))}
          </div>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as Lang)}
            className="sm:hidden text-xs bg-secondary rounded-full px-3 py-2 border-0 focus:ring-2 focus:ring-ring"
          >
            {(Object.keys(langLabel) as Lang[]).map((l) => (
              <option key={l} value={l}>{langLabel[l]}</option>
            ))}
          </select>
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="h-9 w-9 grid place-items-center rounded-full hover:bg-secondary transition-colors"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {showLogout && isAuthed && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="Account menu"
                  className="ml-1 rounded-full ring-2 ring-transparent hover:ring-primary/40 transition-all"
                >
                  <Avatar className="h-9 w-9">
                    {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold truncate">{displayName}</span>
                    {user?.email && (
                      <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <UserIcon className="h-4 w-4 mr-2" /> View profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4 mr-2" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
