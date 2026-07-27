import type { Locale } from './i18n';

export const siteConfig = {
  name: 'RookieOps',
  shortName: 'RookieOps',
  seoTitle: 'RookieOps - Infraestrutura, Cloud e DevOps',
  description: 'Guias práticos sobre servidores Windows e Linux, Azure, AWS, DevOps e automação com Terraform, Ansible, containers e scripting.',
  url: 'https://rookieops.dev',
  organization: {
    name: 'RookieOps',
    url: 'https://rookieops.dev'
  },
  person: {
    name: 'Thiago Kusal',
    url: 'https://tkusal.com.br',
    social: [
      { name: 'GitHub', url: 'https://github.com/tkusal' },
      { name: 'LinkedIn', url: 'https://www.linkedin.com/in/tkusal/' }
    ]
  },
  author: {
    name: 'RookieOps',
    url: 'https://tkusal.com.br',
    title: {
      'pt-br': 'Deployando conhecimento. Debugando o caos.'
    },
    tagline: {
      'pt-br': 'De rookie a ops, um café por vez.'
    },
    description: {
      'pt-br': 'Conteúdo técnico sem enrolação. Tutoriais, scripts, notícias e guias sobre infraestrutura, cloud e soluções DevOps. Tudo o que você precisa!'
    },
    mobileDescription: {
      'pt-br': 'Guias práticos sobre Windows, Linux, Azure, AWS, DevOps e automação.'
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
    enabled: true,
    provider: 'google-analytics',
    googleAnalytics: {
      measurementId: 'G-1KVZDWFPF3'
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
      name: 'Conteúdo dos respectivos autores',
      url: '/licenca/',
      description: 'A republicação exige crédito à pessoa autora e ao RookieOps, além de um link para o artigo original.'
    }
  }
} satisfies {
  name: string;
  shortName: string;
  seoTitle: string;
  description: string;
  url: string;
  organization: {
    name: string;
    url: string;
  };
  person: {
    name: string;
    url: string;
    social: Array<{ name: string; url: string }>;
  };
  author: {
    name: string;
    url: string;
    title: Record<Locale, string>;
    tagline: Record<Locale, string>;
    description: Record<Locale, string>;
    mobileDescription: Record<Locale, string>;
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
