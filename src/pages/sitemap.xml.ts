import { getCollection } from 'astro:content';
import { locales, getLocalePath } from '../config/i18n';
import { localizedEntryPath } from '../lib/content/entries';
import { localizedSeriesPath } from '../lib/content/series';

type SitemapEntry = {
  path: string;
  lastmod?: Date;
};

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function GET({ site, url }: { site?: URL; url: URL }) {
  const origin = (site?.origin || url.origin).replace(/\/$/, '');
  const posts = await getCollection('posts', ({ data }) => !data.draft);
  const projects = await getCollection('projects', ({ data }) => !data.draft);
  const pages = await getCollection('pages', ({ data }) => !data.draft);
  const series = await getCollection('series', ({ data }) => !data.draft);

  const latestPostDate = posts
    .map((entry) => entry.data.updatedDate || entry.data.pubDate)
    .sort((a, b) => b.getTime() - a.getTime())[0];
  const latestProjectDate = projects
    .map((entry) => entry.data.updatedDate || entry.data.pubDate)
    .filter((date): date is Date => Boolean(date))
    .sort((a, b) => b.getTime() - a.getTime())[0];

  const staticEntries: SitemapEntry[] = locales.flatMap((locale) => [
    { path: getLocalePath(locale, '/'), lastmod: latestPostDate },
    { path: getLocalePath(locale, '/posts/'), lastmod: latestPostDate },
    { path: getLocalePath(locale, '/archives/'), lastmod: latestPostDate },
    ...(projects.length > 0
      ? [{ path: getLocalePath(locale, '/projects/'), lastmod: latestProjectDate }]
      : []),
    ...(series.length > 0 ? [{ path: getLocalePath(locale, '/series/') }] : [])
  ]);

  const contentEntries: SitemapEntry[] = [
    ...posts.map((entry) => ({
      path: localizedEntryPath('posts', entry as any),
      lastmod: entry.data.updatedDate || entry.data.pubDate
    })),
    ...projects.map((entry) => ({
      path: localizedEntryPath('projects', entry as any),
      lastmod: entry.data.updatedDate || entry.data.pubDate
    })),
    ...pages.map((entry) => ({
      path: localizedEntryPath('pages', entry as any),
      lastmod: entry.data.updatedDate || entry.data.pubDate
    })),
    ...series.map((entry) => ({ path: localizedSeriesPath(entry) }))
  ];

  const uniqueEntries = new Map<string, SitemapEntry>();
  for (const entry of [...staticEntries, ...contentEntries]) {
    const current = uniqueEntries.get(entry.path);
    if (!current || (entry.lastmod && (!current.lastmod || entry.lastmod > current.lastmod))) {
      uniqueEntries.set(entry.path, entry);
    }
  }

  const urls = [...uniqueEntries.values()]
    .map(({ path, lastmod }) => [
      '<url>',
      `<loc>${escapeXml(`${origin}${path}`)}</loc>`,
      lastmod ? `<lastmod>${lastmod.toISOString()}</lastmod>` : '',
      '</url>'
    ].join(''))
    .join('');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
    {
      headers: {
        'content-type': 'application/xml; charset=utf-8'
      }
    }
  );
}
