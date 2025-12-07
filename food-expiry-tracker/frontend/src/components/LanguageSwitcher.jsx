import { useI18n } from '../context/I18nContext';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const { language, changeLanguage } = useI18n();

  return (
    <div className="flex items-center space-x-1 bg-neutral-100 dark:bg-neutral-dark-surface rounded-lg p-0.5 border dark:border-neutral-dark-border">
      <button
        onClick={() => changeLanguage('en')}
        className={`flex items-center justify-center min-w-[2.5rem] px-2 py-1.5 rounded transition-colors duration-200 text-xs font-medium ${
          language === 'en'
            ? 'bg-white dark:bg-neutral-dark-surface-hover text-primary dark:text-primary-400 shadow-sm dark:shadow-black/20'
            : 'text-neutral-600 dark:text-neutral-dark-text-secondary hover:text-neutral-900 dark:hover:text-neutral-dark-text'
        }`}
        title="English"
      >
        EN
      </button>
      <button
        onClick={() => changeLanguage('hi')}
        className={`flex items-center justify-center min-w-[2.5rem] px-2 py-1.5 rounded transition-colors duration-200 text-xs font-medium ${
          language === 'hi'
            ? 'bg-white dark:bg-neutral-dark-surface-hover text-primary dark:text-primary-400 shadow-sm dark:shadow-black/20'
            : 'text-neutral-600 dark:text-neutral-dark-text-secondary hover:text-neutral-900 dark:hover:text-neutral-dark-text'
        }`}
        title="हिंदी"
      >
        हि
      </button>
    </div>
  );
}
