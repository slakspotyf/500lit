import { useState } from "react";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LanguageSwitch } from "@/components/app/language-switch";
import { useI18n } from "@/lib/i18n/locale";
import { LOCK_USERNAME, openSession, verifyLogin } from "@/lib/consumption/lock";

type Props = {
  onUnlock: (remember: boolean) => void;
};

export function LockScreen({ onUnlock }: Props) {
  const { t } = useI18n();
  const [username, setUsername] = useState(LOCK_USERNAME);
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!verifyLogin(username, password)) {
      setError(t.badLogin);
      setPassword("");
      return;
    }
    openSession(remember);
    onUnlock(remember);
  }

  return (
    <div className="app-grid-bg lock-stage flex min-h-dvh items-center justify-center px-4 py-8">
      <form onSubmit={onSubmit} className="motion-card relative z-10 w-full max-w-md rounded-xl border border-border bg-card/90 p-6 shadow-[0_24px_60px_rgb(28_25_21/0.12)] backdrop-blur-sm">
        <div className="mb-4 flex justify-end">
          <LanguageSwitch />
        </div>
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="lock-icon flex size-12 items-center justify-center rounded-lg bg-sidebar text-primary">
            <LockKeyhole className="size-6" />
          </span>
          <p className="mt-4 text-xs uppercase tracking-[0.2em] text-primary">{t.appTag}</p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-ink">{t.lockTitle}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t.lockLead}</p>
        </div>
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="lock-user">{t.username}</Label>
            <Input id="lock-user" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="lock-pass">{t.password}</Label>
            <Input id="lock-pass" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
          </div>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="size-4 accent-primary" />
            {t.remember}
          </label>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" className="mt-1 w-full">{t.signIn}</Button>
        </div>
      </form>
    </div>
  );
}
