import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { setStoredLanguage } from 'utils/storage';

const getNormalizedLanguage = (language) =>
  language?.startsWith('en') ? 'en' : 'vi';

const createTextsProxy = (translate) =>
  new Proxy(
    {},
    {
      get: (_target, key) => {
        if (typeof key !== 'string') {
          return undefined;
        }

        return translate(key, { defaultValue: key });
      },
    }
  );

export const useLanguageValue = () => {
  const { i18n, t: translate } = useTranslation();
  const language = getNormalizedLanguage(i18n.language);

  const toggleLanguage = useCallback(() => {
    const nextLanguage = language === 'vi' ? 'en' : 'vi';
    setStoredLanguage(nextLanguage);
    i18n.changeLanguage(nextLanguage);
  }, [i18n, language]);

  const t = useCallback(
    (key, optionsOrFallback, maybeOptions) => {
      if (typeof optionsOrFallback === 'string') {
        return translate(key, {
          defaultValue: optionsOrFallback,
          ...(maybeOptions || {}),
        });
      }

      return translate(key, optionsOrFallback);
    },
    [translate]
  );

  const texts = useMemo(() => createTextsProxy(translate), [translate]);

  return {
    language,
    t,
    texts,
    toggleLanguage,
  };
};
