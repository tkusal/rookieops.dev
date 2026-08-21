import type { Locale } from './i18n';

export type ContentCollection = 'posts' | 'projects' | 'pages';
export type EntryCardStyle = 'article' | 'showcase' | 'compact';
export type EntryListLayout = 'stack' | 'grid';
export type EntryGridColumns = 1 | 2 | 3;
export type HomeSectionConfig = {
  enabled: boolean;
  limit: number;
  featuredOnly?: boolean;
  title: Record<Locale, string>;
};

export const contentTypes = {
  posts: {
    collection: 'posts',
    path: '/posts/',
    icon: 'lucide:file-text',
    label: {
      'pt-br': 'Artigos',
      en: 'Posts'
    },
    showMeta: true,
    cardStyle: 'article',
    listLayout: 'stack',
    gridColumns: 1,
    home: {
      enabled: true,
      limit: 5,
      title: {
        'pt-br': 'Artigos recentes',
        en: 'Recent posts'
      }
    }
  },
  projects: {
    collection: 'projects',
    path: '/projects/',
    icon: 'lucide:layers',
    label: {
      'pt-br': 'Projetos',
      en: 'Projects'
    },
    showMeta: true,
    cardStyle: 'showcase',
    listLayout: 'grid',
    gridColumns: 3,
    home: {
      enabled: false,
      limit: 3,
      featuredOnly: true,
      title: {
        'pt-br': 'Projetos em destaque',
        en: 'Featured projects'
      }
    }
  }
} satisfies Record<
  string,
  {
    collection: ContentCollection;
    path: string;
    icon: string;
    label: Record<Locale, string>;
    showMeta: boolean;
    cardStyle: EntryCardStyle;
    listLayout: EntryListLayout;
    gridColumns: EntryGridColumns;
    home?: HomeSectionConfig;
  }
>;

export type ContentTypeId = keyof typeof contentTypes;
