import type { Locale } from './i18n';

export const siteConfig = {
  name: 'RookieOps',
  shortName: 'RookieOps',
  description: 'Infraestrutura, cloud, identidade, segurança e automação na prática.',
  url: 'https://rookieops.dev',
  author: {
    name: 'RookieOps',
    url: 'https://tkusal.com.br',
    title: {
      'pt-br': 'Operações de TI sem atalhos mágicos'
    },
    description: {
      'pt-br': 'Notas e guias sobre infraestrutura, identidade, Microsoft 365, Azure, segurança e automação.'
    },
    avatar: '/favicon.svg',
    social: [
      { name: 'GitHub', url: 'https://github.com/tkusal', icon: 'simple-icons:github' },
      { name: 'LinkedIn', url: 'https://www.linkedin.com/in/tkusal/', icon: 'simple-icons:linkedin' }
    ]
  },
  contentWidth: '56rem',
  ui: {
    navbar: {
      sticky: true
    },
    dock: {
      enabled: true
    }
  },
  nav: [
    'posts',
    'archives',
    {
      label: { 'pt-br': 'Sobre o autor' },
      href: 'https://tkusal.com.br',
      icon: 'lucide:user-round'
    }
  ],
  footerNav: [
    'archives',
    {
      label: { 'pt-br': 'Licença do conteúdo' },
      href: '/licenca/',
      icon: 'lucide:copyright'
    }
  ],
  comments: {
    enabled: false,
    provider: 'giscus',
    giscus: {
      repo: '',
      repoId: '',
      category: '',
      categoryId: '',
      mapping: 'pathname',
      strict: '0',
      reactionsEnabled: '1',
      emitMetadata: '0',
      inputPosition: 'bottom',
      theme: 'preferred_color_scheme'
    }
  },
  analytics: {
    enabled: false,
    provider: 'umami',
    umami: {
      src: '',
      websiteId: '',
      domains: ''
    }
  },
  gallery: {
    enabled: true,
    defaultLayout: 'justified',
    gap: 10,
    targetRowHeight: 220,
    lastRowBehavior: 'center',
    columnWidth: 220,
    columns: 'auto'
  },
  lightbox: {
    enabled: true
  },
  post: {
    relatedCount: 3,
    license: {
      enabled: true,
      name: 'Conteúdo autoral do RookieOps',
      url: '/licenca/',
      description: 'A republicação é permitida somente com crédito visível ao RookieOps e link para o artigo original.'
    }
  }
} satisfies {
  name: string;
  shortName: string;
  description: string;
  url: string;
  author: {
    name: string;
    url: string;
    title: Record<Locale, string>;
    description: Record<Locale, string>;
    avatar: string;
    social: Array<{ name: string; url: string; icon: string }>;
  };
  contentWidth: `${number}rem`;
  ui: {
    navbar: {
      sticky: boolean;
    };
    dock: {
      enabled: boolean;
    };
  };
  nav: Array<string | { label: Record<Locale, string>; href: string; icon: string }>;
  footerNav: Array<string | { label: Record<Locale, string>; href: string; icon: string }>;
  comments: Record<string, any>;
  analytics: Record<string, any>;
  gallery: Record<string, any>;
  lightbox: Record<string, any>;
  post: Record<string, any>;
};
