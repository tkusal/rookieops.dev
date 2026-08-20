---
title: "Git para quem está começando em DevOps"
description: "Aprenda o fluxo essencial do Git para versionar automações, colaborar com segurança e recuperar mudanças sem medo no dia a dia de DevOps."
pubDate: 2026-07-29
author: "Thiago Kusal"
authorUrl: "https://tkusal.com.br"
lang: pt-br
categories: ["DevOps"]
tags: ["Git", "Versionamento", "Iniciante"]
cover: "/images/posts/git-para-quem-esta-comecando-em-devops/fluxo-git.webp"
coverAlt: "Ilustração do fluxo do Git desde o diretório de trabalho até o repositório remoto"
toc: true
comments: false
draft: false
---

São 17h47 de uma sexta-feira. Um script chamado `deploy-final-v3-agora-vai.ps1` funciona na sua máquina, mas ninguém sabe o que mudou desde a versão anterior. A correção precisa chegar à produção, o autor original já encerrou o expediente e o único histórico disponível está espalhado entre uma pasta compartilhada e mensagens no chat.

O problema não é apenas o nome do arquivo. Falta uma resposta confiável para perguntas básicas: **o que mudou, por que mudou, quem revisou e como voltar atrás?**

É nesse ponto que o Git deixa de ser “uma ferramenta de desenvolvedor” e passa a ser parte da operação. Pipelines, arquivos de infraestrutura como código, scripts de automação e documentação são código operacional. Se uma mudança pode afetar o ambiente, ela precisa ser rastreável.

Em equipes que administram Azure e Microsoft 365, isso inclui modelos Bicep, scripts para Microsoft Graph e Exchange Online, configurações de CI/CD e runbooks. Arquivos exportados desses serviços também exigem revisão antes do commit: eles podem conter endereços de e-mail, identificadores internos ou outros dados que não deveriam sair do ambiente autorizado.

Este guia ensina **Git aplicado ao trabalho de DevOps**, não todas as ferramentas desse universo. Você não precisa conhecer Terraform, Bicep, Ansible ou Kubernetes: o laboratório usa somente Git e PowerShell. Ele serve tanto para quem está entrando em DevOps quanto para profissionais de infraestrutura que já automatizam tarefas, mas ainda não versionam seu trabalho.

## O que você será capaz de fazer

Ao final deste guia, você terá um fluxo básico para:

- criar ou clonar um repositório;
- identificar o estado dos arquivos;
- selecionar mudanças e criar commits pequenos;
- trabalhar em uma branch sem alterar diretamente a linha principal;
- enviar a branch para um repositório remoto;
- validar o que será revisado;
- desfazer erros de forma compatível com trabalho em equipe.

O objetivo não é memorizar todos os comandos. É entender o caminho percorrido por uma mudança e saber onde inspecioná-la antes de seguir adiante.

## Pré-requisitos e ambiente testado

Você precisa de:

- Git instalado;
- um terminal;
- um editor de texto;
- uma conta em um serviço de hospedagem Git, como Azure Repos, GitHub ou GitLab, somente para a etapa remota;
- um repositório de laboratório sem dados confidenciais.

Os exemplos foram testados no PowerShell 7.6.3 com Git for Windows 2.50.1. Os comandos `git` são equivalentes no Linux e no macOS; apenas os comandos usados para criar arquivos no laboratório podem variar entre shells.

Confirme a instalação:

```powershell
git --version
```

> [!NOTE]
> Git é o sistema de controle de versão. Azure Repos, GitHub e GitLab são plataformas que hospedam repositórios Git e acrescentam recursos como pull requests, políticas, permissões e pipelines.

## O modelo mental que evita a maioria das confusões

Uma mudança passa por quatro lugares:

```text title="Caminho de uma mudança"
Diretório de trabalho → Área de staging → Repositório local → Repositório remoto
       editar             git add          git commit          git push
```

![Ilustração de um arquivo saindo de um notebook, passando pela área de staging e pelo repositório local até chegar a um repositório remoto em nuvem.](/images/posts/git-para-quem-esta-comecando-em-devops/fluxo-git.webp)

- **Diretório de trabalho:** os arquivos que você está editando.
- **Área de staging:** a seleção exata que entrará no próximo commit.
- **Repositório local:** o histórico de commits armazenado na pasta oculta `.git`.
- **Repositório remoto:** uma cópia acessível pela equipe em outro servidor.

`git add` não envia nada para a internet. `git commit` também não. O envio ao servidor acontece com `git push`.

