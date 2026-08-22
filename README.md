# RookieOps

Blog técnico sobre infraestrutura, cloud, identidade, segurança e automação, publicado em [rookieops.dev](https://rookieops.dev).

O projeto usa [Astro Narrow](https://github.com/tom2almighty/astro-narrow), Astro 7.2.4, Tailwind CSS 4, tsParticles e geração estática para Cloudflare Workers.

## Requisitos

- Node.js 22.12 ou superior
- pnpm 10.11.1

O arquivo `.node-version` registra a versão recomendada do Node.js para desenvolvimento.

## Desenvolvimento local

```powershell
pnpm install
pnpm dev
```

O Astro informa o endereço local no terminal, normalmente `http://localhost:4321`.

O projeto conta com formatação (Prettier) e validação de código (ESLint) rigorosas. Antes de submeter código, formate e verifique erros com:

```powershell
pnpm format
pnpm lint
```

Para validar a versão de produção (checagem de tipos TypeScript e build final):

```powershell
pnpm validate
pnpm preview
```

O build estático é criado em `dist/`.

O Astro 7.2 permite executar o preview em segundo plano. Esse modo é útil para automações e agentes de desenvolvimento:

```powershell
pnpm preview:background
pnpm preview:status
pnpm preview:logs
pnpm preview:stop
```

O estado e os logs desse processo ficam sob `.astro/`, que não deve ser versionado.

## Contribuições

Contribuições de código, documentação e artigos são bem-vindas. Antes de começar:

- leia o [guia de contribuição](CONTRIBUTING.md), que descreve o padrão editorial, a atribuição de autoria e o fluxo de pull request;
- siga o [Código de Conduta](CODE_OF_CONDUCT.md);
- para mudanças grandes, abra uma issue antes de investir na implementação.

## Artigos

Os artigos ficam em `src/content/posts/pt-br/`. Exemplo de frontmatter:

```yaml
---
title: 'Título claro e específico do artigo'
description: 'Resumo exclusivo usado nos resultados de busca, listagens e RSS.'
pubDate: 2026-07-25
author: 'Nome da pessoa autora'
authorUrl: 'https://github.com/usuario'
lang: pt-br
categories: ['Categoria']
tags: ['Tag']
draft: false
---
```

- Use `draft: true` para excluir um artigo das páginas públicas, da busca, do sitemap e do RSS.
- O campo `author` exibe o crédito no artigo e nos metadados; `authorUrl` é opcional.
- Atualize `updatedDate` somente quando houver uma mudança editorial relevante.
- Prefira uma única categoria principal e tags específicas.
- Use títulos descritivos, uma descrição exclusiva e uma hierarquia de subtítulos clara.
- Se usar `cover`, informe também `coverAlt` e armazene a imagem em `public/images/posts/<slug>/`.

Consulte [CONTRIBUTING.md](CONTRIBUTING.md) para ver o frontmatter completo, a estrutura recomendada do texto e a lista de verificações antes do pull request.

## Licenças

- O código-fonte e o layout derivado do Astro Narrow são distribuídos sob a [GNU General Public License v3.0](LICENSE).
- Cada pessoa autora mantém os direitos sobre seu conteúdo editorial e autoriza sua publicação no RookieOps conforme a [licença do conteúdo](CONTENT-LICENSE.md).
- Dependências, marcas e materiais de terceiros continuam sujeitos às licenças de seus respectivos titulares.
