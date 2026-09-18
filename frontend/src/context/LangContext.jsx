import { createContext, useContext, useState } from 'react';
import translations from '../data/translations';

const LangContext = createContext(null);
export const useLang = () => useContext(LangContext);

export const LANGS = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'mr', label: 'मराठी' },
];

const get = (obj, path) =>
  path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);

// Flatten legacy keys (dashboard-era strings) to the top level so existing
// callers like t('logout') and t('sync_pending') keep working.
const effectiveDict = (lang) => ({
  ...(translations.en?.legacy || {}),
  ...(translations[lang]?.legacy || {}),
  ...(translations[lang] || {}),
});

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem('nirovveda_lang');
    return LANGS.some((l) => l.code === saved) ? saved : 'en';
  });

  const dict = effectiveDict(lang);
  const enDict = effectiveDict('en');

  // resolve: lang dict → en dict → undefined
  const resolve = (path) => get(dict, path) ?? get(enDict, path);

  // t: always returns a string (falls back to en or the raw key)
  const t = (path) => resolve(path) ?? path;

  // tr: returns a translation if present, otherwise undefined
  // (used to fall back to data-file defaults for research/sources content)
  const tr = (path) => resolve(path);

  const changeLang = (code) => {
    if (!LANGS.some((l) => l.code === code)) return;
    setLang(code);
    localStorage.setItem('nirovveda_lang', code);
  };

  return (
    <LangContext.Provider value={{ lang, setLang: changeLang, t, tr, LANGS }}>
      {children}
    </LangContext.Provider>
  );
}