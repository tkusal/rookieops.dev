import { getCollection, getEntries, type CollectionEntry } from 'astro:content';
import { getLocaleFromId, getLocalePath, localeMeta, stripLocaleFromId, type Locale } from '../../config/i18n';
import { entryDate, entryLocale } from './entries';

export type ResolvedSeries = {
  entry: CollectionEntry<'series'>;
  chapters: Array<CollectionEntry<'posts'>>;
  locale: Locale;
  slug: string;
  latestChapterDate: Date;
};

export type SeriesContext = {
  series: ResolvedSeries;
  position: number;
  previous?: CollectionEntry<'posts'>;
  next?: CollectionEntry<'posts'>;
};

export function seriesLocale(entry: CollectionEntry<'series'>) {
  return entry.data.lang || getLocaleFromId(entry.id);
}

export function seriesSlug(entry: CollectionEntry<'series'>) {
  return stripLocaleFromId(entry.id).replace(/\/index$/, '');
}

export function localizedSeriesPath(entry: CollectionEntry<'series'>) {
  return getLocalePath(seriesLocale(entry), `/series/${seriesSlug(entry)}/`);
}

async function resolvePublishedSeries() {
  const entries = await getCollection('series', ({ data }) => !data.draft);
  const claimedPosts = new Map<string, string>();
  const resolved: ResolvedSeries[] = [];

  for (const entry of entries) {
    const chapters = await getEntries(entry.data.chapters);
    const locale = seriesLocale(entry);
    const chapterIds = new Set<string>();

    for (const chapter of chapters) {
      if (chapterIds.has(chapter.id)) {
        throw new Error(`Series "${entry.id}" references post "${chapter.id}" more than once.`);
      }
      chapterIds.add(chapter.id);

      if (entryLocale(chapter) !== locale) {
        throw new Error(`Series "${entry.id}" and post "${chapter.id}" must use the same locale.`);
      }
      if (chapter.data.draft) {
        throw new Error(`Published series "${entry.id}" cannot reference draft post "${chapter.id}".`);
      }

      const owner = claimedPosts.get(chapter.id);
      if (owner) {
        throw new Error(`Post "${chapter.id}" cannot belong to both series "${owner}" and "${entry.id}".`);
      }
      claimedPosts.set(chapter.id, entry.id);
    }

    const latestChapterDate = chapters.reduce(
      (latest, chapter) => entryDate(chapter).getTime() > latest.getTime() ? entryDate(chapter) : latest,
      new Date(0)
    );

    resolved.push({
      entry,
      chapters,
      locale,
      slug: seriesSlug(entry),
      latestChapterDate
    });
  }

  return resolved;
}

let publishedSeriesPromise: ReturnType<typeof resolvePublishedSeries> | undefined;

export function getPublishedSeries() {
  publishedSeriesPromise ||= resolvePublishedSeries();
  return publishedSeriesPromise;
}

export async function getLocalizedSeries(locale: Locale) {
  const series = await getPublishedSeries();
  const collator = new Intl.Collator(localeMeta[locale].dateLocale);

  return series
    .filter((item) => item.locale === locale)
    .sort((a, b) => b.latestChapterDate.getTime() - a.latestChapterDate.getTime()
      || collator.compare(a.entry.data.title, b.entry.data.title));
}

export async function getSeriesContext(post: CollectionEntry<'posts'>): Promise<SeriesContext | undefined> {
  const series = await getPublishedSeries();

  for (const item of series) {
    const index = item.chapters.findIndex((chapter) => chapter.id === post.id);
    if (index >= 0) {
      return {
        series: item,
        position: index + 1,
        previous: index > 0 ? item.chapters[index - 1] : undefined,
        next: item.chapters[index + 1]
      };
    }
  }

  return undefined;
}
