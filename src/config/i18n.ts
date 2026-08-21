export const defaultLocale = 'pt-br';
export const locales = ['pt-br', 'en'] as const;

export type Locale = (typeof locales)[number];

export const localeMeta: Record<
  Locale,
  { label: string; htmlLang: string; dateLocale: string; ogLocale: string }
> = {
  'pt-br': {
    label: 'Português',
    htmlLang: 'pt-BR',
    dateLocale: 'pt-BR',
    ogLocale: 'pt_BR'
  },
  en: {
    label: 'English',
    htmlLang: 'en',
    dateLocale: 'en-US',
    ogLocale: 'en_US'
  }
};

export const difficultyLevels: Record<Locale, readonly string[]> = {
  'pt-br': ['Iniciante', 'Intermediário', 'Avançado'],
  en: ['Beginner', 'Intermediate', 'Advanced']
};

export const localeRssPaths: Record<Locale, string> = {
  'pt-br': '/rss.xml',
  en: '/rss_en.xml'
};

const localizedRouteSegments: Record<Locale, Record<string, string>> = {
  'pt-br': { license: 'licenca' },
  en: { licenca: 'license' }
};

export function isLocale(value: string | undefined): value is Locale {
  return Boolean(value && locales.includes(value as Locale));
}

export function getLocalePath(locale: Locale, path = '/') {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const localized =
    locale === defaultLocale ? normalized : `/${locale}${normalized === '/' ? '/' : normalized}`;
  const base = import.meta.env.BASE_URL || '/';
  if (base === '/') return localized;
  return `${base.replace(/\/$/, '')}${localized}`.replace(/\/+/g, '/');
}

function stripBasePath(path: string) {
  const base = import.meta.env.BASE_URL || '/';
  if (base === '/') return path;

  const normalizedBase = base.replace(/\/$/, '');
  if (path === normalizedBase) return '/';
  if (path.startsWith(`${normalizedBase}/`)) return path.slice(normalizedBase.length) || '/';
  return path;
}

export function switchLocalePath(targetLocale: Locale, currentPath: string) {
  const withoutBase = stripBasePath(currentPath);
  const normalized = withoutBase.startsWith('/') ? withoutBase : `/${withoutBase}`;
  const segments = normalized.split('/').filter(Boolean);
  const currentLocale = isLocale(segments[0]) ? segments[0] : defaultLocale;
  const rest = currentLocale === defaultLocale ? segments : segments.slice(1);
  const translatedRest =
    rest.length === 1 && localizedRouteSegments[targetLocale][rest[0]]
      ? [localizedRouteSegments[targetLocale][rest[0]]]
      : rest;
  const path = `/${translatedRest.join('/')}${translatedRest.length > 0 ? '/' : ''}`.replace(
    /\/+/g,
    '/'
  );
  return getLocalePath(targetLocale, path);
}

export function getLocaleFromId(id: string): Locale {
  const firstSegment = id.split('/')[0];
  return isLocale(firstSegment) ? firstSegment : defaultLocale;
}

export function stripLocaleFromId(id: string) {
  const [firstSegment, ...rest] = id.split('/');
  return isLocale(firstSegment) ? rest.join('/') : id;
}
