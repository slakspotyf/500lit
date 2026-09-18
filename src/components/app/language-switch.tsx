import { useI18n } from "@/lib/i18n/locale";
import { cn } from "@/lib/utils";

export function LanguageSwitch({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();
  return (
    <div className={cn("inline-flex h-10 overflow-hidden rounded-md border border-border bg-card", className)} role="group" aria-label="Language">
      <button type="button" onClick={() => setLocale("fr")} className={cn("min-w-10 px-2.5 text-sm font-semibold", locale === "fr" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent")}>
        {t.langFr}
      </button>
      <button type="button" onClick={() => setLocale("ar")} className={cn("min-w-10 px-2.5 font-arabic text-sm font-semibold", locale === "ar" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent")}>
        {t.langAr}
      </button>
    </div>
  );
}
