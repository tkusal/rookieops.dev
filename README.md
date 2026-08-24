<div align="center">

<img src="https://rookieops.dev/favicon.svg" alt="RookieOps" width="110">

# RookieOps

**Infraestrutura, Cloud, Identidade, Segurança, DevOps e Automação sem complicação.**

Código-fonte e conteúdo do [rookieops.dev](https://rookieops.dev).

[![Website](https://img.shields.io/badge/Website-rookieops.dev-0A0A0A?logo=googlechrome\&logoColor=white)](https://rookieops.dev)
[![Astro](https://img.shields.io/badge/Astro-7.2.4-BC52EE?logo=astro\&logoColor=white)](https://astro.build/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?logo=typescript\&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss\&logoColor=white)](https://tailwindcss.com/)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare\&logoColor=white)](https://workers.cloudflare.com/)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)

**Português (Brasil)** · [English](README.en.md)

</div>

---

## Sobre o RookieOps

O **RookieOps** é um blog técnico criado para compartilhar conhecimento de forma prática, acessível e baseada em experiências reais com infraestrutura, cloud e operações.

O conteúdo aborda principalmente:

* Microsoft Azure
* Microsoft Entra ID e Identity & Access Management
* Microsoft 365
* Active Directory e Windows Server
* Redes e infraestrutura
* Segurança da informação
* DevOps
* Terraform e Infrastructure as Code
* PowerShell e automação
* Containers e Kubernetes
* Ferramentas, boas práticas e experiências do dia a dia em TI

A proposta é transformar assuntos técnicos complexos em conteúdos úteis tanto para quem está começando quanto para profissionais que querem aprofundar seus conhecimentos.

> Acesse o blog em [rookieops.dev](https://rookieops.dev).

## Tecnologias

O RookieOps é construído principalmente com:

| Tecnologia                                                      | Uso                          |
| --------------------------------------------------------------- | ---------------------------- |
| [Astro](https://astro.build/)                                   | Framework e geração estática |
| [TypeScript](https://www.typescriptlang.org/)                   | Desenvolvimento              |
| [Tailwind CSS](https://tailwindcss.com/)                        | Estilização                  |
| [tsParticles](https://particles.js.org/)                        | Elementos visuais            |
| [Cloudflare Workers](https://workers.cloudflare.com/)           | Hospedagem e publicação      |
| [Wrangler](https://developers.cloudflare.com/workers/wrangler/) | Deploy na Cloudflare         |
| [pnpm](https://pnpm.io/)                                        | Gerenciamento de pacotes     |
| [ESLint](https://eslint.org/)                                   | Análise estática             |
| [Prettier](https://prettier.io/)                                | Formatação de código         |

O layout do projeto é baseado no tema open source [Astro Narrow](https://github.com/tom2almighty/astro-narrow), adaptado para as necessidades e identidade do RookieOps.

## Requisitos

Para executar o projeto localmente, você precisará de:

* **Node.js 22.12 ou superior**
* **pnpm 10.11.1**

O arquivo `.node-version` registra a versão recomendada do Node.js para desenvolvimento.

## Começando

### 1. Clone o repositório

```bash
git clone https://github.com/tkusal/rookieops.dev.git
cd rookieops.dev
```

### 2. Instale as dependências

```bash
pnpm install
```

### 3. Inicie o ambiente de desenvolvimento

```bash
pnpm dev
```

O Astro exibirá o endereço do servidor local no terminal, normalmente:

```text
http://localhost:4321
```

## Scripts disponíveis

| Comando                   | Descrição                                     |
| ------------------------- | --------------------------------------------- |
| `pnpm dev`                | Inicia o servidor de desenvolvimento          |
| `pnpm check`              | Executa as verificações do Astro e TypeScript |
| `pnpm build`              | Gera o build de produção                      |
| `pnpm validate`           | Executa `astro check` e `astro build`         |
| `pnpm preview`            | Executa localmente o build de produção        |
| `pnpm format`             | Formata o projeto com Prettier                |
| `pnpm lint`               | Executa o ESLint                              |
| `pnpm deploy`             | Publica o projeto utilizando Wrangler         |
| `pnpm preview:background` | Executa o preview em segundo plano            |
| `pnpm preview:status`     | Exibe o status do preview em segundo plano    |
| `pnpm preview:logs`       | Exibe os logs do preview em segundo plano     |
| `pnpm preview:stop`       | Encerra o preview em segundo plano            |

## Validação e qualidade de código

Antes de enviar alterações, formate o código e execute o lint:

```bash
pnpm format
pnpm lint
```

Para executar a validação completa:

```bash
pnpm validate
```

Esse comando executa:

```text
astro check
astro build
```

O build estático de produção é criado em:

```text
dist/
```

### Preview do build

Para testar localmente a versão de produção:

```bash
pnpm preview
```

O Astro também permite executar o preview em segundo plano, algo útil para testes, automações e agentes de desenvolvimento:

```bash
pnpm preview:background
pnpm preview:status
pnpm preview:logs
pnpm preview:stop
```

O estado e os logs relacionados a esse processo ficam armazenados em `.astro/`, que não deve ser versionado.

## Estrutura do conteúdo

Os artigos são organizados por idioma:

```text
src/content/posts/
├── en/
└── pt-br/
```

Use:

```text
src/content/posts/pt-br/
```

para artigos em português brasileiro e:

```text
src/content/posts/en/
```

para artigos em inglês.

## Criando um artigo

Exemplo básico de frontmatter para um artigo em português:

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

Para artigos em inglês:

```yaml
lang: en
```

e armazene o arquivo em:

```text
src/content/posts/en/
```

## Diretrizes editoriais

Ao criar ou editar artigos:

* use `draft: true` para impedir a publicação de um artigo;
* utilize títulos claros e específicos;
* escreva uma descrição exclusiva para cada publicação;
* mantenha uma hierarquia consistente de títulos e subtítulos;
* prefira uma única categoria principal;
* utilize tags diretamente relacionadas ao conteúdo;
* atualize `updatedDate` somente quando houver uma alteração editorial relevante;
* utilize `author` para definir a autoria;
* utilize `authorUrl` quando desejar adicionar um link para o autor;
* sempre forneça `coverAlt` quando utilizar uma imagem de capa.

As imagens relacionadas aos artigos devem ser armazenadas preferencialmente em:

```text
public/images/posts/<slug>/
```

Consulte o [guia de contribuição](CONTRIBUTING.md) para conhecer o frontmatter completo, os padrões editoriais e a lista de verificações recomendadas antes de abrir um pull request.

## Contribuindo

Contribuições são bem-vindas.

Você pode contribuir com:

* correções de bugs;
* melhorias no código;
* melhorias de interface;
* documentação;
* novos artigos;
* correções ou atualizações de conteúdo;
* traduções;
* melhorias de acessibilidade;
* otimizações de desempenho.

Antes de contribuir:

1. Leia o [CONTRIBUTING.md](CONTRIBUTING.md).
2. Leia e siga o [Código de Conduta](CODE_OF_CONDUCT.md).
3. Para alterações significativas, abra uma issue antes de iniciar a implementação.
4. Crie uma branch para sua alteração.
5. Execute as verificações locais.
6. Abra um pull request descrevendo claramente a mudança.

Antes do pull request, execute:

```bash
pnpm format
pnpm lint
pnpm validate
```

## Deploy

O RookieOps utiliza geração estática e é publicado na Cloudflare.

Depois de validar o projeto:

```bash
pnpm validate
```

o deploy pode ser executado com:

```bash
pnpm deploy
```

O Wrangler publica o conteúdo gerado em:

```text
dist/
```

A configuração de publicação está definida em:

```text
wrangler.jsonc
```

## Licenças

O RookieOps diferencia a licença do código-fonte dos direitos relacionados ao conteúdo editorial.

### Código-fonte

O código-fonte e o layout derivado do Astro Narrow são distribuídos sob a [GNU General Public License v3.0](LICENSE).

### Conteúdo editorial

Cada pessoa autora mantém os direitos sobre seu conteúdo e autoriza sua publicação no RookieOps conforme estabelecido em [CONTENT-LICENSE.md](CONTENT-LICENSE.md).

Dependências, marcas, logotipos, imagens e outros materiais de terceiros continuam sujeitos às licenças e direitos de seus respectivos titulares.

## Créditos

O RookieOps utiliza como base o projeto open source [Astro Narrow](https://github.com/tom2almighty/astro-narrow).

Agradecimentos aos desenvolvedores, autores e colaboradores dos projetos open source utilizados na construção do site.

---

<div align="center">

**[rookieops.dev](https://rookieops.dev)**

Infrastructure · Cloud · Identity · Security · DevOps · Automation

[Voltar ao topo](#rookieops)

</div>
