import { useI18n } from '../context/I18nContext';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const { language, changeLanguage } = useI18n();

  return (
    <div className="flex items-center space-x-1 bg-neutral-100 rounded-lg p-1">
      <button
        onClick={() => changeLanguage('en')}
        className={`flex items-center gap-1 px-3 py-1.5 rounded transition-colors text-sm font-medium ${
          language === 'en'
            ? 'bg-white text-primary shadow-sm'
            : 'text-neutral-600 hover:text-neutral-900'
        }`}
      >
        <Globe className="w-4 h-4" />
        EN
      </button>
      <button
        onClick={() => changeLanguage('hi')}
        className={`flex items-center gap-1 px-3 py-1.5 rounded transition-colors text-sm font-medium ${
          language === 'hi'
            ? 'bg-white text-primary shadow-sm'
            : 'text-neutral-600 hover:text-neutral-900'
        }`}
      >
        <Globe className="w-4 h-4" />
        हि
      </button>
    </div>
  );
}