Pense no commit como uma fotografia com contexto: ele registra o conteúdo selecionado, o autor, a data e uma mensagem. Uma boa sequência de commits conta a história da mudança sem depender da memória de quem a executou.

## Configure sua identidade

O nome e o e-mail ficam registrados nos commits. Configure valores associados à sua identidade profissional:

```powershell
git config --global user.name "<SEU_NOME>"
git config --global user.email "<SEU_EMAIL_VERIFICADO>"
git config --global init.defaultBranch main
```

Confira o resultado e a origem de cada configuração:

```powershell
git config --global --list --show-origin
```

Substitua `<SEU_NOME>` e `<SEU_EMAIL_VERIFICADO>`. Em uma máquina usada para contextos diferentes, você pode sobrescrever a identidade apenas no repositório atual:

```powershell
git config user.name "<NOME_PARA_ESTE_REPOSITORIO>"
git config user.email "<EMAIL_PARA_ESTE_REPOSITORIO>"
```

Sem `--global`, a configuração vale somente para o repositório em que o comando foi executado.

## Crie o laboratório

Crie uma pasta vazia e inicialize o repositório:

```powershell
New-Item -ItemType Directory -Path laboratorio-git | Out-Null
Set-Location laboratorio-git
git init
```

Se o projeto já existe em um servidor, não use `git init`. Clone-o:

```powershell
git clone <URL_DO_REPOSITORIO>
Set-Location <NOME_DA_PASTA_CLONADA>
```

O clone traz os arquivos, o histórico disponível e a configuração do remoto chamado `origin`.

Para o laboratório iniciado localmente, crie dois arquivos:

```powershell
New-Item -ItemType Directory -Path scripts | Out-Null
Set-Content -Path README.md -Value "# Laboratório de automação"
Set-Content -Path scripts/deploy.ps1 -Value "Write-Output 'Simulação de deploy'"
```

Agora pergunte ao Git o que ele enxerga:

```powershell
git status
```

Os arquivos aparecem como **untracked**: existem no diretório, mas ainda não fazem parte de um commit.

## Proteja o repositório antes do primeiro commit

Crie um arquivo `.gitignore` na raiz para excluir arquivos locais, temporários ou gerados. Em um projeto de infraestrutura como código, um ponto de partida pode ser:

```text title=".gitignore"
# Configurações locais e credenciais
.env
*.pem
*.tfvars
!*.tfvars.example

# Estado e cache do Terraform
*.tfstate
*.tfstate.*
.terraform/

# Arquivos temporários
*.log
tmp/

# Preferências locais do editor; remova se a equipe compartilhar essas configurações
.vscode/
```

O padrão exato depende das ferramentas do projeto. Revise cada regra: ignorar um arquivo necessário pode tornar a automação impossível de reproduzir.

Não ignore extensões do ecossistema PowerShell de forma genérica. Arquivos `.psd1`, `.psm1` e `.ps1xml` podem ser parte do código-fonte de um módulo e, nesse caso, precisam ser versionados. Ignore apenas saídas realmente locais ou reproduzíveis, conforme a estrutura e a política da equipe.

> [!WARNING]
> `.gitignore` não é um cofre e não remove arquivos que já estão no histórico. Nunca grave senhas, tokens, chaves privadas, connection strings ou credenciais do Azure em arquivos versionados. Prefira autenticação sem segredo, como identidade gerenciada ou federação de identidade de carga de trabalho, quando disponível. Quando uma credencial for inevitável, use um gerenciador de segredos, como o Azure Key Vault, e variáveis protegidas da plataforma de CI/CD.

Se um segredo for incluído em um commit, considere-o comprometido: revogue ou rotacione a credencial imediatamente e siga o procedimento de resposta a incidentes da organização. Apagar o arquivo no commit seguinte não elimina as cópias anteriores.

## Selecione e registre a primeira mudança

Adicione somente os arquivos relacionados ao objetivo do commit:

```powershell
git add README.md scripts/deploy.ps1 .gitignore
git status
```

Prefira caminhos explícitos enquanto estiver aprendendo. `git add .` é conveniente, mas pode incluir um arquivo que você não pretendia versionar.

Antes do commit, revise o conteúdo selecionado:

```powershell
git diff --staged
```

Se o diff corresponde ao que você pretende entregar, crie o commit:

```powershell
git commit -m "chore: inicia laboratório de automação"
```

