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
      className="flex items-center gap-0.5 p-0.5 rounded-full bg-white/8 border border-white/10 backdrop-blur-sm"
      title="Switch language / भाषा बदलें / ಭಾಷೆ ಬದಲಾಯಿಸಿ"
    >
      {LANGUAGES.map((lang) => {
        const isActive = current === lang.code;
        return (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            title={lang.full}
            className={`
              relative px-2.5 py-1 rounded-full text-xs font-bold tracking-wide transition-all duration-300
              ${isActive
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/30 scale-105'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
              }
            `}
          >
            {lang.label}
            {isActive && (
              <span className="absolute inset-0 rounded-full bg-purple-400/20 animate-ping pointer-events-none" />
            )}
          </button>
        );
      })}
    </div>
  );
}

export default LanguageSwitcher;
