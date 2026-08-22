---
title: 'Governança de Identidades no Microsoft 365: Automatizando o ciclo de vida e PIM com Entra ID Governance'
description: 'Automatize entrada, movimentação, saída, revisões e privilégios JIT no Microsoft 365 com o Microsoft Entra ID Governance.'
pubDate: 2026-08-23
author: 'Thiago Kusal'
authorUrl: 'https://tkusal.com.br'
lang: pt-br
categories: ['Microsoft 365']
tags: ['Azure', 'Entra ID', 'IAM', 'Segurança', 'PowerShell', 'Intermediário']
cover: '/images/posts/governanca-identidades-m365-entra-id/capa.webp'
coverAlt: 'Ilustração isométrica de crachás, engrenagens e um fluxo de aprovação flutuando sobre a logo do Microsoft Entra ID.'
toc: true
comments: true
draft: true
---

## Introdução: Quando o acesso funciona, mas a operação não

O tenant já exige autenticação multifator. As políticas de Acesso Condicional estão em produção. Mesmo assim, a equipe de TI começa toda segunda-feira copiando dados de chamados, adicionando pessoas a grupos e perguntando quem aprovou determinado acesso. Na sexta-feira, alguém descobre uma conta administrativa ativa desde o projeto do ano passado. A segurança melhorou, mas a operação continua dependente de memória, planilha e sorte.

É aqui que a segurança e a governança se separam. A segurança decide se uma tentativa de acesso pode prosseguir. A governança responde quem deveria ter acesso, por qual motivo, durante quanto tempo e quem precisa revisar essa decisão.

Dra. Anna Bette Bírquin, Pesquisadora Sênior da fictícia Umbrella do Brasil S.A., trabalhará no Laboratório NEST. No domínio `umbrella.com.br`, seu nome de usuário e UPN serão `anna.birquin` e `anna.birquin@umbrella.com.br`. Na jornada, assume novas responsabilidades, administra o Exchange Online numa janela de manutenção e depois deixa a organização. O objetivo é tornar a TI quase invisível para Anna: o acesso certo aparece no momento necessário, pede aprovação quando deve e desaparece quando perde a justificativa.

Chamaremos essa jornada de **JML**, sigla para _Joiner, Mover e Leaver_: entrada, movimentação e saída. Usaremos Lifecycle Workflows para tarefas orientadas a datas, Entitlement Management para autoatendimento governado, Access Reviews para recertificação e Privileged Identity Management, ou PIM, para privilégio temporário.

### Resultado esperado

Ao final, você terá um laboratório verificável para:

- preparar a entrada de Anna a partir de `employeeHireDate`;
- entregar um pacote de acesso aprovado pelo gestor quando suas responsabilidades ou necessidades de acesso mudarem;
- tornar Exchange Administrator elegível, sem privilégio ativo permanente;
- revisar trimestralmente as atribuições do pacote;
- revogar privilégios administrativos, bloquear a conta, revogar sessões e remover acessos e licenças diretas na saída;

