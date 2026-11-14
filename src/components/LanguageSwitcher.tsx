import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'en', label: 'EN', full: 'English' },
  { code: 'hi', label: 'हि', full: 'हिंदी' },
  { code: 'kn', label: 'ಕ', full: 'ಕನ್ನಡ' },
] as const;

interface LanguageSwitcherProps {
  compact?: boolean; // compact = just pill buttons, no label
}

export function LanguageSwitcher({ compact = true }: LanguageSwitcherProps) {
  const { i18n } = useTranslation();
  const current = i18n.language?.slice(0, 2) || 'en';

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('smurfpakad_lang', code);
  };

  return (
    <div
      className="flex items-center gap-0.5 rounded-lg border border-black/[0.08] p-0.5 dark:border-white/[0.08]"
      role="group"
      aria-label="Language"
      title="Switch language / भाषा बदलें / ಭಾಷೆ ಬದಲಾಯಿಸಿ"
    >
      {LANGUAGES.map((lang) => {
        const isActive = current === lang.code;
        return (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            title={lang.full}
            aria-pressed={isActive}
            className={`rounded-md px-2 py-1 text-xs transition-colors ${
              isActive
                ? 'bg-black/[0.06] font-medium text-zinc-900 dark:bg-white/[0.08] dark:text-white'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            {lang.label}
          </button>
        );
      })}
    </div>
  );
}

export default LanguageSwitcher;
