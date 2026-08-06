import { getCollection, type CollectionEntry } from 'astro:content';
import { getLocaleFromId, getLocalePath, localeMeta, stripLocaleFromId, type Locale } from '../../config/i18n';

export type ContentType = 'posts' | 'projects' | 'pages';

export function entryLocale(entry: CollectionEntry<ContentType>) {
  return entry.data.lang || getLocaleFromId(entry.id);
}

export function entrySlug(entry: CollectionEntry<ContentType>) {
  return stripLocaleFromId(entry.id).replace(/\/index$/, '');
}

export function entryDate(entry: CollectionEntry<ContentType>) {
  return entry.data.pubDate || entry.data.updatedDate || new Date(0);
}

export function isPublished(entry: CollectionEntry<ContentType>) {
  return !entry.data.draft;
}

export async function getLocalizedEntries<T extends ContentType>(collection: T, locale: Locale) {
  const entries = await getCollection(collection, ({ data }) => !data.draft);
  return entries
    .filter((entry) => entryLocale(entry as CollectionEntry<ContentType>) === locale)
    .sort((a, b) => entryDate(b as CollectionEntry<ContentType>).getTime() - entryDate(a as CollectionEntry<ContentType>).getTime());
}

export function localizedEntryPath(collection: ContentType, entry: CollectionEntry<ContentType>) {
  const slug = entrySlug(entry);
  const locale = entryLocale(entry);
  const base = collection === 'pages' ? '' : `/${collection}`;
  const path = `${base}/${slug}/`.replace(/\/+/g, '/');
  return getLocalePath(locale, path);
}

export function formatDate(date: Date | undefined, locale: Locale) {
  if (!date) return '';
  return new Intl.DateTimeFormat(localeMeta[locale].dateLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC'
  }).format(date);
}

/** 生成指向当前语言 Archives 筛选状态的链接。 */
export function archiveFilterPath(locale: Locale, filter: 'category' | 'tag', value: string) {
  const query = new URLSearchParams({ [filter]: value });
  return `${getLocalePath(locale, '/archives/')}?${query.toString()}`;
}

export type ArchiveTerm = {
  value: string;
  count: number;
};

/** 收集当前 locale 已发布 posts 的归档筛选词条。 */
export function collectArchiveTerms(
  posts: Array<CollectionEntry<'posts'>>,
  field: 'tags' | 'categories',
  locale: Locale
): ArchiveTerm[] {
  const counts = new Map<string, number>();

  for (const post of posts) {
    const terms = new Set((post.data[field] || []).map((term) => term.trim()).filter(Boolean));
    for (const term of terms) counts.set(term, (counts.get(term) || 0) + 1);
  }

  const collator = new Intl.Collator(localeMeta[locale].dateLocale);
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => collator.compare(a.value, b.value));
}

export function adjacentEntries<T extends ContentType>(entries: Array<CollectionEntry<T>>, current: CollectionEntry<T>) {
  const index = entries.findIndex((entry) => entry.id === current.id);
  return {
    previous: index >= 0 ? entries[index + 1] : undefined,
    next: index > 0 ? entries[index - 1] : undefined
  };
}

export function relatedPosts(posts: Array<CollectionEntry<'posts'>>, current: CollectionEntry<'posts'>, limit = 3) {
  const currentTerms = new Set(current.data.tags || []);

  return posts
    .filter((entry) => entry.id !== current.id)
    .map((entry) => {
      const score = (entry.data.tags || []).filter((term) => currentTerms.has(term)).length;

      return { entry, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || entryDate(b.entry as any).getTime() - entryDate(a.entry as any).getTime())
    .slice(0, limit)
    .map((item) => item.entry);
}