> [!NOTE]
> O formato `<tipo>: <descrição>` segue a convenção [Conventional Commits](https://www.conventionalcommits.org/pt-br/v1.0.0/). Neste guia, `chore:` identifica uma tarefa de preparação ou manutenção, enquanto `feat:` indica uma nova funcionalidade e `docs:` uma mudança de documentação. Git não exige essa convenção, e a equipe pode adotar outros tipos. Ela torna o histórico mais previsível e pode alimentar changelogs ou versionamento automatizado quando o projeto configura ferramentas para isso.

Uma mensagem útil explica a intenção. “Atualiza arquivos” diz pouco; “adiciona validação dos parâmetros do deploy” ajuda quem investiga uma falha meses depois.

Confira o histórico:

```powershell
git log --oneline --decorate
```

O identificador exibido no início de cada linha é a forma abreviada do hash do commit.

## Trabalhe em uma branch

Uma branch é uma linha de trabalho que aponta para um commit. Ela permite preparar uma mudança sem alterar diretamente a branch principal.

Crie uma branch com nome curto e descritivo:

```powershell
git switch -c feature/valida-ambiente
```

Edite `scripts/deploy.ps1` para exigir o nome do ambiente:

```powershell title="scripts/deploy.ps1"
param(
    [Parameter(Mandatory)]
    [ValidateSet('dev', 'hml', 'prd')]
    [string]$Ambiente
)

Write-Output "Simulação de deploy no ambiente: $Ambiente"
```

Inspecione as mudanças ainda não adicionadas à área de staging:

```powershell
git status
git diff
```

Execute o script com um valor permitido:

```powershell
./scripts/deploy.ps1 -Ambiente dev
```

O resultado esperado é:

```text
Simulação de deploy no ambiente: dev
```

Registre a mudança:

```powershell
git add scripts/deploy.ps1
git diff --staged
git commit -m "feat: valida ambiente antes do deploy"
```

O ciclo essencial é sempre o mesmo:

```text
Editar → Validar → Revisar o diff → Adicionar ao staging → Commitar
```

## Conecte o repositório local a um remoto

Crie um repositório vazio na plataforma escolhida, sem inicializá-lo com README ou outros arquivos. Para este primeiro laboratório, copie a URL HTTPS. Depois, no repositório local:

```powershell
git remote add origin <URL_DO_REPOSITORIO>
git remote -v
```

Substitua `<URL_DO_REPOSITORIO>` pela URL real.

### Autentique-se antes do primeiro push

Com HTTPS, prefira o **Git Credential Manager (GCM)**. O instalador atual do Git for Windows já inclui o GCM, portanto quem aceitou esse componente durante a instalação normalmente não precisa baixá-lo separadamente. Quando ele estiver instalado e configurado, o primeiro acesso abre um fluxo de autenticação no navegador e armazena o token no gerenciador seguro do sistema:

- no Azure Repos, use o GCM com uma conta Microsoft ou [Microsoft Entra ID](/posts/identidade-na-nuvem-microsoft-entra-id-para-iniciantes/); tokens do Microsoft Entra são preferíveis a PATs;
- no GitHub, use o GCM ou o GitHub CLI para autenticar pelo navegador;
- em outras plataformas, consulte a documentação oficial antes de gerar uma credencial.

SSH também é uma opção segura, mas exige preparação: gerar um par de chaves, proteger a chave privada, carregar a chave no agente SSH e cadastrar a chave pública na plataforma. Organizações com login único ainda podem exigir a autorização da chave. Se essas etapas não foram concluídas, uma URL SSH fará o primeiro `push` falhar.

> [!WARNING]
> Não coloque PATs, senhas ou outros tokens na URL do remoto, no arquivo do script ou no histórico do terminal. Se a organização exigir um PAT, use escopo mínimo, validade curta e o mecanismo de armazenamento recomendado pela plataforma.

Com a autenticação preparada, envie as branches:

```powershell
git push -u origin main
git push -u origin feature/valida-ambiente
```

O primeiro comando publica a base criada na `main`; o segundo publica a mudança isolada. A opção `-u` associa cada branch local à correspondente remota. Nos próximos envios da branch atual, `git push` será suficiente.

Em um ambiente corporativo, abra um pull request para integrar a mudança à `main`. O pull request cria um espaço para revisão, execução de testes e aplicação de políticas. Ele não substitui commits bem organizados; depende deles para mostrar uma história compreensível.

> [!IMPORTANT]
> Não envie diretamente para `main` quando o repositório exigir revisão. Respeite as políticas de branch, os responsáveis por aprovação e as verificações automatizadas definidas pela equipe.

## Comece o próximo trabalho a partir da base atualizada

Depois que a mudança for integrada, atualize a branch principal antes de iniciar outra tarefa:

```powershell
git switch main
git pull --ff-only origin main
git switch -c docs/documenta-rollback
```

`git pull` busca mudanças do remoto e tenta integrá-las. A opção `--ff-only` aceita apenas uma atualização linear; se as histórias tiverem divergido, o comando para em vez de criar um merge automaticamente. Nesse caso, inspecione a situação e siga o fluxo definido pela equipe.

Use a nova branch para registrar o procedimento de retorno. Crie o arquivo:

```markdown title="ROLLBACK.md"
# Rollback do laboratório

1. Suspenda novas execuções do pipeline.
2. Identifique o último commit validado.
3. Execute o procedimento de reversão aprovado pela equipe.
4. Valide o serviço e registre as evidências.
```

Revise e registre apenas esse documento:

```powershell
git add ROLLBACK.md
git diff --staged
git commit -m "docs: documenta rollback do deploy"
git push -u origin docs/documenta-rollback
```

Esse `push` publica a branch de documentação e fecha o mesmo ciclo usado anteriormente: editar, revisar, commitar e enviar. Abra outro pull request se o repositório exigir revisão antes de incorporar o procedimento à `main`.

Quando quiser apenas consultar o remoto, sem integrar nada:

```powershell
git fetch origin
git status
git log --oneline --graph --decorate --all -10
```

`git fetch` atualiza as referências remotas e preserva seu diretório de trabalho. Isso o torna um bom primeiro passo antes de decidir entre merge, rebase ou outra estratégia.

## Entenda e resolva conflitos

Um conflito ocorre quando o Git não consegue escolher sozinho como combinar mudanças. Isso costuma acontecer quando duas branches alteram a mesma região de um arquivo ou quando uma edita um arquivo que a outra removeu. Duas pessoas modificarem o mesmo arquivo não produz um conflito necessariamente: o problema surge quando o Git não consegue conciliar os resultados com segurança.

Não significa que o repositório foi corrompido; significa que uma decisão humana é necessária.

![Ilustração de duas branches com versões diferentes convergindo para uma profissional que compara as mudanças e produz um arquivo resolvido.](/images/posts/git-para-quem-esta-comecando-em-devops/conflito-entre-branches.webp)

### Gere um conflito controlado

Faça este exercício somente no repositório do laboratório. Comece a partir da `main` atualizada e crie uma branch que permita o ambiente de recuperação de desastre, `dr`:

```powershell
git switch main
git pull --ff-only origin main
git switch -c laboratorio/aceita-dr
```

Em `scripts/deploy.ps1`, substitua a linha de validação por:

```powershell title="scripts/deploy.ps1"
[ValidateSet('dev', 'hml', 'prd', 'dr')]
```

Registre a primeira alternativa:

```powershell
git add scripts/deploy.ps1
git commit -m "feat: aceita ambiente de recuperacao"
```

Volte à mesma base e crie outra branch:

```powershell
git switch main
git switch -c laboratorio/aceita-qa
```

Agora altere exatamente a mesma linha, mas inclua `qa` em vez de `dr`:

```powershell title="scripts/deploy.ps1"
[ValidateSet('dev', 'qa', 'hml', 'prd')]
```

Registre a segunda alternativa:

```powershell
git add scripts/deploy.ps1
git commit -m "feat: aceita ambiente de qualidade"
```

As duas branches partiram do mesmo commit e modificaram a mesma linha de maneiras diferentes. Tente combiná-las:

```powershell
git merge laboratorio/aceita-dr
```

O merge deve parar com uma mensagem de conflito. Isso é o resultado esperado do exercício. Inspecione o estado e o arquivo:

```powershell
git status
Get-Content scripts/deploy.ps1
```

O Git lista `scripts/deploy.ps1` como não mesclado. Dentro dele, a região disputada terá marcadores semelhantes a estes:

```text
<<<<<<< HEAD
[ValidateSet('dev', 'qa', 'hml', 'prd')]
=======
[ValidateSet('dev', 'hml', 'prd', 'dr')]
>>>>>>> laboratorio/aceita-dr
```

`HEAD` representa a branch atual, `laboratorio/aceita-qa`; o trecho abaixo de `=======` veio da branch que você tentou mesclar. Neste laboratório, a decisão é aceitar os dois ambientes. Remova os marcadores e deixe a linha assim:

```powershell title="scripts/deploy.ps1"
[ValidateSet('dev', 'qa', 'hml', 'prd', 'dr')]
```

Teste os dois valores, confira se não restaram marcadores e conclua o merge:

```powershell
./scripts/deploy.ps1 -Ambiente qa
./scripts/deploy.ps1 -Ambiente dr
git diff --check
git add scripts/deploy.ps1
git commit -m "chore: resolve conflito de ambientes"
git status
```

O diretório volta a ficar limpo, e o histórico passa a registrar a resolução. As branches `laboratorio/aceita-qa` e `laboratorio/aceita-dr` foram criadas apenas localmente; não é necessário enviá-las ao remoto.

Em um conflito real, se você ainda não sabe qual resultado é válido, não improvise. Antes de registrar a resolução, cancele o merge e peça contexto:

```powershell
git merge --abort
```

Em DevOps, um conflito em uma regra de firewall, variável de ambiente ou etapa de pipeline pode ser sintaticamente simples e operacionalmente perigoso. A resolução precisa considerar o efeito no ambiente, não apenas fazer o Git parar de reclamar.

## Desfaça mudanças com o comando adequado

“Desfazer” pode significar coisas diferentes. Antes de executar um comando, identifique onde a mudança está:

| Situação | Comando | Efeito |
| --- | --- | --- |
| Arquivo foi adicionado ao staging por engano | `git restore --staged <ARQUIVO>` | Retira do próximo commit e mantém a edição local |
| Edição local de arquivo rastreado deve ser descartada | `git restore <ARQUIVO>` | Restaura o arquivo e descarta a edição não commitada |
| Commit compartilhado introduziu um erro | `git revert <HASH_DO_COMMIT>` | Cria um novo commit que aplica a operação inversa |
| Merge em andamento deve ser cancelado | `git merge --abort` | Retorna ao estado anterior ao início do merge, quando possível |

### Pratique a diferença entre staging e edição local

No repositório do laboratório, faça uma alteração temporária e adicione-a ao staging:

```powershell
Add-Content -Path README.md -Value "Anotação temporária"
git add README.md
git status
```

Agora retire o arquivo do próximo commit e inspecione o resultado:

```powershell
git restore --staged README.md
git status
git diff
```

O `README.md` deixa de estar no staging, mas a anotação permanece no diretório de trabalho. Esse é o ponto central: `git restore --staged` muda a seleção do próximo commit; não apaga sua edição.

> [!CAUTION]
> `git restore <ARQUIVO>` descarta alterações locais que não estejam salvas em outro lugar. Confira `git diff` antes. Evite `git reset --hard` enquanto estiver aprendendo: ele pode mover referências e eliminar alterações do diretório de trabalho.

Depois de confirmar que está no laboratório e que a única diferença é a anotação temporária, descarte-a:

```powershell
git restore README.md
git status
```

Em branches compartilhadas, `git revert` costuma ser mais seguro porque preserva o histórico. Reescrever commits que outras pessoas já baixaram pode obrigar toda a equipe a reconciliar histórias diferentes.

## Valide antes do pull request

Uma revisão eficiente começa antes de abrir o pull request. Execute:

```powershell
git status
git diff --check
git log --oneline origin/main..HEAD
git diff origin/main...HEAD
```

Esses comandos respondem, respectivamente:

1. há arquivos esquecidos ou mudanças fora do staging?
2. o diff contém problemas comuns de espaços em branco?
3. quais commits existem apenas na sua branch?
4. qual é o conteúdo acumulado da mudança desde a base comum?

Depois, execute os validadores do projeto. Exemplos:

```powershell
# PowerShell
Invoke-ScriptAnalyzer -Path ./scripts

# Terraform
terraform fmt -check -recursive
terraform validate

# Projeto Node.js
pnpm test
```

Use somente os comandos previstos no repositório. A presença de um exemplo nesta lista não significa que a ferramenta esteja instalada ou configurada no seu projeto.

Por fim, revise o pull request como se você fosse a pessoa de plantão que receberá um alerta de madrugada:

- o título explica o resultado?
- a descrição informa motivo, teste, risco e rollback?
- cada commit trata de um assunto coerente?
- o diff contém credenciais, dados pessoais ou nomes de clientes?
- a mudança altera permissões, custos, disponibilidade ou retenção?
- outra pessoa consegue validar sem depender de uma conversa privada?

## Segurança, autoria e licenças

Um repositório organizado também precisa de limites claros:

- conceda acesso pelo princípio do menor privilégio;
- use branches protegidas e revisão para mudanças sensíveis;
- mantenha segredos fora dos arquivos versionados;
- não use o Git como substituto do backup de artefatos e dados operacionais;
- não versione binários gerados quando eles puderem ser reproduzidos;
- não copie scripts, módulos, imagens ou documentação sem verificar a licença e a autorização de uso.

Um repositório público não transforma automaticamente o conteúdo em domínio público. Ao incorporar material de terceiros, preserve avisos de copyright, atribuições e textos de licença exigidos. Registre a origem e confirme se a licença é compatível com a forma de uso e distribuição do seu projeto. Em caso de dúvida, consulte a política da organização ou orientação jurídica.

Para conteúdo próprio, um arquivo `LICENSE` deixa mais claro o que outras pessoas podem fazer. Licença de código, licença de documentação e termos de serviços externos podem ser diferentes; trate cada material de acordo com sua origem.

## O fluxo em uma página

Ao começar uma tarefa:

```powershell
git switch main
git pull --ff-only origin main
git switch -c <TIPO>/<DESCRICAO-CURTA>
```

Durante o trabalho:

```powershell
git status
git diff
# execute os testes do projeto
git add <ARQUIVOS_DA_MUDANCA>
git diff --staged
git commit -m "<TIPO>: <INTENCAO_DA_MUDANCA>"
```

Antes da revisão:

```powershell
git fetch origin
git log --oneline origin/main..HEAD
git diff origin/main...HEAD
git push -u origin <NOME_DA_BRANCH>
```

Os nomes entre `<` e `>` são valores que você deve substituir.

## Referências

- [Pro Git: sobre controle de versão](https://git-scm.com/book/en/v2/Getting-Started-About-Version-Control?wt.mc_id=studentamb_365381)
- [Pro Git: registrando mudanças no repositório](https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository?wt.mc_id=studentamb_365381)
- [Pro Git: branches em poucas palavras](https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell?wt.mc_id=studentamb_365381)
- [Documentação do `git-add`](https://git-scm.com/docs/git-add?wt.mc_id=studentamb_365381)
- [Documentação do `git-restore`](https://git-scm.com/docs/git-restore?wt.mc_id=studentamb_365381)
- [Documentação do `git-revert`](https://git-scm.com/docs/git-revert?wt.mc_id=studentamb_365381)
- [Conventional Commits 1.0.0](https://www.conventionalcommits.org/pt-br/v1.0.0/?wt.mc_id=studentamb_365381)
- [GitHub Docs: ignorando arquivos](https://docs.github.com/en/get-started/git-basics/ignoring-files?wt.mc_id=studentamb_365381)
- [GitHub Docs: armazenando credenciais HTTPS no Git](https://docs.github.com/en/get-started/git-basics/caching-your-github-credentials-in-git?wt.mc_id=studentamb_365381)
- [GitHub Docs: conectando-se com SSH](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/about-ssh?wt.mc_id=studentamb_365381)
- [GitHub Docs: armazenando segredos com segurança](https://docs.github.com/en/get-started/learning-to-code/storing-your-secrets-safely?wt.mc_id=studentamb_365381)
- [Microsoft Learn: usando o Git Credential Manager com Azure Repos](https://learn.microsoft.com/azure/devops/repos/git/set-up-credential-managers?view=azure-devops&wt.mc_id=studentamb_365381)
- [Microsoft Learn: protegendo segredos no Azure PowerShell](https://learn.microsoft.com/powershell/azure/protect-secrets?view=azps-15.2.0&wt.mc_id=studentamb_365381)
- [Microsoft Learn: segredos no Azure Pipelines](https://learn.microsoft.com/azure/devops/pipelines/security/secrets?view=azure-devops&wt.mc_id=studentamb_365381)

## Conclusão

Na próxima sexta-feira às 17h47, o objetivo não é ter um arquivo chamado `final-v4`. É encontrar uma branch com escopo claro, commits que expliquem a decisão, testes registrados no pull request e uma forma segura de reverter o que foi publicado.

Git não elimina falhas. Ele transforma mudanças em evidências: mostra o que aconteceu, preserva o contexto e permite que a equipe colabore sem depender de arquivos duplicados ou memória individual.

Comece com quatro hábitos: consulte `git status`, leia o diff, faça commits pequenos e nunca versione segredos. O restante do Git se torna mais simples quando essa base está sólida.
