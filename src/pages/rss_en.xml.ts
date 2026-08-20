import { getLocalizedEntries } from '../lib/content/entries';
import { renderRss } from '../lib/content/rss';

export async function GET({ site, url }: { site?: URL; url: URL }) {
  const posts = await getLocalizedEntries('posts', 'en');
  const origin = site?.origin || url.origin;

  return new Response(renderRss(posts, origin, '/en/', 'en', '/rss_en.xml'), {
    headers: {
      'content-type': 'application/rss+xml; charset=utf-8'
    }
  });
}
