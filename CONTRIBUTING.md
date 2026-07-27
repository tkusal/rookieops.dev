# Como contribuir com o RookieOps

Obrigado pelo interesse em melhorar o RookieOps. São bem-vindas correções, melhorias no código e, especialmente, propostas de artigos técnicos.

Ao participar, você concorda em seguir o [Código de Conduta](CODE_OF_CONDUCT.md).

## Antes de começar

- Procure nas issues e nos artigos existentes para evitar trabalho duplicado.
- Abra uma issue para propor séries, artigos extensos ou mudanças estruturais.
- Correções pequenas de texto, links e exemplos podem ser enviadas diretamente.
- Não publique credenciais, tokens, nomes de clientes, endereços internos, dados pessoais ou qualquer informação confidencial.

## Preparar o ambiente

Faça um fork de `tkusal/rookieops.dev` no GitHub e clone o seu fork:

```powershell
git clone https://github.com/SEU-USUARIO/rookieops.dev.git
Set-Location rookieops.dev
git remote add upstream https://github.com/tkusal/rookieops.dev.git
pnpm install
```

Crie uma branch curta e descritiva a partir da `main` atualizada:

```powershell
git fetch upstream
git switch main
git merge --ff-only upstream/main
git switch -c artigo/nome-do-artigo
```

Use prefixos como `artigo/`, `docs/`, `fix/` ou `feature/`.

## Criar um artigo

Crie um arquivo Markdown ou MDX em:

```text
src/content/posts/pt-br/nome-do-artigo.md
```

Use letras minúsculas, números e hífens no nome do arquivo. Esse nome será usado na URL, por exemplo: `/posts/nome-do-artigo/`.

### Frontmatter

Comece o arquivo com:

```yaml
---
title: "Título claro e específico"
description: "Resumo exclusivo, entre 50 e 160 caracteres, que explique o resultado entregue pelo artigo."
pubDate: 2026-07-26
author: "Seu Nome"
authorUrl: "https://github.com/seu-usuario"
lang: pt-br
categories: ["Cloud"]
tags: ["Astro", "Cloudflare"]
cover: "/images/posts/nome-do-artigo/capa.webp"
coverAlt: "Descrição objetiva da imagem de capa"
toc: true
comments: false
draft: true
---
```

Regras dos campos:

- `title`, `description`, `pubDate` e `author` são obrigatórios. Mantenha também `lang: pt-br` explícito para facilitar a revisão.
- `authorUrl` é opcional. Use um perfil profissional ou site que você queira associar publicamente ao texto.
- `categories` deve ter, de preferência, uma categoria principal.
- `tags` deve conter termos específicos e já usados no blog quando forem equivalentes.
- `cover` e `coverAlt` são opcionais, mas devem ser usados juntos.
- `updatedDate` deve ser omitido em artigos novos e alterado apenas em revisões editoriais relevantes.
- `draft: true` mantém o artigo fora das páginas públicas, da busca, do sitemap e do RSS. Troque para `false` quando ele estiver pronto para publicação.

### Como o crédito de autoria funciona

O valor de `author` aparece no cabeçalho do artigo, na metatag de autor, nos dados estruturados e no feed RSS. Quando `authorUrl` for informado, o nome também será um link para esse endereço.

Esse crédito editorial é independente da autoria dos commits. Para que o GitHub também associe os commits à sua conta, configure neste repositório um nome e um e-mail verificado na sua conta do GitHub — ou o endereço `noreply` fornecido pelo GitHub:

```powershell
git config user.name "Seu Nome"
git config user.email "seu-email-verificado-ou-noreply"
```

Confirme antes de criar o commit:

```powershell
git config user.name
git config user.email
```

Não adicione outra pessoa no campo `author` sem a autorização dela. Em um artigo escrito em conjunto, escolha o nome editorial acordado entre as pessoas autoras e registre os demais créditos no início ou no fim do texto. Commits produzidos em conjunto podem usar trailers `Co-authored-by`.

## Padrão editorial

Escreva em português do Brasil, com linguagem direta e tecnicamente verificável. Sempre que fizer sentido, organize o artigo nesta sequência:

1. contexto e problema;
2. resultado esperado;
3. pré-requisitos, versões e ambiente testado;
4. implementação passo a passo;
5. validação do resultado;
6. riscos, segurança, impacto e forma de reversão;
7. referências primárias;
8. conclusão.

Além disso:

- explique o motivo das decisões, não apenas os comandos;
- use títulos em ordem hierárquica, começando por `##` no corpo do artigo;
- identifique valores que o leitor deve substituir, como `<TENANT_ID>`;
- prefira documentação oficial e fontes primárias;
- indique quando algo é opinião, hipótese ou resultado específico de um laboratório;
- não copie textos, imagens ou código sem permissão e atribuição compatível;
- use blocos de código com a linguagem correta e exemplos mínimos reproduzíveis;
- revise ortografia, links, acessibilidade e precisão técnica.

### Imagens e outros arquivos

Coloque os arquivos de um artigo em `public/images/posts/nome-do-artigo/` e use caminhos absolutos iniciados por `/images/` no Markdown. Prefira WebP, AVIF ou SVG quando forem adequados, remova metadados sensíveis e otimize o tamanho antes do commit.

Toda imagem informativa deve ter texto alternativo útil. Imagens meramente decorativas devem usar texto alternativo vazio.

## Validar a contribuição

Execute:

```powershell
pnpm check
pnpm build
pnpm preview
```

Revise localmente:

- título, descrição, autoria, datas, categoria e tags;
- sumário e hierarquia de títulos;
- comandos e blocos de código;
- imagens, textos alternativos e links;
- layout em tela estreita e larga;
- ausência de segredos e dados pessoais no diff.

Antes do commit, confira somente os arquivos que pretende enviar:

```powershell
git status
git diff
```

## Enviar o pull request

Adicione apenas os arquivos relacionados à contribuição e crie um commit objetivo:

```powershell
git add src/content/posts/pt-br/nome-do-artigo.md
git commit -m "content: adiciona artigo sobre nome do tema"
git push -u origin artigo/nome-do-artigo
```

No GitHub, abra um pull request do seu fork para a branch `main` de `tkusal/rookieops.dev`. No título e na descrição:

- resuma o tema e o público do artigo;
- explique como o conteúdo foi testado;
- indique issue relacionada, quando houver;
- liste limitações, riscos ou pontos que precisam de revisão;
- confirme que `pnpm check` e `pnpm build` foram executados;
- declare a origem e a licença de qualquer material de terceiros.

Mantenha um assunto principal por pull request. Responda aos comentários de revisão com novos commits na mesma branch; não é necessário abrir outro pull request.

## Direitos autorais e licença

Você deve enviar apenas material que criou ou que tem autorização para distribuir. A pessoa autora mantém os direitos autorais do artigo.

Ao enviar uma contribuição editorial, você autoriza o RookieOps, de forma não exclusiva e sem remuneração, a revisar, formatar, publicar, hospedar e distribuir o conteúdo como parte do site, preservando o crédito de autoria, nos termos de [CONTENT-LICENSE.md](CONTENT-LICENSE.md). Contribuições de código são distribuídas sob a [GNU General Public License v3.0](LICENSE).

O envio de um pull request não garante a publicação. A manutenção pode solicitar ajustes ou recusar conteúdo que esteja fora do escopo, não possa ser verificado ou não cumpra estas diretrizes.
