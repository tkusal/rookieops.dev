---
title: "GitHub Actions para iniciantes: CI/CD na prática"
description: "Aprenda GitHub Actions na prática: crie uma pipeline segura de CI/CD com testes, matriz, artefatos e deploy no GitHub Pages para a certificação GH-200."
pubDate: 2026-08-02
author: "Thiago Kusal"
authorUrl: "https://tkusal.com.br"
lang: pt-br
categories: ["DevOps"]
tags: ["GitHub Actions", "CI/CD"]
cover: "/images/posts/github-actions-para-iniciantes-ci-cd-gh-200/capa.webp"
coverAlt: "Ilustração de uma alteração de código atravessando testes, empacotamento e implantação automatizados"
toc: true
comments: false
draft: false
---

Você abre um pull request com uma mudança de três linhas. A revisão parece simples, o código funciona na sua máquina e alguém aprova. Minutos depois, a aplicação em produção deixa de carregar porque a versão do runtime no servidor não era a mesma do seu notebook.

O erro não começou no deploy. Começou quando a equipe aceitou a promessa de que “na minha máquina funciona” no lugar de uma evidência reproduzível.

O GitHub Actions transforma eventos do repositório em verificações e entregas automáticas. Cada pull request pode provar que o código instala, testa e compila em um ambiente limpo. Depois da aprovação, o mesmo processo pode preparar um artefato e implantá-lo com permissões controladas.

Neste guia, você construirá esse caminho completo para um site estático mínimo. O laboratório começa com **integração contínua (CI)** e evolui para **implantação contínua (CD)** no GitHub Pages. Ao mesmo tempo, conecta a prática aos conceitos que aparecem no exame **GH-200: GitHub Actions**.

> [!IMPORTANT]
> Este artigo é material de estudo independente. Ele não contém questões reais do exame, não garante aprovação e não substitui o guia oficial, que pode ser atualizado. Use o laboratório para desenvolver raciocínio prático, não para decorar YAML.

## O que você será capaz de fazer

Ao final do laboratório, você saberá:

- diferenciar workflow, evento, job, step, runner e action;
- executar testes automaticamente em pull requests e pushes para `main`;
- usar uma matriz para validar duas versões do Node.js;
- encadear teste, build e deploy com `needs`;
- publicar um artefato no GitHub Pages;
- limitar as permissões do `GITHUB_TOKEN`;
- proteger o ambiente de produção e impedir deploys simultâneos;
- localizar uma falha nos logs e escolher uma forma segura de reversão.

O resultado será esta sequência:

```text title="Caminho automatizado da mudança"
Pull request → testes em Node 22 e 24 → build → revisão → merge em main
                                                               ↓
                                                artefato → GitHub Pages
```

## Onde este laboratório encontra a GH-200

Na versão do guia de estudo consultada em 2 de agosto de 2026, as habilidades medidas estão distribuídas assim:

| Área | Peso no exame | O que você praticará aqui |
| --- | ---: | --- |
| Criar e gerenciar workflows | 20–25% | eventos, jobs, steps, matriz, contextos, dependências e saídas |
| Consumir e solucionar problemas de workflows | 15–20% | histórico de execuções, logs, nomes da matriz e reexecução |
| Criar e manter actions | 15–20% | diferença entre `run` e `uses`; consumo seguro de actions |
| Gerenciar GitHub Actions para a organização | 20–25% | runners, escopo de secrets e variáveis, políticas e componentes reutilizáveis |
| Automação segura e otimizada | 10–15% | privilégio mínimo, SHA completo, ambientes, OIDC, concorrência e custo da matriz |

Um único laboratório não cobre toda a certificação. Actions JavaScript, Docker e compostas, workflows reutilizáveis, runner groups, políticas empresariais, atestações e APIs de administração continuam no seu plano de estudo. A vantagem deste projeto é criar o modelo mental sobre o qual esses assuntos se apoiam.

## CI, entrega contínua e implantação contínua

As três expressões são próximas, mas não são sinônimos:

| Prática | Pergunta respondida | Resultado |
| --- | --- | --- |
| Integração contínua | “Esta mudança pode ser integrada com segurança?” | testes, análise e build executados a cada mudança |
| Entrega contínua | “Existe um pacote aprovado e pronto para produção?” | artefato reproduzível; a promoção pode exigir aprovação humana |
| Implantação contínua | “Uma mudança aprovada pode chegar automaticamente ao usuário?” | deploy automático após todas as verificações |