Os scripts estão no repositório [Automatizando o ciclo de vida JML e PIM com Entra ID Governance](https://github.com/tkusal/Automatizando-o-ciclo-de-vida-JML-e-PIM-com-Entra-ID-Governance). Eles começam em modo de simulação e não incluem credenciais, segredos nem identificadores reais.

### Como os dados entram no laboratório

Sem integração com RH, a admissão começa por chamado. O analista executa `05-new-cloud-user.ps1` com dados aprovados e `RequestId`. Esse valor aparece na saída, sem gravação no Entra ou em log local (em produção, persista esse ID em um atributo apropriado para manter o rastro de auditoria. Em usuários cloud-only, pode ser utilizado um `onPremisesExtensionAttributes.extensionAttributeX`; em identidades sincronizadas, grave o valor na fonte autoritativa). Quando o workflow estiver agendado e a identidade atender às condições de execução, o Lifecycle Workflows encontrará a conta criada e executará o Joiner; ele não executa o `.ps1`.

## A jornada da identidade e a arquitetura JML

O Joiner começa antes do primeiro login. Dados como área, gestor e data de contratação precisam estar corretos para que uma regra encontre Anna. O Mover acontece quando cargo, projeto ou responsabilidade mudam. É a fase em que surge o _privilege creep_, o acúmulo silencioso de permissões antigas. O Leaver encerra acessos e sessões conforme a data e o risco do desligamento.

PIM e Access Reviews atravessam essas três fases. PIM reduz o tempo durante o qual um privilégio fica ativo. A revisão pergunta periodicamente se uma decisão passada ainda é válida.

![Diagrama da jornada de identidade de Anna, dividido nas fases Joiner, Mover e Leaver, com PIM, Access Reviews e auditoria como controles transversais.](/images/posts/governanca-identidades-m365-entra-id/jornada-identidade-jml.svg)

| Componente                 | Decisão automatizada                                              |
| -------------------------- | ----------------------------------------------------------------- |
| Lifecycle Workflows        | Quando executar tarefas de entrada ou saída e para quais pessoas  |
| Entitlement Management     | Quais recursos formam um pacote, quem solicita e quem aprova      |
| PIM                        | Quando um privilégio elegível pode ficar ativo e por quanto tempo |
| Access Reviews             | Quem confirma periodicamente se o acesso continua necessário      |
| Microsoft Graph PowerShell | Como consultar, criar e validar configurações de forma repetível  |

## Pré-requisitos e preparação do laboratório

Use uma identidade fictícia, um departamento piloto e recursos sem dados de produção. Mantenha duas contas de emergência fora de filtros, grupos e unidades administrativas do laboratório. As políticas de MFA e Acesso Condicional já devem existir, pois configurá-las não faz parte deste artigo.

### Licenças, funções e escopos

Para reproduzir o cenário, considere Microsoft Entra ID Governance ou Microsoft Entra Suite. Algumas capacidades também existem no Microsoft Entra ID P2, mas Lifecycle Workflows não está incluído em P2 isoladamente. Valide o contrato antes do piloto.

| Etapa                        | Função administrativa de menor privilégio             | Escopo delegado principal                                  |
| ---------------------------- | ----------------------------------------------------- | ---------------------------------------------------------- |
| Criar Anna e atribuir gestor | User Administrator                                    | `User.ReadWrite.All`                                       |
| Lifecycle Workflows          | Lifecycle Workflows Administrator                     | `LifecycleWorkflows.ReadWrite.All`                         |
| Catálogo e pacote            | Identity Governance Administrator ou Catalog owner    | `EntitlementManagement.ReadWrite.All`                      |
| Política do pacote           | Access Package Manager ou função superior no catálogo | `EntitlementManagement.ReadWrite.All`                      |
| Elegibilidade e política PIM | Privileged Role Administrator                         | `RoleEligibilitySchedule.ReadWrite.Directory`              |
| Ativação pela própria Anna   | Usuária elegível                                      | `RoleAssignmentSchedule.ReadWrite.Directory`               |
| Descoberta dos recursos      | Leitor adequado para cada objeto                      | `User.Read.All`, `Group.Read.All` e `Application.Read.All` |
| Consulta de licenças         | Directory Reader ou função equivalente                | `LicenseAssignment.Read.All`                               |

Escopo OAuth sozinho não concede a função administrativa; a conta precisa de ambas as autorizações. Catalog owner adiciona recursos; Access Package Manager cria pacotes com recursos disponíveis.

### Estação administrativa

PowerShell 7 é recomendado. O Microsoft Graph PowerShell SDK também funciona no Windows PowerShell 5.1, mas não misture versões e perfis durante o laboratório.

```powershell
$PSVersionTable.PSVersion
Install-Module Microsoft.Graph -Scope CurrentUser
Get-InstalledModule Microsoft.Graph* |
  Sort-Object Name |
  Select-Object Name, Version

git clone https://github.com/tkusal/Automatizando-o-ciclo-de-vida-JML-e-PIM-com-Entra-ID-Governance.git iam-governance-lab
Set-Location .\iam-governance-lab
.\scripts\00-connect-graph.ps1
```

O último comando solicita apenas escopos de leitura. Para escrita, escolha entre `UserProvisioning`, `Lifecycle`, `Entitlement`, `PimEligibility` e `PimActivation`. Confirme conta, tenant e escopos com `Get-MgContext`.

### Preparar Anna e os recursos

Com função User Administrator, o analista transfere para o script os dados do chamado aprovado:

```powershell
.\scripts\00-connect-graph.ps1 -WriteProfile UserProvisioning

.\scripts\05-new-cloud-user.ps1 `
  -RequestId '<REQUEST_ID>' `
  -UserPrincipalName 'anna.birquin@umbrella.com.br' `
  -DisplayName 'Anna Bette Bírquin' `
  -GivenName 'Anna' `
  -Surname 'Bírquin' `
  -JobTitle 'Pesquisadora Sênior' `
  -Department 'Laboratório NEST' `
  -UsageLocation 'BR' `
  -ManagerUserId '<MANAGER_USER_ID>' `
  -EmployeeHireDate '2026-09-01T12:00:00Z'
```

Sem `-Apply`, o script simula. Depois, repita com `-Apply -WhatIf` e, por fim, `-Apply`. Ele valida domínio, duplicidade, gestor e email; gera uma senha não revelada; cria a conta; e atribui o gestor. Anna usará o TAP no primeiro acesso (bootstrap). Se o AD local for a fonte autoritativa, não use o script: crie a conta lá e deixe a sincronização propagá-la.

| Dado               | Valor de exemplo       | Por que importa                                    |
| ------------------ | ---------------------- | -------------------------------------------------- |
| `department`       | `Laboratório NEST`     | Limita o escopo dos workflows                      |
| `employeeHireDate` | `2026-09-01T12:00:00Z` | Aciona o Joiner                                    |
| `manager`          | ID do gestor de Anna   | Recebe o TAP, aprova e revisa                      |
| `mail` do gestor   | Endereço válido        | Permite a entrega das notificações                 |
| `usageLocation`    | `BR`                   | Evita falhas posteriores na atribuição de licenças |

> [!IMPORTANT]
> Preencha `usageLocation` antes das licenças. Use o código de duas letras do país ou região, como `BR`, para validar a disponibilidade legal dos serviços. Sem isso, atribuições diretas ou por grupo podem falhar.

Use UTC e horário coerente com o expediente. Em produção, a fonte autoritativa mantém os atributos.

```powershell
$Anna = Get-MgUser -UserId 'anna.birquin@umbrella.com.br' `
  -Property Id,DisplayName,Department,EmployeeHireDate,EmployeeLeaveDateTime,Mail,UsageLocation

$Anna | Format-List
Get-MgUserManager -UserId $Anna.Id | Format-List Id,AdditionalProperties
Get-MgSubscribedSku | Select-Object SkuPartNumber, ConsumedUnits
```

`Get-MgSubscribedSku` acima só consulta disponibilidade; para atribuir de fato, use **Microsoft 365 admin center > Users > Active users > Anna > Licenses and apps**. Nesta etapa, `employeeLeaveDateTime` estará vazio; ele só será preenchido no desligamento.

Prepare um catálogo `Laboratório NEST`, um grupo Microsoft 365 associado ao Teams, um site SharePoint, um aplicativo corporativo no Entra e usuários distintos para aprovação, fallback e PIM. O aplicativo deve expor uma função, como `Default Access`.

## O primeiro dia: Lifecycle Workflows no Joiner

Um **Temporary Access Pass**, ou TAP, é uma credencial temporária usada no primeiro registro de métodos de autenticação. No nosso fluxo, uma tarefa nativa gera um TAP de uso único por oito horas e o envia ao gestor. A política de TAP precisa permitir 480 minutos e incluir Anna ou o grupo piloto.

Os 480 minutos são um valor didático para este laboratório. Em produção, ajuste o tempo de vida do TAP à janela real de onboarding e à política de segurança da organização, utilizando o menor período operacionalmente adequado. A tarefa do Lifecycle Workflows aceita valores entre 10 e 43.200 minutos. O TAP serve para o primeiro acesso, recuperação e registro de métodos passwordless resistentes a phishing, como passkeys e Windows Hello for Business (importante: em TAP de uso único, o registro de um novo método passwordless deve ser concluído em até 10 minutos após o login). Não é credencial contínua nem substituto da senha.

Essa estratégia também acompanha a transição dos métodos de autenticação do Microsoft Entra ID. A partir de 1º de setembro de 2026, usuários habilitados para SMS ou chamadas de voz serão automaticamente habilitados para passkeys e incentivados a registrá-las. Em 1º de fevereiro de 2027, a Microsoft descontinuará a entrega nativa de SMS e voz; organizações que ainda necessitem desses canais deverão utilizar um provedor de telecomunicações gerenciado pelo cliente. Por isso, novos fluxos de onboarding devem priorizar métodos resistentes a phishing, como passkeys e Windows Hello for Business.

### Antes de configurar

No centro de administração do Microsoft Entra, abra **Entra ID > Authentication methods > Policies > Temporary Access Pass**. Habilite o método para o grupo piloto. Em **Configure**, defina mínimo igual ou inferior a 480 minutos, máximo igual ou superior a 480, uso único compatível com o laboratório e comprimento conforme a política interna. Não inclua contas de emergência.

A tarefa `Generate TAP and Send Email` exige gestor e email válidos. Ela também foi desenhada para identidades novas sem métodos de autenticação, sessões anteriores ou funções administrativas. Se Anna já usou a conta, crie outra identidade descartável para o teste.

### Configurar pelo portal

1. Acesse **ID Governance > Lifecycle workflows > Workflows > Create workflow**.
2. Selecione o modelo de entrada que gera TAP e envia email ao gestor.
3. Nomeie como `JML | Onboarding | Laboratório NEST` e mantenha o workflow habilitado.
4. Em escopo, use uma regra limitada a `department eq 'Laboratório NEST'`.
5. Escolha o gatilho baseado em `employeeHireDate`, com deslocamento de zero dia.
6. Na tarefa de TAP, informe duração de 480 minutos e uso único.
7. Conclua com o agendamento desligado.

### Automatizar com simulação

O script consulta a definição nativa da tarefa, monta o payload e só cria o workflow com `-Apply`. O primeiro comando abaixo apenas imprime o JSON. O segundo passa pela proteção `WhatIf` e também não altera o tenant.

```powershell
.\scripts\10-new-joiner-workflow.ps1 -Department 'Laboratório NEST'

.\scripts\10-new-joiner-workflow.ps1 `
  -Department 'Laboratório NEST' `
  -Apply `
  -WhatIf
```

Depois da revisão, execute com `-Apply`, ainda sem `-EnableSchedule`. No portal, abra o workflow e escolha **Run on demand > Add users > Anna > Run workflow**. A execução sob demanda ignora o filtro e a data, portanto confira a identidade selecionada. Aguarde o histórico indicar `Completed` e confirme que o gestor recebeu o TAP. Só então habilite a agenda.

> [!NOTE]
> Um gatilho baseado em data não executa em hora exata. A agenda é avaliada a cada três horas por padrão, com intervalo configurável de uma a 24 horas. Ao atingir `employeeHireDate` ou `employeeLeaveDateTime`, a identidade entra no próximo ciclo aplicável. O Entra mantém uma janela de recuperação de três dias para condições perdidas. Em laboratório, execute sob demanda e acompanhe o histórico.

### Validar e reverter

Em **Workflow history**, confira os resumos por usuário, execução e tarefa. Um workflow criado não prova que encontrou a pessoa correta. Se houver erro, mantenha a agenda desligada, corrija atributo, gestor ou política de TAP e repita com uma identidade nova. Para reverter o piloto, desabilite o agendamento, exclua o workflow de teste e remova o TAP da usuária em **Authentication methods**. Um TAP já usado ou expirado não deve ser reutilizado.

## A mudança de responsabilidade e o autoatendimento no Mover

Meses depois, Anna assume uma nova linha de pesquisa dentro do Laboratório NEST. O cargo continua Pesquisadora Sênior, mas o conjunto de recursos muda. O modelo manual adicionaria novos grupos e deixaria os antigos para uma limpeza futura. O Entitlement Management muda a unidade da decisão. Em vez de conceder recursos isolados, publicamos o pacote `Laboratório NEST | Pesquisadora Sênior` com associação ao Teams, acesso ao SharePoint e uma função no aplicativo corporativo.

O pacote não deve incluir Exchange Administrator. Acesso de negócio e privilégio administrativo têm riscos diferentes e merecem fluxos diferentes.

### Localizar os identificadores

O script precisa de IDs reais do catálogo, grupo, service principal e fallback. Consulte-os, não copie valores de outra documentação.

```powershell
Get-MgEntitlementManagementCatalog -All |
  Select-Object DisplayName, Id

Get-MgGroup -Filter "displayName eq 'Laboratório NEST | Teams'" |
  Select-Object DisplayName, Id, GroupTypes

Get-MgServicePrincipal -Filter "displayName eq 'Aplicativo NEST'" |
  Select-Object DisplayName, Id, AppId

Get-MgUser -UserId '<APPROVER_USER_PRINCIPAL_NAME>' |
  Select-Object DisplayName, Id, UserPrincipalName
```

O ID esperado para a aplicação é o `Id` do **service principal**, não o `AppId` do registro de aplicativo. Para SharePoint, use a URL completa do site, sem página ou biblioteca no final.

### Configurar pelo portal

1. Abra **ID Governance > Entitlement management > Catalogs** e crie ou selecione `Laboratório NEST`.
2. Em **Resources**, adicione o grupo ou Teams, o aplicativo corporativo e o site do SharePoint.
3. Abra **Access packages > New access package**. Informe `Laboratório NEST | Pesquisadora Sênior`, a descrição e o catálogo.
4. Em **Resource roles**, escolha `Member` para grupo e SharePoint e a função definida pelo aplicativo.
5. Em **Requests**, selecione usuários do diretório e habilite solicitação pelo próprio usuário.
6. Exija aprovação, escolha **Manager as approver**, adicione o fallback e dê cinco dias para a decisão.
7. Exija justificativa do aprovador e defina expiração da atribuição em 180 dias.
8. Crie a política e mantenha o pacote visível apenas para a população que deve solicitá-lo.

O gestor vem do atributo `manager`. Se não for encontrado, o fallback configurado recebe a solicitação. O Entra não escolhe automaticamente o administrador; por isso, o script exige `FallbackApproverUserId` e um responsável explícito. Teste a solicitação no portal **My Access** com Anna (em sua sessão) e confirme a notificação e aprovação com a conta do gestor (em outra sessão isolada).

### Automatizar com simulação

```powershell
.\scripts\20-new-access-package.ps1 `
  -CatalogId '<CATALOG_ID>' `
  -GroupId '<TEAM_GROUP_ID>' `
  -ApplicationServicePrincipalId '<SERVICE_PRINCIPAL_ID>' `
  -SharePointSiteUrl '<SHAREPOINT_SITE_URL>' `
  -FallbackApproverUserId '<APPROVER_USER_ID>' `
  -AccessPackageName 'Laboratório NEST | Pesquisadora Sênior' `
  -ApplicationRoleName '<APPLICATION_ROLE_NAME>'
```

No DryRun, recursos ausentes são mostrados como solicitações propostas. Use `-Apply -WhatIf` para conferir alvos e depois `-Apply` somente no tenant de laboratório. A saída aplicada informa `AccessPackageId` e `AssignmentPolicyId`. Guarde ambos para a revisão trimestral.

### Validar e reverter

Solicite o pacote como Anna, aprove como gestor e confirme a atribuição nos três recursos. Verifique também a data de expiração e o histórico da solicitação. Para desfazer, remova primeiro a atribuição de Anna. Depois oculte ou desabilite a política. Exclua pacote e recursos do catálogo somente após confirmar que não existem outras políticas ou atribuições dependentes. Apagar o catálogo cedo demais transforma uma correção simples em caça ao acesso órfão.

## Zero Standing Privileges com PIM

**Zero Standing Privileges** significa não manter privilégios administrativos ativos sem necessidade. Um Privileged Role Administrator torna Anna elegível para Exchange Administrator por 90 dias. Anna ativa a função por até duas horas antes da manutenção. A política da função decide se a plataforma exige MFA, justificativa, chamado e aprovação.

### Configurar a política e a elegibilidade

1. Acesse **ID Governance > Privileged Identity Management > Microsoft Entra roles > Roles**.
2. Abra **Exchange Administrator > Role settings > Edit**.
3. Defina duração máxima de ativação em duas horas.
4. Exija MFA, justificativa e número do chamado, lembrando que o PIM não o valida no sistema de Service Desk.
5. Exija aprovação e escolha pelo menos dois aprovadores específicos.
6. Revise notificações para ativação, atribuição e renovação, depois selecione **Update**.
7. Em **Assignments > Add assignments**, selecione Anna e marque **Eligible**, com início e expiração em 90 dias. Não use `Active`.

Evite um bloqueio administrativo: mantenha contas de emergência e aprovadores ativos capazes de processar a solicitação. As configurações são específicas por função, então alterar Exchange Administrator não muda as demais funções.

### Automatizar e ativar

Faça as operações em sessões separadas. A primeira pertence ao Privileged Role Administrator. A segunda pertence à própria Anna.

```powershell
# $Anna foi resolvida pelo UPN anna.birquin@umbrella.com.br na preparação
# Sessão administrativa, apenas simulação
.\scripts\30-configure-pim-exchange.ps1 `
  -UserId $Anna.Id `
  -RoleDisplayName 'Exchange Administrator' `
  -CreateEligibility `
  -EligibilityJustification '<JUSTIFICATIVA_APROVADA>'

# Sessão de Anna, apenas simulação
.\scripts\30-configure-pim-exchange.ps1 `
  -UserId $Anna.Id `
  -RoleDisplayName 'Exchange Administrator' `
  -Activate `
  -ActivationHours 2 `
  -Justification '<MOTIVO>' `
  -TicketNumber '<NUMERO_CHAMADO>' `
  -TicketSystem '<SISTEMA_DE_CHAMADOS>'
```

Acrescente `-Apply -WhatIf` antes da aplicação real. Anna também pode abrir **PIM > My roles > Microsoft Entra roles > Eligible assignments > Activate**, informar duração, justificativa e chamado, concluir MFA e aguardar aprovação.

### Validar e reverter

Confirme que a atribuição aparece como elegível antes da ativação, como ativa durante a janela e como expirada ao final. Valide os logs de auditoria e a aprovação. Anna pode desativar a função antecipadamente em **My roles**. Para revogar o desenho, remova a elegibilidade em **PIM > Microsoft Entra roles > Assignments**. Não exclua nem altere a definição interna da função.

## Auditoria contínua com Access Reviews

Uma aprovação responde ao contexto de hoje. A revisão de acesso pergunta se a resposta continua válida três meses depois. Para o pacote do Laboratório NEST, o gestor será o revisor primário e um usuário específico será o fallback.

### Configurar pelo portal

1. Abra **ID Governance > Entitlement management > Access packages > Laboratório NEST | Pesquisadora Sênior > Policies**.
2. Edite a política e, em **Lifecycle**, habilite uma revisão recorrente.
3. Escolha o gestor da pessoa como revisor e configure o fallback.
4. Defina recorrência a cada três meses, duração de 14 dias, recomendações habilitadas e justificativa obrigatória.
5. No piloto, escolha **Keep access** quando ninguém responder. Depois de medir notificações e participação dos gestores, avalie **Remove access**.
6. Salve e confirme a data da primeira ocorrência.

O modo padrão do script também usa `keepAccess`. A remoção automática precisa ser solicitada explicitamente.

```powershell
.\scripts\40-enable-quarterly-access-review.ps1 `
  -AssignmentPolicyId '<ASSIGNMENT_POLICY_ID>' `
  -AccessPackageId '<ACCESS_PACKAGE_ID>' `
  -FallbackReviewerUserId '<REVIEWER_USER_ID>' `
  -ReviewStartDate '2026-09-05'
```

Depois de validar o payload, use `-Apply -WhatIf` e então `-Apply`. Para adotar remoção automática, acrescente `-ExpirationBehavior removeAccess` e trate isso como uma mudança de maior risco.

### Validar e reverter

Confirme que a ocorrência foi criada, que o gestor recebeu email e consegue registrar decisão e justificativa em My Access. Compare a decisão com a atribuição do pacote ao término. Para reverter, desabilite `reviewSettings` ou restaure a configuração anterior da política. Se uma revisão já removeu acesso, a reversão exige nova solicitação ou atribuição aprovada. Não existe um botão que desfaça todas as decisões expiradas.

## O desligamento e a limpeza com Lifecycle Workflows

Na saída, o RH autoriza a data e a equipe de identidades preenche `employeeLeaveDateTime`. Antes do bloqueio, são tratadas as atribuições e elegibilidades administrativas aplicáveis. Em seguida, o Leaver cancela solicitações pendentes de pacotes de acesso, bloqueia a conta, revoga sessões, remove atribuições de Access Packages e remove licenças diretas.

> [!NOTE]
> Em conta cloud-only, preencher `employeeLeaveDateTime` exige `User.Read.All`, `User-LifeCycleInfo.ReadWrite.All` e, no fluxo delegado documentado, a função Global Administrator.

Antes de automatizar, inventarie propriedade de grupos, Teams, sites, caixas compartilhadas, aplicativos e recursos do Azure. Transfira responsabilidades e aplique retenção antes de remover licenças. Licenças herdadas por grupo permanecem enquanto Anna continuar no grupo. Acesso local de uma identidade sincronizada também depende do processo no Active Directory e do ciclo de sincronização.

### Configurar pelo portal

1. Abra **ID Governance > Lifecycle workflows > Create workflow** e escolha um modelo Leaver.
2. Nomeie como `JML | Offboarding | Laboratório NEST`.
3. Use `department eq 'Laboratório NEST'` apenas no piloto.
4. Configure `employeeLeaveDateTime` com deslocamento de zero dias.
> [!WARNING]
> A tarefa nativa **Disable user account** não oferece suporte a usuários com atribuições de funções do Microsoft Entra nem a usuários que sejam membros ou proprietários de grupos _role-assignable_. Como Anna recebeu uma elegibilidade PIM para Exchange Administrator neste laboratório, remova previamente as atribuições ou elegibilidades administrativas aplicáveis via PIM ou Microsoft Graph **antes** de executar o bloqueio.

5. Ordene as tarefas: **Cancel all pending access package assignment requests for user**, **Disable user account**, **Revoke all refresh tokens for user**, **Remove all access package assignments for user** e **Remove all licenses for user**.
6. Mantenha `continueOnError` desabilitado no bloqueio e avalie-o nas tarefas seguintes.
7. Crie com a agenda desligada.

```powershell
.\scripts\50-new-leaver-workflow.ps1 -Department 'Laboratório NEST'

.\scripts\50-new-leaver-workflow.ps1 `
  -Department 'Laboratório NEST' `
  -Apply `
  -WhatIf
```

Para um desligamento emergencial, execute sob demanda após conferir a identidade. Lembre que essa execução ignora data e filtro. Para saída planejada, teste com uma conta descartável, revise o histórico e só depois habilite a agenda com `-Apply -EnableSchedule` ou pelo portal.

A cadência do Joiner também vale para `employeeLeaveDateTime`. Em desligamentos urgentes, use o procedimento emergencial aprovado e a execução sob demanda.

### Validar e reverter

Confirme `accountEnabled = false`, falha de novo login, revogação registrada, remoção das licenças diretas e encerramento das atribuições do pacote e PIM. Revogar sessões reduz a janela de uso de tokens, mas alguns aplicativos podem não reagir imediatamente. O bloqueio da conta continua sendo o controle principal.

Se o workflow atingir a pessoa errada, desligue a agenda antes de qualquer correção. Reative a conta, restaure licenças e associações a partir do inventário e refaça as aprovações necessárias. A revogação de sessões não pode ser desfeita; a pessoa terá de autenticar novamente. Em usuários sincronizados, corrija também a fonte autoritativa para evitar que a próxima sincronização reverta sua recuperação.

## Validação integrada, riscos e licenciamento

Ao fim do piloto, reúna evidências de cada controle, não apenas prints da tela de criação.

```powershell
# Reutilize $Anna, obtida pelo UPN anna.birquin@umbrella.com.br
Get-MgContext | Select-Object Account, TenantId, Scopes

Get-MgIdentityGovernanceLifecycleWorkflow -All |
  Select-Object DisplayName, Category, IsEnabled, IsSchedulingEnabled

Get-MgEntitlementManagementAccessPackage -All |
  Select-Object DisplayName, Id

Get-MgRoleManagementDirectoryRoleEligibilitySchedule `
  -Filter "principalId eq '$($Anna.Id)'" -All
```

Para amarrar a evidência à identidade, conecte com `AuditLog.Read.All` usando uma função de leitura compatível, como Reports Reader, e filtre os recursos-alvo pelo ID de Anna:

```powershell
Connect-MgGraph -Scopes 'AuditLog.Read.All'
$auditFilter = "targetResources/any(t:t/id eq '$($Anna.Id)')"

Get-MgAuditLogDirectoryAudit -Filter $auditFilter -All |
  Sort-Object ActivityDateTime -Descending |
  Select-Object ActivityDateTime, ActivityDisplayName, Result, CorrelationId
```

O aceite do laboratório deve provar:

- Joiner executado para a Anna de teste, com TAP entregue ao gestor e histórico concluído;
- solicitação, aprovação, expiração e três recursos do pacote registrados;
- elegibilidade PIM sem atribuição ativa permanente e ativação encerrada após duas horas;
- revisão criada com gestor, fallback, recorrência e comportamento de expiração corretos;
- Leaver executado na ordem prevista, com privilégios administrativos tratados, conta bloqueada, sessões revogadas, Access Packages encerrados e licenças diretas removidas;
- procedimento de reversão ensaiado com a conta descartável.

Há impacto de custo, pois as pessoas que recebem, solicitam, aprovam ou revisam acesso podem entrar na contagem de licenças, conforme o recurso. Não use preço fixo como critério de arquitetura. Valide os fundamentos oficiais de licenciamento e o contrato da organização.

> [!CAUTION]
> Não teste remoção automática, bloqueio de conta ou políticas PIM diretamente em produção. Use identidades descartáveis, mantenha contas de emergência fora do escopo, exporte o estado anterior e registre quem pode desligar a agenda ou restaurar uma atribuição.

## Conclusão

No começo, Anna era mais um conjunto de tarefas espalhadas por chamados. Com atributos confiáveis, JML, pacotes de acesso, PIM e revisões, sua jornada passa a ter gatilhos, responsáveis, prazos, validações e evidências.

A automação não elimina decisões humanas. O RH informa datas e atributos. O gestor aprova a necessidade de negócio. A plataforma aplica regras repetíveis. A segurança limita privilégios e observa exceções. A auditoria recebe histórico em vez de uma planilha reconstruída às pressas.

Comece com um departamento, um pacote, uma função privilegiada e uma revisão. Amplie somente quando o piloto provar que atributos, aprovadores, notificações e reversão funcionam. A TI invisível não é a que desaparece. É a que deixa de ser gargalo sem perder controle.

## Referências primárias

- [Criar usuário com Microsoft Graph](https://learn.microsoft.com/graph/api/user-post-users?view=graph-rest-1.0&wt.mc_id=studentamb_365381)
- [Atribuir gestor ao usuário](https://learn.microsoft.com/graph/api/user-post-manager?view=graph-rest-1.0&wt.mc_id=studentamb_365381)
- [Planejar uma implantação de Lifecycle Workflows](https://learn.microsoft.com/entra/id-governance/lifecycle-workflows-deployment?wt.mc_id=studentamb_365381)
- [Condições de execução e agendamento de Lifecycle Workflows](https://learn.microsoft.com/entra/id-governance/lifecycle-workflow-execution-conditions?wt.mc_id=studentamb_365381)
- [Executar um workflow sob demanda](https://learn.microsoft.com/entra/id-governance/on-demand-workflow?wt.mc_id=studentamb_365381)
- [Configurar argumentos das tarefas de Lifecycle Workflows](https://learn.microsoft.com/graph/identitygovernance-lifecycleworkflows-task-arguments?wt.mc_id=studentamb_365381)
- [Definir employeeLeaveDateTime com Microsoft Graph](https://learn.microsoft.com/graph/tutorial-lifecycle-workflows-set-employeeleavedatetime?wt.mc_id=studentamb_365381)
- [Configurar Temporary Access Pass](https://learn.microsoft.com/entra/identity/authentication/howto-authentication-temporary-access-pass?wt.mc_id=studentamb_365381)
- [Atribuir licenças do Microsoft 365 a contas de usuário](https://learn.microsoft.com/microsoft-365/enterprise/assign-licenses-to-user-accounts?view=o365-worldwide&wt.mc_id=studentamb_365381)
- [Criar um pacote de acesso](https://learn.microsoft.com/entra/id-governance/entitlement-management-access-package-create?wt.mc_id=studentamb_365381)
- [Criar uma política de atribuição](https://learn.microsoft.com/graph/api/entitlementmanagement-post-assignmentpolicies?view=graph-rest-1.0&wt.mc_id=studentamb_365381)
- [Configurar definições de função no PIM](https://learn.microsoft.com/entra/id-governance/privileged-identity-management/pim-how-to-change-default-settings?wt.mc_id=studentamb_365381)
- [Ativar funções do Microsoft Entra no PIM](https://learn.microsoft.com/entra/id-governance/privileged-identity-management/pim-how-to-activate-role?wt.mc_id=studentamb_365381)
- [Criar revisão de acesso para um pacote](https://learn.microsoft.com/entra/id-governance/entitlement-management-access-reviews-create?wt.mc_id=studentamb_365381)
- [Histórico de Lifecycle Workflows](https://learn.microsoft.com/entra/id-governance/lifecycle-workflow-history?wt.mc_id=studentamb_365381)
- [Consultar logs de auditoria do diretório](https://learn.microsoft.com/graph/api/directoryaudit-list?view=graph-rest-1.0&wt.mc_id=studentamb_365381)
- [Fundamentos de licenciamento do Microsoft Entra ID Governance](https://learn.microsoft.com/entra/id-governance/licensing-fundamentals?wt.mc_id=studentamb_365381)
- [Passkeys by default and retirement of Microsoft-provided SMS and voice authentication](https://learn.microsoft.com/entra/identity/authentication/concept-sms-voice-retirement?wt.mc_id=studentamb_365381)

## Nota de independência e marcas

Este é um conteúdo editorial independente e não é afiliado, autorizado, patrocinado ou aprovado pela Microsoft Corporation. Microsoft, Microsoft Entra, Microsoft 365, Azure, Teams, SharePoint e PowerShell são marcas do grupo de empresas Microsoft. Todas as demais marcas pertencem aos respectivos titulares.
