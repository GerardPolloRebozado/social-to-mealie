export const locales = ['en', 'de'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/**
 * Picks the best supported locale from an Accept-Language header, honouring q-values.
 * Region subtags are ignored ("de-AT" counts as "de"); anything unsupported falls back to English.
 */
export function pickLocale(acceptLanguage: string | null | undefined): Locale {
  if (!acceptLanguage) return defaultLocale;

  const ranked = acceptLanguage
    .split(',')
    .map((part, index) => {
      const [tag, ...params] = part.trim().split(';');
      const qParam = params.map((param) => param.trim()).find((param) => param.startsWith('q='));
      const quality = qParam ? Number.parseFloat(qParam.slice(2)) : 1;
      return { language: tag.trim().toLowerCase().split('-')[0], quality, index };
    })
    .filter((entry) => entry.language && entry.quality > 0)
    .sort((a, b) => b.quality - a.quality || a.index - b.index);

  for (const entry of ranked) {
    if (isLocale(entry.language)) return entry.language;
  }
  return defaultLocale;
}
