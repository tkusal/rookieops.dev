import type { CollectionEntry } from 'astro:content';
import { defaultLocale, localeMeta, type Locale } from '../../config/i18n';
import { siteConfig } from '../../config/site';
import { localizedEntryPath } from './entries';

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function renderRss(
  posts: Array<CollectionEntry<'posts'>>,
  origin: string,
  basePath = '/',
  locale: Locale = defaultLocale,
  feedPath?: string
) {
  const siteUrl = origin.replace(/\/$/, '');
  const normalizedBasePath = `/${basePath}`.replace(/\/+/g, '/').replace(/\/?$/, '/');
  const channelUrl = `${siteUrl}${normalizedBasePath}`;
  const normalizedFeedPath = feedPath
    ? `/${feedPath}`.replace(/\/+/g, '/')
    : `${normalizedBasePath}rss.xml`;
  const feedUrl = `${siteUrl}${normalizedFeedPath}`;
  const lastBuildDate = posts[0]?.data.pubDate?.toUTCString();

  const items = posts
    .map((entry) => {
      const url = `${siteUrl}${localizedEntryPath('posts', entry as any)}`;
      const date = entry.data.pubDate.toUTCString();
      return [
        '<item>',
        `<title>${escapeXml(entry.data.title)}</title>`,
        `<link>${escapeXml(url)}</link>`,
        `<guid>${escapeXml(url)}</guid>`,
        `<pubDate>${escapeXml(date)}</pubDate>`,
        `<dc:creator>${escapeXml(entry.data.author || siteConfig.person.name)}</dc:creator>`,
        `<description>${escapeXml(entry.data.description || '')}</description>`,
        '</item>'
      ].join('');
    })
    .join('');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">',
    '<channel>',
    `<title>${escapeXml(siteConfig.name)}</title>`,
    `<link>${escapeXml(channelUrl)}</link>`,
    `<description>${escapeXml(siteConfig.description[locale])}</description>`,
    `<language>${escapeXml(localeMeta[locale].htmlLang)}</language>`,
    `<atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml"/>`,
    lastBuildDate ? `<lastBuildDate>${escapeXml(lastBuildDate)}</lastBuildDate>` : '',
    items,
    '</channel>',
    '</rss>'
  ].join('');
}
