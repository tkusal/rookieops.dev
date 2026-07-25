import { getLocalePath, type Locale } from './i18n';
import { contentTypes } from './content';
import { siteConfig } from './site';

export type NavigationConfigItem = string | {
  label: Record<Locale, string>;
  href: string;
  icon: string;
};

const systemRoutes = {
  archives: {
    label: { 'pt-br': 'Arquivo' },
    href: '/archives/',
    icon: 'lucide:archive'
  },
  series: {
    label: { 'pt-br': 'Séries' },
    href: '/series/',
    icon: 'lucide:list-ordered'
  }
} satisfies Record<string, {
  label: Record<Locale, string>;
  href: string;
  icon: string;
}>;

const routeRegistry = {
  ...Object.fromEntries(Object.entries(contentTypes).map(([id, config]) => [id, {
    label: config.label,
    href: config.path,
    icon: config.icon
  }])),
  ...systemRoutes
} as Record<string, {
  label: Record<Locale, string>;
  href: string;
  icon: string;
}>;

function resolveNavigationItem(item: NavigationConfigItem) {
  if (typeof item !== 'string') return item;
  return routeRegistry[item];
}

function resolveHref(locale: Locale, href: string) {
  if (/^(https?:)?\/\//.test(href) || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) {
    return href;
  }
  return getLocalePath(locale, href);
}

export function getNavigation(locale: Locale, items: NavigationConfigItem[] = siteConfig.nav) {
  return items
    .map(resolveNavigationItem)
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .map((item) => ({
      href: resolveHref(locale, item.href),
      label: item.label[locale],
      icon: item.icon
    }));
}

export function getFooterNavigation(locale: Locale) {
  return getNavigation(locale, siteConfig.footerNav);
}
