# Como contribuir com o RookieOps

Obrigado pelo interesse em melhorar o RookieOps. São bem-vindas correções, melhorias no código e, especialmente, propostas de artigos técnicos.

Ao participar, você concorda em seguir o [Código de Conduta](CODE_OF_CONDUCT.md).

## Caminho rápido para publicar um artigo

1. **Proponha:** consulte as [issues abertas](https://github.com/tkusal/rookieops.dev/issues) e, para séries, artigos extensos ou novos formatos, abra uma [issue de sugestão](https://github.com/tkusal/rookieops.dev/issues/new?template=sugestao.yml).
2. **Crie uma branch:** atualize a `main` a partir de `upstream` e crie uma branch `artigo/nome-do-artigo`.
3. **Copie o modelo:** crie o arquivo em `src/content/posts/pt-br/`, substitua todos os valores entre `<...>` e mantenha `draft: true`.
4. **Valide:** execute `pnpm validate`, depois revise o artigo com `pnpm preview`.
5. **Abra o pull request:** envie a branch ao seu fork e abra o PR para a `main` de `tkusal/rookieops.dev`, preenchendo o template apresentado pelo GitHub.

As seções seguintes explicam cada etapa e também se aplicam a correções de código e documentação.

## Antes de começar

- Procure nas [issues abertas](https://github.com/tkusal/rookieops.dev/issues) e nos artigos existentes para evitar trabalho duplicado.
- Abra uma [issue de sugestão](https://github.com/tkusal/rookieops.dev/issues/new?template=sugestao.yml) para propor séries, artigos extensos ou mudanças estruturais.
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

Crie o artigo em:

```text
src/content/posts/pt-br/nome-do-artigo.md
```

Use letras minúsculas, números e hífens no nome do arquivo. Esse nome será usado na URL, por exemplo: `/posts/nome-do-artigo/`.

Para uma versão em inglês, use `src/content/posts/en/nome-do-artigo.md`, defina `lang: en` e mantenha o mesmo nome de arquivo da versão em português. A URL será `/en/posts/nome-do-artigo/`, e o nome compartilhado permite que o seletor de idioma conecte as duas versões.

### Quando usar Markdown ou MDX

Use Markdown, com a extensão `.md`, por padrão. Ele atende artigos com texto, tabelas, links, imagens, alertas, fórmulas, diagramas Mermaid e blocos de código, além de manter o conteúdo simples de revisar.

MDX, com a extensão `.mdx`, deve ser reservado para conteúdo que realmente precise importar e renderizar componentes Astro ou JSX, passar propriedades a componentes ou avaliar expressões que o Markdown não representa. Não use MDX apenas para inserir HTML simples.

O projeto ainda não inclui a integração `@astrojs/mdx`. Se um artigo precisar de MDX, abra uma issue antes de escrevê-lo e explique qual componente ou comportamento é necessário. O formato só deve ser usado depois que a manutenção aprovar a proposta e habilitar a integração no projeto.

### Modelo completo de artigo

Copie o modelo abaixo. Substitua todos os valores entre `<...>`. Para um tutorial técnico, mantenha todas as seções, exceto "Sobre a autoria", que é opcional. Em artigos conceituais ou correções editoriais, uma seção pode ser adaptada ou removida, desde que o texto ainda apresente contexto, desenvolvimento, forma de verificar as afirmações, referências quando aplicáveis e conclusão.

```markdown
---
title: '<TÍTULO CLARO E ESPECÍFICO>'
description: '<RESUMO EXCLUSIVO ENTRE 50 E 160 CARACTERES>'
pubDate: <AAAA-MM-DD>
author: '<NOME PÚBLICO>'
authorUrl: '<URL PÚBLICA PRINCIPAL>'
lang: pt-br
categories: ['<CATEGORIA PRINCIPAL>']
# Use exatamente uma dificuldade: Iniciante, Intermediário ou Avançado.
tags: ['<TAG TEMÁTICA>', 'Iniciante']
# Remova as duas linhas abaixo se o artigo não tiver imagem de capa.
cover: '/images/posts/nome-do-artigo/capa.webp'
coverAlt: '<DESCRIÇÃO OBJETIVA DA IMAGEM DE CAPA>'
toc: true
comments: true
draft: true
---

Apresente o contexto, o problema e para quem o artigo foi escrito. Explique por que o tema importa e delimite o que será abordado.

## Resultado esperado

Descreva o resultado que a pessoa leitora poderá verificar ao final.

## Pré-requisitos e ambiente testado

Liste conhecimentos prévios, permissões, ferramentas, versões e o ambiente em que o conteúdo foi validado.

## Implementação

Explique o procedimento em etapas. Inclua o motivo das decisões e identifique claramente todos os valores que precisam ser substituídos.

## Validar o resultado

Mostre comandos, evidências ou critérios objetivos que confirmem que a implementação funcionou.

## Riscos, segurança e reversão

Descreva impactos, cuidados com dados e credenciais, custos possíveis e como desfazer a alteração com segurança. Informe explicitamente quando algum item não se aplicar.

## Referências

- [Documentação oficial ou fonte primária](https://exemplo.com/documentacao)

## Conclusão

Retome o resultado, as limitações e o próximo passo recomendado.

## Sobre a autoria

Se necessário, apresente as pessoas autoras e seus links públicos adicionais. Remova esta seção quando `authorUrl` for suficiente.
```

Regras dos campos:

- `title`, `description`, `pubDate` e `author` são obrigatórios. Mantenha `lang: pt-br` ou `lang: en` explícito e coerente com a pasta do artigo.
- `description` deve ter entre 50 e 160 caracteres.
- `pubDate` usa o formato `AAAA-MM-DD`. Ao preparar o artigo, informe a data de envio do pull request. Antes da publicação, a manutenção ajusta o campo para a data planejada, se necessário.
- `authorUrl` é opcional e aceita um único endereço. Use o site, portfólio ou perfil profissional que você queira associar publicamente ao texto. Remova o campo se não quiser publicar um link.
- `categories` deve conter exatamente uma categoria principal adequada ao assunto.
- `tags` deve conter pelo menos uma tag temática adequada e exatamente uma das três dificuldades permitidas.
- `cover` e `coverAlt` são opcionais, mas devem ser usados juntos.
- `updatedDate` deve ser omitido em artigos novos e alterado apenas em revisões editoriais relevantes.
- `comments: true` permite que os leitores discutam o artigo através da integração com o Giscus (GitHub Discussions). Pode ser alterado para `false` caso não queira comentários nesta postagem.
- Toda contribuição de artigo deve chegar ao pull request com `draft: true`. Esse valor mantém o artigo fora das páginas públicas, da busca, do sitemap e do RSS.
- Depois da aprovação editorial, a manutenção ajusta `pubDate` e troca `draft` para `false` antes da publicação. O campo `draft` do artigo é independente da opção "Draft pull request" do GitHub.

### Categorias, tags e dificuldade

Use a categoria para representar a área principal do artigo, tags temáticas para descrever tecnologias e assuntos específicos e uma tag de dificuldade para indicar o conhecimento esperado da pessoa leitora.

Categorias disponíveis atualmente:

- `Carreira`;
- `Cloud`;
- `DevOps`;
- `Microsoft 365`.

Tags temáticas disponíveis atualmente:

- `Azure`;
- `CI/CD`;
- `Estudantes`;
- `Git`;
- `GitHub Actions`;
- `IAM`;
- `Microsoft Entra ID`;
- `Redes`;
- `Segurança`;
- `Versionamento`.

Dificuldades disponíveis:

- `Iniciante`: apresenta fundamentos, explica termos e exige pouco ou nenhum conhecimento prévio;
- `Intermediário`: pressupõe familiaridade com os fundamentos e aborda integrações, configurações ou diagnósticos com mais detalhes;
- `Avançado`: pressupõe experiência prática e trata arquitetura, automação complexa, produção, riscos elevados ou diagnóstico aprofundado.

Nas versões em inglês, traduza a taxonomia editorial quando houver equivalente natural. Use `Career` para `Carreira`, `Students` para `Estudantes` e exatamente uma dificuldade entre `Beginner`, `Intermediate` e `Advanced`. Nomes de produtos e tecnologias, como `Azure`, `Microsoft Learn` e `Microsoft Student Ambassadors`, permanecem inalterados.

Todo artigo deve usar exatamente uma dessas três dificuldades dentro de `tags`. Não crie variações como `Básico`, `Fácil`, `Médio` ou `Especialista`.

Escolha exatamente uma categoria e pelo menos uma tag temática que representem de fato o conteúdo. Prefira os nomes existentes e preserve a grafia, os espaços, as siglas e a capitalização mostrados acima. Em geral, use de duas a quatro tags temáticas, além da dificuldade, e evite termos que apareçam apenas de forma incidental no texto.

Você pode propor uma nova categoria quando nenhuma das categorias atuais representar a área principal do artigo. Também pode criar novas tags temáticas para tecnologias ou assuntos ainda não cobertos. Faça isso sem exageros: a nova categoria deve representar um eixo editorial amplo e a nova tag deve ser específica, clara e reutilizável em outros artigos. Não crie sinônimos, variações de capitalização, tags excessivamente genéricas ou uma tag diferente para cada detalhe do texto.

As três dificuldades são fixas. Se houver dúvida sobre uma nova categoria, tag ou sobre o nível correto, registre a decisão na descrição do pull request para que seja validada durante a revisão.

### Como o crédito de autoria funciona

O valor de `author` aparece no cabeçalho do artigo, na metatag de autor, nos dados estruturados e no feed RSS. Quando `authorUrl` for informado, o nome também será um link para esse endereço.

Use em `author` o nome pelo qual você deseja receber crédito público. Nome social e pseudônimo público são aceitos. Não use o nome ou o contato de outra pessoa sem autorização.

O campo `authorUrl` representa o contato público principal e não deve conter informações privadas. Contatos adicionais podem ser apresentados na seção opcional "Sobre a autoria", no fim do artigo. Evite publicar telefone, e-mail pessoal ou qualquer dado que você não queira manter publicamente no histórico do repositório.

Em um artigo com mais de uma pessoa autora, use um crédito conjunto, por exemplo `author: "Nome A e Nome B"`. Use `authorUrl` apenas quando existir uma página pública compartilhada; caso contrário, omita o campo e apresente os links individuais em "Sobre a autoria".

Esse crédito editorial é independente da autoria dos commits. Para que o GitHub também associe os commits à sua conta, configure neste repositório um nome e um e-mail verificado na sua conta do GitHub ou o endereço `noreply` fornecido pelo GitHub:

```powershell
git config user.name "Seu Nome"
git config user.email "seu-email-verificado-ou-noreply"
```

O nome e o e-mail ficam registrados no histórico Git público. Prefira o endereço `noreply` do GitHub quando não quiser expor seu e-mail pessoal.

Confirme antes de criar o commit:

```powershell
git config user.name
git config user.email
```

Commits produzidos em conjunto devem registrar uma linha como a seguinte no fim da mensagem para cada coautoria:

```text
Co-authored-by: Nome da Pessoa <email-verificado-ou-noreply>
```

Use apenas o nome e o e-mail aprovados pela pessoa coautora. O e-mail também deve estar associado à conta dela no GitHub para que a plataforma reconheça a coautoria.

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

Nosso projeto possui CI automatizado que validará seu código no momento do Pull Request. Por favor, execute as validações locais antes de commitar:

```powershell
pnpm format
pnpm lint
pnpm validate
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

Se o artigo tiver imagens, adicione também a pasta correspondente em `public/images/posts/nome-do-artigo/`.

Depois do push, acesse a [comparação de branches do RookieOps](https://github.com/tkusal/rookieops.dev/compare) e configure:

- **base repository:** `tkusal/rookieops.dev`;
- **base:** `main`;
- **head repository:** `SEU-USUARIO/rookieops.dev`;
- **compare:** `artigo/nome-do-artigo`.

Use um pull request normal quando o conteúdo estiver completo e pronto para revisão, mesmo que o frontmatter ainda contenha `draft: true`. Use a opção "Draft pull request" do GitHub somente quando ainda houver trabalho conhecido antes da revisão.

O GitHub carregará automaticamente o arquivo `.github/PULL_REQUEST_TEMPLATE.md`. Preencha todas as seções aplicáveis. No título e na descrição:

- resuma o tema e o público do artigo;
- explique como o conteúdo foi testado;
- indique issue relacionada, quando houver;
- liste limitações, riscos ou pontos que precisam de revisão;
- confirme que `pnpm validate` foi executado;
- declare a origem e a licença de qualquer material de terceiros.

Mantenha um assunto principal por pull request. Responda aos comentários de revisão com novos commits na mesma branch; não é necessário abrir outro pull request. Depois de enviar os ajustes, responda às conversas relevantes e solicite uma nova revisão no mesmo PR.

## Direitos autorais e licença

Você deve enviar apenas material que criou ou que tem autorização para distribuir. A pessoa autora mantém os direitos autorais do artigo.

Ao enviar uma contribuição editorial, você autoriza o RookieOps, de forma não exclusiva e sem remuneração, a revisar, formatar, publicar, hospedar e distribuir o conteúdo como parte do site, preservando o crédito de autoria, nos termos de [CONTENT-LICENSE.md](CONTENT-LICENSE.md). Contribuições de código são distribuídas sob a [GNU General Public License v3.0](LICENSE).

O envio de um pull request não garante a publicação. A manutenção pode solicitar ajustes ou recusar conteúdo que esteja fora do escopo, não possa ser verificado ou não cumpra estas diretrizes.