Neste artigo, **CD** será usado como o guarda-chuva comum para entrega e implantação contínuas. O exemplo final faz implantação contínua no GitHub Pages. Se você adicionar um revisor obrigatório ao ambiente, o mesmo desenho passa a ter uma barreira manual antes da produção e se aproxima da entrega contínua.

GitHub Actions é o mecanismo de automação. CI e CD são práticas de engenharia implementadas com esse mecanismo. Um arquivo YAML não cria uma cultura de entrega confiável sozinho: testes relevantes, revisão, observabilidade e um procedimento de retorno continuam necessários.

## Pré-requisitos e ambiente testado

Você precisa de:

- uma conta no GitHub;
- um repositório de laboratório, sem dados confidenciais;
- permissão para habilitar GitHub Actions e GitHub Pages nesse repositório;
- Git e Node.js instalados para validar o projeto localmente;
- familiaridade básica com commit, branch, push e pull request.

O laboratório foi validado com GitHub-hosted runner `ubuntu-latest`, Node.js 22 e 24 e npm. Actions e imagens de runners evoluem; por isso, confira o [software disponível nos runners hospedados](https://docs.github.com/pt/actions/reference/runners/github-hosted-runners) se adaptar o exemplo no futuro.

> [!IMPORTANT]
> Os exemplos usam um repositório público. No GitHub Free, para contas pessoais ou organizações, o repositório precisa ser público para que o GitHub Pages funcione. Repositórios privados têm suporte ao Pages nos planos GitHub Pro, Team e Enterprise. Confira a [disponibilidade do GitHub Pages por plano](https://docs.github.com/pt/pages/getting-started-with-github-pages/github-pages-limits). Os minutos incluídos e as regras de proteção de ambiente também variam conforme o plano e a visibilidade do repositório.

> [!NOTE]
> Se você ainda não domina branches e pull requests, leia primeiro [Git para quem está começando em DevOps](/posts/git-para-quem-esta-comecando-em-devops/). O Actions reage aos eventos do repositório; entender o fluxo do Git torna os gatilhos muito menos abstratos.

Os comandos de terminal deste laboratório usam PowerShell. No Bash ou zsh, troque `Set-Location laboratorio-actions` por `cd laboratorio-actions`; os comandos `git` e `npm` permanecem iguais.

## Prepare uma aplicação mínima

Crie um repositório no GitHub chamado `laboratorio-actions` e clone-o. Substitua `<SEU_USUARIO>`:

```powershell
git clone https://github.com/<SEU_USUARIO>/laboratorio-actions.git
Set-Location laboratorio-actions
git switch -c feature/primeira-pipeline
```

Crie esta estrutura:

```text
laboratorio-actions/
├── .github/
│   └── workflows/
├── scripts/
│   └── build.mjs
├── src/
│   └── index.html
├── test/
│   └── homepage.test.mjs
└── package.json
```

O `package.json` usa apenas recursos nativos do Node.js. Isso reduz distrações sem transformar o exemplo em pseudocódigo:

```json title="package.json"
{
  "name": "laboratorio-actions",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test",
    "build": "node scripts/build.mjs"
  }
}
```

Crie a página que será publicada:

```html title="src/index.html"
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Laboratório GitHub Actions</title>
  </head>
  <body>
    <main>
      <h1>Minha primeira pipeline chegou à produção.</h1>
    </main>
  </body>
</html>
```

O script de build recria `dist` e copia para lá o conteúdo publicável:

```javascript title="scripts/build.mjs"
import { cp, rm } from 'node:fs/promises';

await rm('dist', { recursive: true, force: true });
await cp('src', 'dist', { recursive: true });

console.log('Build concluído em dist/.');
```

O teste verifica um comportamento observável: a página tem o título esperado.

```javascript title="test/homepage.test.mjs"
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('a página apresenta o título do laboratório', async () => {
  const html = await readFile('src/index.html', 'utf8');

  assert.match(html, /<title>Laboratório GitHub Actions<\/title>/);
});
```

Gere e versione o lockfile mesmo sem dependências externas. Ele registra a resolução do projeto e permite usar `npm ci`:

```powershell
npm install --package-lock-only
npm test
npm run build
```

O teste deve passar e o arquivo `dist/index.html` deve existir. Se falhar localmente, resolva antes de automatizar; uma pipeline executa o processo, mas não corrige um processo indefinido.

## Crie o primeiro workflow de CI

Workflows ficam em `.github/workflows/` e usam YAML. Crie o arquivo:

```yaml title=".github/workflows/ci.yml"
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

permissions:
  contents: read

jobs:
  test:
    name: Node ${{ matrix.node }}
    runs-on: ubuntu-latest
    timeout-minutes: 10
    strategy:
      fail-fast: false
      matrix:
        node: [22, 24]

    steps:
      - name: Baixar o código
        uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7

      - name: Preparar Node.js
        uses: actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7
        with:
          node-version: ${{ matrix.node }}
          package-manager-cache: false # sem dependências externas para armazenar em cache

      - name: Instalar dependências
        run: npm ci

      - name: Executar testes
        run: npm test

      - name: Gerar o site
        run: npm run build
```

Antes de executar, entenda as peças:

- `name` identifica o workflow na interface;
- `on` define os eventos que iniciam uma execução;
- `permissions` limita o token automático ao acesso de leitura do conteúdo;
- `jobs` agrupa unidades de trabalho;
- `runs-on` escolhe o runner que executará o job;
- `strategy.matrix` cria uma execução do job para cada versão do Node.js;
- `steps` são executados em sequência dentro do mesmo job;
- `uses` chama uma action reutilizável;
- `run` executa um comando no shell do runner.

O runner é uma máquina de execução. Em um runner hospedado pelo GitHub, cada job começa em um ambiente novo; arquivos criados em outro job não aparecem nele automaticamente. Para atravessar essa fronteira, use artefatos, cache ou outputs conforme o tipo de dado.

### Por que existem dois gatilhos?

`pull_request` oferece feedback antes do merge. `push` em `main` verifica o commit que realmente entrou na branch principal, que pode ser diferente do commit testado no pull request conforme a estratégia de merge.

Em ambos os filtros, `branches: [main]` se refere à branch de destino relevante para o evento. Não confunda evento com condição: `on` decide se o workflow começa; um `if` decide se um job ou step específico será executado dentro dele.

### Por que usar uma matriz?

A matriz transforma uma definição em dois jobs: `Node 22` e `Node 24`. Isso ajuda a descobrir incompatibilidades sem duplicar YAML. `fail-fast: false` mantém a outra variante em execução quando uma falha, produzindo um diagnóstico mais completo.

Cada combinação consome tempo de runner. Uma matriz com três sistemas operacionais e quatro runtimes pode gerar 12 jobs. Na prova e no trabalho, a pergunta não é apenas “sei escrever uma matriz?”, mas “essas combinações reduzem risco suficiente para justificar tempo e custo?”.

### Por que fixar actions por SHA?

Tags como `@v7` são fáceis de ler, mas podem ser movidas para outro commit. Um SHA completo aponta para conteúdo imutável e reduz o risco de uma alteração inesperada na cadeia de suprimentos. O comentário preserva a versão humana reconhecível.

Os SHAs deste laboratório foram verificados nos repositórios oficiais das actions na data de publicação. Ao atualizar uma action, consulte a release oficial, revise as mudanças e substitua conscientemente o SHA. O Dependabot pode automatizar propostas de atualização para GitHub Actions.

## Execute e leia a CI

Registre e envie a branch:

```powershell
git add package.json package-lock.json scripts src test .github/workflows/ci.yml
git diff --staged
git commit -m "ci: adiciona validacao em duas versoes do Node"
git push -u origin feature/primeira-pipeline
```

Abra um pull request para `main`. Na guia **Actions**, abra a execução chamada **CI**. Você deverá encontrar dois jobs, um para cada valor de `matrix.node`.

![Diagrama mostrando uma matriz com Node.js 22 e 24, os dois jobs resultantes e o caminho para localizar a primeira falha relevante no log.](/images/posts/github-actions-para-iniciantes-ci-cd-gh-200/matriz-e-diagnostico.svg)

Pratique uma falha controlada: troque temporariamente o conteúdo do `<title>` sem alterar o teste, faça commit e push. Abra o job vermelho, depois o step **Executar testes**. O log deve mostrar o valor esperado e o recebido. Corrija o título, envie outro commit e confirme que os dois jobs ficam verdes.

Esse exercício ensina uma habilidade central da GH-200: partir do evento e da configuração, localizar o job, encontrar o primeiro step que falhou e interpretar o log. O último erro exibido nem sempre é a causa; procure a primeira quebra relevante.

Quando um erro for transitório, a interface permite reexecutar jobs. Quando a configuração ou o código estiver errado, corrija o repositório e gere uma nova execução. Repetir indefinidamente uma falha determinística apenas consome minutos.

### Leve a evidência para o resumo da execução

Em projetos reais, você pode gravar resultados de testes, cobertura, tamanho do bundle e links no arquivo `GITHUB_STEP_SUMMARY`. O conteúdo em Markdown aparece no resumo da execução, poupando quem revisa de abrir cada log. Adicione este step ao final do job `test` em `.github/workflows/ci.yml`, logo depois de **Executar testes**. Como esse job usa uma matriz, cada versão do Node.js produzirá seu próprio resumo e permitirá observar os contextos `matrix` e `job`:

```yaml title=".github/workflows/ci.yml (trecho do job test)"
- name: Resumir a execução
  if: always()
  run: |
    echo "## Resultado da CI" >> "$GITHUB_STEP_SUMMARY"
    echo "- Node: ${{ matrix.node }}" >> "$GITHUB_STEP_SUMMARY"
    echo "- Status do job: ${{ job.status }}" >> "$GITHUB_STEP_SUMMARY"
```

`if: always()` faz o step executar mesmo quando um teste anterior falha. Não grave secrets ou outros dados confidenciais no resumo: ele faz parte do registro da execução.

## Evolua de CI para CI/CD

Depois que a CI estiver compreendida, renomeie `ci.yml` para `pipeline.yml` e substitua seu conteúdo pelo workflow completo abaixo. Ele preserva os testes, cria o site uma única vez após a matriz e implanta somente a partir de `main`.

```yaml title=".github/workflows/pipeline.yml"
name: CI e CD

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read

jobs:
  test:
    name: Node ${{ matrix.node }}
    runs-on: ubuntu-latest
    timeout-minutes: 10
    strategy:
      fail-fast: false
      matrix:
        node: [22, 24]

    steps:
      - name: Baixar o código
        uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7

      - name: Preparar Node.js
        uses: actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7
        with:
          node-version: ${{ matrix.node }}
          package-manager-cache: false # sem dependências externas para armazenar em cache

      - name: Instalar dependências
        run: npm ci

      - name: Executar testes
        run: npm test

  build:
    name: Gerar artefato
    needs: test
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - name: Baixar o código
        uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7

      - name: Preparar Node.js
        uses: actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7
        with:
          node-version: 24
          package-manager-cache: false # sem dependências externas para armazenar em cache

      - name: Instalar dependências
        run: npm ci

      - name: Gerar o site
        run: npm run build

      - name: Empacotar para o GitHub Pages
        if: github.event_name != 'pull_request' && github.ref == 'refs/heads/main'
        uses: actions/upload-pages-artifact@7b1f4a764d45c48632c6b24a0339c27f5614fb0b # v4.0.0
        with:
          path: dist

  deploy:
    name: Implantar em produção
    if: github.event_name != 'pull_request' && github.ref == 'refs/heads/main'
    needs: build
    runs-on: ubuntu-latest
    timeout-minutes: 10

    permissions:
      pages: write
      id-token: write

    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}

    concurrency:
      group: github-pages-production
      cancel-in-progress: false

    steps:
      - name: Implantar no GitHub Pages
        id: deployment
        uses: actions/deploy-pages@d6db90164ac5ed86f2b6aed7e0febac5b3c0c03e # v4.0.5
```

Agora existe uma dependência explícita:

```text title="Grafo dos jobs"
test (Node 22 e 24) → build → deploy
```

`needs: test` impede o build se qualquer variante de teste falhar. `needs: build` impede o deploy se o artefato não for produzido. Jobs independentes podem executar em paralelo; `needs` cria uma ordem somente onde ela é necessária.

A matriz usa Node.js 22 e 24 para verificar compatibilidade, mas o build usa apenas Node.js 24, o runtime homologado para produzir o artefato deste laboratório. Testar em várias versões amplia a evidência; empacotar em uma única versão torna a saída de produção mais determinística.

`workflow_dispatch` acrescenta o botão **Run workflow** para execuções manuais e permite escolher uma referência. O step de upload e o job de deploy repetem deliberadamente a mesma condição: apenas a `main` pode empacotar e implantar em produção. Um disparo manual a partir de uma branch de teste ainda executa testes e build, mas ignora upload e deploy. Em pull requests, o comportamento é o mesmo; em um push ou disparo manual na `main`, o build envia `dist` como um artefato especial chamado `github-pages`, e o job seguinte o implanta.

> [!NOTE]
> Artefato e cache resolvem problemas diferentes. Um artefato é uma saída daquela execução, neste caso, o site que será implantado. Cache acelera execuções futuras ao reutilizar dados que podem ser recriados, como downloads do gerenciador de pacotes. Não use cache como canal de promoção para produção.

## Habilite o GitHub Pages e valide o deploy

No repositório, acesse **Settings → Pages**. Em **Build and deployment**, selecione **GitHub Actions** como fonte. A interface pode criar ou sugerir o ambiente `github-pages`.

Faça commit da evolução e envie a branch:

```powershell
git add .github/workflows
git diff --staged
git commit -m "ci: adiciona deploy do site no GitHub Pages"
git push
```

No pull request, confirme que `test` e `build` passam e que `deploy` é ignorado. Depois do merge em `main`, acompanhe a nova execução. O job de deploy deverá mostrar a URL do ambiente.

Valide três evidências:

1. a página abre na URL publicada;
2. o `<h1>` corresponde ao conteúdo versionado;
3. a guia de ambientes registra o commit implantado.

Um check verde comprova que os comandos terminaram com sucesso; ele não comprova sozinho que o usuário recebeu a experiência esperada. Em sistemas reais, acrescente smoke tests, monitoramento e critérios de saúde após o deploy.

## Entenda as decisões de segurança

Uma pipeline tem acesso ao código, a tokens e, às vezes, à produção. Trate YAML como código privilegiado.

### Conceda o mínimo necessário

No nível do workflow, `contents: read` basta para baixar o repositório. O job `deploy` redefine as permissões para `pages: write` e `id-token: write`. Quando você declara permissões específicas, as não listadas ficam sem acesso.

O `GITHUB_TOKEN` é criado para a execução e tem seu escopo limitado pelas permissões configuradas. Ele não é equivalente a um PAT pessoal de longa duração. Se uma integração exigir outra credencial, pergunte primeiro se o `GITHUB_TOKEN`, um GitHub App ou federação OIDC resolve o caso com menor exposição.

`id-token: write` permite solicitar um token OIDC; não concede por si só permissão para alterar qualquer nuvem. O provedor valida claims como repositório, referência e ambiente antes de trocar esse token por acesso temporário. Isso evita armazenar uma credencial de nuvem de longa duração no GitHub.

### Proteja o ambiente

O job declara `environment: github-pages`. Ambientes podem restringir branches, guardar secrets próprios e, conforme o plano, exigir revisores ou um tempo de espera antes do job.

Para transformar o exemplo em entrega contínua com aprovação:

1. abra **Settings → Environments → github-pages**;
2. restrinja a implantação à branch protegida `main`;
3. configure um revisor que não seja a mesma pessoa que iniciou o deploy, quando o recurso estiver disponível;
4. teste o fluxo com uma mudança inofensiva.

Secrets do ambiente só ficam disponíveis para o job após as regras de proteção serem satisfeitas. Não imprima secrets, não os grave em artefatos e não suponha que mascaramento de log corrige um vazamento já ocorrido.

### Diferencie `env`, `vars` e `secrets`

O laboratório não precisa de configuração externa, mas a GH-200 exige reconhecer onde cada valor vive:

- `env` define variáveis de ambiente no próprio YAML; quando um nome se repete, o escopo mais específico vence: step, depois job, depois workflow;
- `vars` guarda configuração não confidencial nos níveis de organização, repositório ou ambiente e é acessado pelo contexto `${{ vars.NOME }}`;
- `secrets` guarda valores confidenciais e só deve ser passado explicitamente ao step ou à action que precisa dele, por meio de `${{ secrets.NOME }}`.

Para secrets com o mesmo nome, o menor escopo administrativo prevalece: ambiente, depois repositório, depois organização. O job só recebe o secret do ambiente que declara em `environment`, e somente depois de satisfazer suas regras de proteção. Variáveis de configuração seguem a mesma ideia geral de precedência, mas as variáveis do ambiente só ficam disponíveis depois que o runner inicia; não dependa delas para escolher o próprio ambiente ou tomar uma decisão anterior ao job.

### Evite dados não confiáveis em scripts

Valores vindos de título de issue, corpo de pull request, nome de branch ou payload de webhook podem conter texto controlado por outra pessoa. Inserir uma expressão diretamente em `run` pode transformar dados em comando.

Quando precisar usar uma entrada em um script, passe-a por uma variável de ambiente, aplique aspas adequadas ao shell e valide o formato. Tenha cautela adicional com `pull_request_target`: ele pode acessar o contexto privilegiado da branch base e não deve executar código não confiável do fork.

### Controle a cadeia de suprimentos

- prefira actions mantidas pelo GitHub ou por fornecedores confiáveis;
- leia o repositório, a licença, as releases e a política de segurança;
- fixe actions de terceiros em SHA completo;
- use Dependabot para propor atualizações de referências;
- limite na organização quais actions e workflows reutilizáveis podem executar.

Fixar um SHA reduz a mutabilidade; não transforma código desconhecido em código seguro. Confiança também exige procedência, revisão e manutenção.

### Entenda os runners

GitHub-hosted runners são efêmeros para cada job. Runners auto-hospedados oferecem controle de rede e ferramentas, mas não são uma fronteira de isolamento automática. Código não confiável pode alcançar a máquina, credenciais locais e serviços acessíveis pela rede.

Não envie pull requests de origem desconhecida para um runner auto-hospedado com acesso à produção. Separe grupos, rótulos, redes e permissões conforme o nível de confiança.

## Concorrência, custo e desempenho

`concurrency` garante apenas um deploy no grupo `github-pages-production` por vez. Com `cancel-in-progress: false`, um deploy em andamento não é interrompido por uma mudança mais nova. Para outro sistema, cancelar ou enfileirar depende de como a aplicação lida com versões parciais e rollback.

Antes de otimizar, meça. Algumas decisões comuns:

- reduza a matriz às combinações suportadas e relevantes;
- use `timeout-minutes` para conter jobs travados;
- ative cache apenas quando houver downloads repetidos que justifiquem o risco e a complexidade;
- defina retenção coerente para logs e artefatos;
- reutilize workflows quando várias equipes precisarem da mesma política;
- evite repetir builds de produção: promova o artefato que foi validado.

Neste laboratório, desabilitamos o cache automático do npm porque não existem dependências externas. Adicionar cache aqui aumentaria a superfície e não economizaria tempo relevante.

## Diagnóstico: leia a pipeline como um grafo

Quando a execução falhar, siga uma ordem previsível:

1. **Evento:** o workflow deveria ter iniciado para esse `event_name`, branch ou caminho?
2. **Condição:** o job foi executado, ignorado ou bloqueado por ambiente?
3. **Dependência:** algum job em `needs` falhou ou foi ignorado?
4. **Matriz:** a falha acontece em todas as variantes ou apenas em uma?
5. **Primeiro step vermelho:** qual foi o comando, código de saída e mensagem inicial relevante?
6. **Entrada e contexto:** o valor veio de `github`, `matrix`, `inputs`, `vars` ou `secrets`?
7. **Permissão:** o token possui somente o acesso exigido pela operação?
8. **Runner:** a imagem, ferramenta, rede e arquitetura correspondem ao esperado?

Ative logs de depuração apenas pelo tempo necessário e revise o que será exposto. Não “resolva” um erro de autorização concedendo `write-all`; identifique a permissão ausente e altere o menor escopo possível.

## Reversão segura

Se o deploy publicar uma regressão, suspenda novas mudanças e identifique o último commit saudável. Para um commit já compartilhado em `main`, prefira criar uma reversão rastreável:

```powershell
git switch main
git pull --ff-only origin main
git switch -c fix/reverte-pagina
git revert <HASH_DO_COMMIT_COM_PROBLEMA>
git push -u origin fix/reverte-pagina
```

Abra um pull request, execute as mesmas verificações e integre a reversão. A pipeline produzirá um novo artefato com o conteúdo anterior e manterá o histórico da decisão.

Reexecutar um deploy antigo pode depender de um artefato que já expirou e não registra uma nova correção no código. Em aplicações com banco de dados, filas ou migrações irreversíveis, voltar o binário pode não ser suficiente; o plano de rollback precisa ser desenhado e testado antes da primeira implantação.

## Checklist de preparação para a GH-200

> [!TIP]
> Use este checklist como recuperação ativa: responda sem consultar o artigo e depois altere o laboratório para testar cada hipótese.

Sem consultar o YAML, tente responder:

- qual é a diferença entre workflow, job, step, action e runner?
- quando usar `pull_request`, `push`, `workflow_dispatch` e `workflow_call`?
- como `needs` e `if` alteram o grafo de execução?
- quantos jobs uma matriz produzirá depois de `include` e `exclude`?
- quando transportar um valor por output, artefato, cache, variável ou secret?
- por que um job pode estar ignorado mesmo com o workflow iniciado?
- como escopos de organização, repositório e ambiente afetam secrets e variáveis?
- quando registrar informações em `GITHUB_STEP_SUMMARY`, e quais dados nunca devem ser incluídos nele?
- quais permissões mínimas o `GITHUB_TOKEN` precisa?
- quando usar OIDC em vez de credencial de longa duração?
- qual é a diferença entre starter workflow, workflow reutilizável e action composta?
- como limitar actions, runners e workflows reutilizáveis em uma organização?
- como encontrar a primeira causa relevante em logs de uma matriz?

Se alguma resposta depender de decorar uma linha, altere o laboratório e observe o comportamento. Troque um gatilho, remova um `needs`, force a falha de uma versão, adicione aprovação ao ambiente e compare o grafo. A prática transforma sintaxe em causa e efeito.

## Referências

**Certificação**

- [Guia de estudos para o exame GH-200: GitHub Actions](https://learn.microsoft.com/pt-br/credentials/certifications/resources/study-guides/gh-200?wt.mc_id=studentamb_365381)
- [Certificação GitHub Actions](https://learn.microsoft.com/pt-br/credentials/certifications/github-actions/?wt.mc_id=studentamb_365381)

**Workflows e implantação**

- [Entender GitHub Actions](https://docs.github.com/pt/actions/get-started/understand-github-actions)
- [Sintaxe de workflow para GitHub Actions](https://docs.github.com/pt/actions/reference/workflows-and-actions/workflow-syntax)
- [Comandos de workflow e `GITHUB_STEP_SUMMARY`](https://docs.github.com/pt/actions/reference/workflows-and-actions/workflow-commands)
- [Armazenar e compartilhar dados com artefatos de workflow](https://docs.github.com/pt/actions/tutorials/store-and-share-data)
- [Implantar com GitHub Actions](https://docs.github.com/pt/actions/how-tos/deploy/configure-and-manage-deployments/control-deployments)
- [Repositório oficial de `upload-pages-artifact`](https://github.com/actions/upload-pages-artifact)
- [Repositório oficial de `deploy-pages`](https://github.com/actions/deploy-pages)

**Segurança e operação**

- [Referência de uso seguro do GitHub Actions](https://docs.github.com/pt/actions/reference/security/secure-use)
- [Variáveis no GitHub Actions](https://docs.github.com/pt/actions/how-tos/write-workflows/choose-what-workflows-do/use-variables)
- [Secrets no GitHub Actions](https://docs.github.com/pt/actions/reference/security/secrets)
- [Implantações e ambientes](https://docs.github.com/pt/actions/reference/workflows-and-actions/deployments-and-environments)
- [OpenID Connect no GitHub Actions](https://docs.github.com/pt/actions/reference/security/oidc)
- [Repositório oficial de `checkout`](https://github.com/actions/checkout)
- [Repositório oficial de `setup-node`](https://github.com/actions/setup-node)

## Conclusão

Aquele pull request de três linhas agora não depende de “funcionou no meu notebook”. Ele precisa atravessar dois runtimes, gerar um site em um runner limpo, produzir um artefato identificável e respeitar as permissões e regras do ambiente antes de chegar ao usuário.

Esse é o valor real do GitHub Actions: não apenas fazer tarefas mais rápido, mas transformar confiança em evidência repetível.

Para a GH-200, memorize o mínimo possível. Construa, quebre, leia os logs, restrinja uma permissão, aprove um ambiente e reverta uma mudança. Quando você consegue prever o que a pipeline fará antes de clicar em **Run workflow**, o YAML deixa de ser uma lista de palavras-chave e passa a ser um sistema que você sabe operar.
