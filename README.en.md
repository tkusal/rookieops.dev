<div align="center">

<img src="https://rookieops.dev/favicon.svg" alt="RookieOps" width="110">

# RookieOps

**Infrastructure, Cloud, Identity, Security, DevOps, and Automation made easier.**

Source code and content for [rookieops.dev](https://rookieops.dev).

[![Website](https://img.shields.io/badge/Website-rookieops.dev-0A0A0A?logo=googlechrome\&logoColor=white)](https://rookieops.dev)
[![Astro](https://img.shields.io/badge/Astro-7.2.4-BC52EE?logo=astro\&logoColor=white)](https://astro.build/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?logo=typescript\&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss\&logoColor=white)](https://tailwindcss.com/)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare\&logoColor=white)](https://workers.cloudflare.com/)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)

[Português (Brasil)](README.md) · **English**

</div>

---

## About RookieOps

**RookieOps** is a technical blog created to share practical and accessible knowledge based on real-world infrastructure, cloud, and operations experience.

The content primarily covers:

* Microsoft Azure
* Microsoft Entra ID and Identity & Access Management
* Microsoft 365
* Active Directory and Windows Server
* Networking and infrastructure
* Information security
* DevOps
* Terraform and Infrastructure as Code
* PowerShell and automation
* Containers and Kubernetes
* Tools, best practices, and real-world IT experiences

The goal is to make complex technical subjects easier to understand while providing useful content for both newcomers and experienced IT professionals.

> Visit the blog at [rookieops.dev](https://rookieops.dev).

## Technologies

RookieOps is primarily built with:

| Technology                                                      | Purpose                              |
| --------------------------------------------------------------- | ------------------------------------ |
| [Astro](https://astro.build/)                                   | Framework and static site generation |
| [TypeScript](https://www.typescriptlang.org/)                   | Development                          |
| [Tailwind CSS](https://tailwindcss.com/)                        | Styling                              |
| [tsParticles](https://particles.js.org/)                        | Visual elements                      |
| [Cloudflare Workers](https://workers.cloudflare.com/)           | Hosting and deployment               |
| [Wrangler](https://developers.cloudflare.com/workers/wrangler/) | Cloudflare deployment                |
| [pnpm](https://pnpm.io/)                                        | Package management                   |
| [ESLint](https://eslint.org/)                                   | Static analysis                      |
| [Prettier](https://prettier.io/)                                | Code formatting                      |

The project layout is based on the open-source [Astro Narrow](https://github.com/tom2almighty/astro-narrow) theme and has been adapted to the needs and visual identity of RookieOps.

## Requirements

To run the project locally, you will need:

* **Node.js 22.12 or later**
* **pnpm 10.11.1**

The `.node-version` file records the recommended Node.js version for development.

## Getting started

### 1. Clone the repository

```bash
git clone https://github.com/tkusal/rookieops.dev.git
cd rookieops.dev
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Start the development server

```bash
pnpm dev
```

Astro will display the local development URL in the terminal, usually:

```text
http://localhost:4321
```

## Available scripts

| Command                   | Description                            |
| ------------------------- | -------------------------------------- |
| `pnpm dev`                | Starts the development server          |
| `pnpm check`              | Runs Astro and TypeScript checks       |
| `pnpm build`              | Generates the production build         |
| `pnpm validate`           | Runs `astro check` and `astro build`   |
| `pnpm preview`            | Runs the production build locally      |
| `pnpm format`             | Formats the project with Prettier      |
| `pnpm lint`               | Runs ESLint                            |
| `pnpm deploy`             | Deploys the project using Wrangler     |
| `pnpm preview:background` | Starts preview mode in the background  |
| `pnpm preview:status`     | Displays the background preview status |
| `pnpm preview:logs`       | Displays background preview logs       |
| `pnpm preview:stop`       | Stops the background preview process   |

## Validation and code quality

Before submitting changes, format the code and run the linter:

```bash
pnpm format
pnpm lint
```

For a complete project validation:

```bash
pnpm validate
```

This command runs:

```text
astro check
astro build
```

The static production build is generated under:

```text
dist/
```

### Previewing the build

To test the production build locally:

```bash
pnpm preview
```

Astro can also run the preview process in the background, which is useful for testing, automation, and development agents:

```bash
pnpm preview:background
pnpm preview:status
pnpm preview:logs
pnpm preview:stop
```

The process state and logs are stored under `.astro/`, which should not be committed.

## Content structure

Articles are organized by language:

```text
src/content/posts/
├── en/
└── pt-br/
```

Use:

```text
src/content/posts/en/
```

for English articles and:

```text
src/content/posts/pt-br/
```

for Brazilian Portuguese articles.

## Creating an article

Basic frontmatter example for an English article:

```yaml
---
title: 'A clear and specific article title'
description: 'A unique summary used in search results, listings, and RSS.'
pubDate: 2026-07-25
author: 'Author name'
authorUrl: 'https://github.com/username'
lang: en
categories: ['Category']
tags: ['Tag']
draft: false
---
```

For Brazilian Portuguese articles, use:

```yaml
lang: pt-br
```

and store the file under:

```text
src/content/posts/pt-br/
```

## Editorial guidelines

When creating or editing articles:

* use `draft: true` to prevent an article from being published;
* use clear and specific titles;
* provide a unique description for each publication;
* maintain a consistent heading hierarchy;
* prefer a single primary category;
* use tags directly related to the article;
* update `updatedDate` only when a meaningful editorial change is made;
* use `author` to define article attribution;
* use `authorUrl` when you want to provide a link to the author;
* always provide `coverAlt` when using a cover image.

Article-related images should preferably be stored under:

```text
public/images/posts/<slug>/
```

See the [contribution guide](CONTRIBUTING.md) for the complete frontmatter reference, editorial standards, and the recommended checklist before opening a pull request.

## Contributing

Contributions are welcome.

You can contribute with:

* bug fixes;
* code improvements;
* interface improvements;
* documentation;
* new articles;
* content corrections or updates;
* translations;
* accessibility improvements;
* performance optimizations.

Before contributing:

1. Read [CONTRIBUTING.md](CONTRIBUTING.md).
2. Read and follow the [Code of Conduct](CODE_OF_CONDUCT.md).
3. For significant changes, open an issue before starting the implementation.
4. Create a branch for your changes.
5. Run the local checks.
6. Open a pull request clearly describing your changes.

Before opening a pull request, run:

```bash
pnpm format
pnpm lint
pnpm validate
```

## Deployment

RookieOps uses static site generation and is deployed on Cloudflare.

After validating the project:

```bash
pnpm validate
```

deploy it with:

```bash
pnpm deploy
```

Wrangler publishes the generated content from:

```text
dist/
```

Deployment settings are defined in:

```text
wrangler.jsonc
```

## Licenses

RookieOps separates the source code license from the rights associated with editorial content.

### Source code

The source code and layout derived from Astro Narrow are distributed under the [GNU General Public License v3.0](LICENSE).

### Editorial content

Each author retains the rights to their editorial content and authorizes its publication on RookieOps according to [CONTENT-LICENSE.md](CONTENT-LICENSE.md).

Dependencies, trademarks, logos, images, and other third-party materials remain subject to the licenses and rights of their respective owners.

## Credits

RookieOps uses the open-source [Astro Narrow](https://github.com/tom2almighty/astro-narrow) project as its foundation.

Thanks to the developers, authors, and contributors behind the open-source projects used to build the website.

---

<div align="center">

**[rookieops.dev](https://rookieops.dev)**

Infrastructure · Cloud · Identity · Security · DevOps · Automation

[Back to top](#rookieops)

</div>
