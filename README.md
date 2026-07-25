# RookieOps

Blog técnico sobre infraestrutura, cloud, identidade, segurança e automação, publicado em [rookieops.dev](https://rookieops.dev).

O projeto usa [Astro Narrow](https://github.com/tom2almighty/astro-narrow), Astro 7, Tailwind CSS 4 e geração estática para Cloudflare Workers.

## Requisitos

- Node.js 22.12 ou superior
- pnpm 10.11.1

## Desenvolvimento local

```powershell
pnpm install
pnpm dev
```

O Astro informa o endereço local no terminal, normalmente `http://localhost:4321`.

Para validar a versão de produção:

```powershell
pnpm check
pnpm build
pnpm preview
```

O build estático é criado em `dist/`.

## Publicação de artigos

Os artigos ficam em `src/content/posts/pt-br/`. Exemplo de frontmatter:

```yaml
---
title: "Título claro e específico do artigo"
description: "Resumo exclusivo usado nos resultados de busca, listagens e RSS."
pubDate: 2026-07-25
updatedDate: 2026-07-25
lang: pt-br
categories: ["Categoria"]
tags: ["Tag"]
cover: "/images/nome-da-imagem.png"
coverAlt: "Descrição objetiva do que aparece na imagem"
draft: false
---
```

- Use `draft: true` para excluir um artigo das páginas públicas, da busca, do sitemap e do RSS.
- Atualize `updatedDate` somente quando houver uma mudança editorial relevante.
- Prefira uma única categoria principal e tags específicas.
- Use títulos descritivos, uma descrição exclusiva e uma hierarquia de subtítulos clara.
- Otimize imagens antes de adicioná-las e escreva textos alternativos que descrevam seu conteúdo.

## SEO e descoberta

O site gera automaticamente:

- URL canônica e metadados `robots`;
- Open Graph e Twitter Cards;
- dados estruturados JSON-LD para `WebSite`, `WebPage`, `BlogPosting` e a marca RookieOps;
- datas de publicação e atualização dos artigos;
- sitemap XML com `lastmod` para páginas editoriais;
- `robots.txt` apontando para o sitemap;
- RSS em `https://rookieops.dev/rss.xml`;
- índice local de busca em `/api/search.json`.

Depois da publicação, cadastre o domínio no Google Search Console e no Bing Webmaster Tools e envie:

```text
https://rookieops.dev/sitemap.xml
```

O feed RSS contém `title`, `link`, `guid`, `pubDate` e `description`, incluindo os campos usados pelo atualizador do `tkusal.com.br`.

## Cloudflare Workers

Configuração do projeto no painel:

- nome: `rookieops-dev`
- branch de produção: `main`
- comando de build: `pnpm build`
- comando de implantação: `npx wrangler deploy`
- diretório raiz: `/`

O `wrangler.jsonc` publica `dist/` como arquivos estáticos. Não é necessário instalar o adaptador `@astrojs/cloudflare`.

Depois da primeira implantação, associe manualmente o domínio `rookieops.dev` em **Settings → Domains & Routes**. Garanta também que apenas uma versão do domínio seja canônica e que qualquer variante redirecione permanentemente para `https://rookieops.dev`.

## Licenças

- O código-fonte e o layout derivado do Astro Narrow permanecem sob a [GNU General Public License v3.0](LICENSE).
- O conteúdo editorial é autoral do RookieOps e pode ser republicado somente com os devidos créditos e um link para o artigo original. Consulte [CONTENT-LICENSE.md](CONTENT-LICENSE.md).
