# Modelos de governança de agentes de IA

Autor: Thiago Kusal, RookieOps. Preparado em 26/10/2026.

Estes modelos são sugestões do autor para adaptar aos controles e às ferramentas da equipe. Não são um formato de log, uma política oficial ou um esquema de dados da Microsoft. Todos os nomes, identificadores, endereços e eventos do exemplo são fictícios. Copie um formulário por agente ou proposta e preserve o histórico das revisões.

## 1. Registro preenchível do agente

| Campo                      | Preenchimento                                                                                                                                                        |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Identificador e finalidade | ID estável: [preencher]. Nome: [preencher]. Tarefa autorizada e condição de término: [preencher].                                                                    |
| Dono e substituto          | Patrocinador interno responsável: [preencher]. Substituto: [preencher]. Equipe e contato corporativo: [preencher].                                                   |
| Onde roda                  | Plataforma corporativa, serviço contratado, estação ou pipeline: [preencher]. Ambiente e responsável pela execução: [preencher].                                     |
| Identidade usada           | ID da identidade própria: [preencher]. Se houver sessão humana herdada, registrar a dependência e o plano para removê-la: [preencher].                               |
| Credencial                 | Tipo: [preencher]. Emissor: [preencher]. Validade: [preencher]. Responsável pela renovação e referência ao armazenamento seguro: [preencher]. Não inserir o segredo. |
| Permissões e escopo        | Acesso autônomo ou delegado: [preencher]. Operações permitidas, recursos, ambiente e prazo: [preencher].                                                             |
| Ferramentas e destinos     | APIs, servidores MCP, outros agentes e caminhos de rede necessários: [preencher].                                                                                    |
| Dados                      | Dados lidos e escritos, classificação de sensibilidade e destinos de saída permitidos: [preencher].                                                                  |
| Aprovação                  | Ações sujeitas a aprovação, aprovadores autorizados e regras de expiração: [preencher].                                                                              |
| Registros                  | Local das autenticações, chamadas de ferramentas, decisões e resultados: [preencher]. Campo de correlação e retenção definida pela equipe: [preencher].              |
| Revisão e encerramento     | Última revisão: [preencher]. Próxima avaliação: [preencher]. Condição de desativação, retirada de acessos e destino das dependências: [preencher].                   |

Ao mudar o patrocinador, as ferramentas ou o escopo, revise o registro. Guarde referências aos segredos, nunca seus valores. Se a responsabilidade não puder ser transferida, defina quem suspenderá a execução.

## 2. Exemplo fictício de registro de ação

Neste exemplo, Marina patrocina um agente agendado de diagnóstico de rede. O agente tem identidade própria e solicita uma alteração de madrugada. A política exige aprovação específica para escrita. Ninguém responde, a solicitação expira e a escrita é negada. O recurso permanece no estado anterior.

Os endereços abaixo pertencem a uma faixa reservada para documentação e não representam uma rede de cliente.

| Informação                       | Exemplo fictício                                                                                                                                               |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ID do agente                     | agente-rede-017                                                                                                                                                |
| ID da identidade autenticada     | identidade-agente-017                                                                                                                                          |
| ID da execução                   | execucao-20261026-0200-017                                                                                                                                     |
| ID de correlação                 | correlacao-ficticia-042                                                                                                                                        |
| ID do patrocinador               | pessoa-marina-001                                                                                                                                              |
| ID do usuário delegado           | Não se aplica: execução autônoma. Marina é patrocinadora, não a identidade usada na chamada.                                                                   |
| Data, hora e fuso                | 26/10/2026, 02:00:00, UTC-03:00, America/Sao_Paulo                                                                                                             |
| Ferramenta e versão              | Ferramenta fictícia de regras de rede, versão 1                                                                                                                |
| Recurso e ambiente               | rede-exemplo/regra-aplicacao, produção fictícia                                                                                                                |
| Operação solicitada              | Alterar a origem permitida de uma regra de rede                                                                                                                |
| Parâmetros relevantes            | Porta 443; origem atual 192.0.2.10/32; origem proposta 192.0.2.0/24                                                                                            |
| Origem do conteúdo de entrada    | Ticket fictício ticket-042, revisão 3, consultado às 01:59:40 UTC-03:00; tratado como conteúdo não confiável                                                   |
| Estado esperado antes da escrita | Regra na revisão 7, com origem 192.0.2.10/32                                                                                                                   |
| Referência exata da proposta     | proposta-ficticia-042, versão 1, preservada em armazenamento de auditoria sob o mesmo ID de correlação                                                         |
| Decisão da política              | Escrita condicionada à aprovação específica de uma pessoa autorizada                                                                                           |
| Pedido de aprovação e validade   | aprovacao-ficticia-042; válida até 02:00:30 UTC-03:00                                                                                                          |
| Decisão humana                   | Ausente. Nenhuma aprovação recebida dentro da validade.                                                                                                        |
| ID do aprovador                  | Não se aplica: ninguém aprovou                                                                                                                                 |
| Resultado                        | Negado por expiração sem aprovação; chamada de escrita não encaminhada ao recurso                                                                              |
| Estado observado após a decisão  | Revisão 7; origem permanece 192.0.2.10/32                                                                                                                      |
| Reversão                         | Não necessária porque não houve alteração. Se executada em outro caso, a recuperação deve restaurar o estado aprovado por um operador com autorização própria. |
| Local dos registros              | Repositório de auditoria fictício, ligado aos registros de autenticação e da ferramenta pelo ID de correlação                                                  |

Não grave tokens, segredos ou conteúdo sensível completo para obter rastreabilidade. Referencie a versão do conteúdo e a evidência protegida necessária à investigação. O agente não deve poder apagar ou reescrever seus próprios registros.

## 3. Formulário de aprovação de ação

Uma aprovação vale para a proposta específica, o recurso e o intervalo indicados. Alterações materiais exigem nova avaliação. Os campos devem ser apresentados ao aprovador antes da decisão.

| Campo                                 | Preenchimento                                                                                                         |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| ID da solicitação                     | [preencher]                                                                                                           |
| Identidade solicitante                | ID do agente, ID da identidade autenticada e ID da execução: [preencher]                                              |
| Patrocinador e usuário delegado       | Patrocinador: [preencher]. Usuário delegado, quando houver: [preencher ou não se aplica].                             |
| Recurso e ambiente                    | Identificador inequívoco do destino e ambiente: [preencher]                                                           |
| Estado atual observado                | Valor ou configuração atual, horário da leitura e evidência: [preencher]                                              |
| Estado proposto                       | Mudanças exatas, incluindo os parâmetros relevantes: [preencher]                                                      |
| Justificativa                         | Finalidade, necessidade e relação com a tarefa autorizada: [preencher]                                                |
| Evidências                            | Referências e versões dos documentos, tickets ou medições usados: [preencher]                                         |
| Impacto                               | Serviços, dados e pessoas afetados; alcance e interrupção esperada: [preencher]                                       |
| Plano de reversão                     | Estado a recuperar, procedimento aprovado e condição que dispara recuperação: [preencher]                             |
| Autorização de recuperação            | Operador ou serviço autorizado, escopo, credencial independente e prazo para a recuperação: [preencher]               |
| Validade                              | Início e fim, com fuso horário: [preencher]                                                                           |
| Aprovador                             | Identidade autenticada da pessoa e fundamento de sua autoridade para aprovar: [preencher]                             |
| Referência exata do payload aprovado  | ID e versão imutável da proposta completa, com recurso, operação, parâmetros e validade; hash se adotado: [preencher] |
| Versão ou estado esperado na execução | Revisão, ETag ou outra precondição verificável do recurso: [preencher]                                                |
| Decisão e registro                    | Aprovar, rejeitar ou solicitar revisão; justificativa, horário e ID do registro: [preencher]                          |

Um **hash** pode identificar o conteúdo da proposta, mas não autentica o aprovador nem comprova sua autoridade. Preserve a decisão autenticada e seu vínculo com a proposta. O hash também não elimina **TOCTOU**, a diferença entre o momento da verificação e o momento do uso: o recurso pode mudar depois da aprovação. Use escrita condicional com versão ou precondição onde o serviço oferecer esse recurso. Se a precondição falhar, interrompa e reavalie; quando não houver esse mecanismo, defina uma estratégia de concorrência adequada e trate a limitação explicitamente.

Não receber resposta significa negar a execução. O agente não pode aprovar a própria solicitação, alterar a política de aprovação ou usar a recuperação como caminho para obter permissão permanente.

## 4. Seis perguntas e registro de lacunas

- [ ] Quem responde por este agente, inclusive na ausência do patrocinador?
- [ ] Que identidade chega ao recurso quando ele age?
- [ ] Como se autentica e como seu acesso é contido?
- [ ] O que pode escrever, em quais recursos e até quando?
- [ ] Onde estão os registros que permitem reconstruir uma execução?
- [ ] Quais ações exigem aprovação e quem pode concedê-la?

| Lacuna identificada | Dono da correção | Medida temporária | Prazo com fuso | Evidência de encerramento |
| ------------------- | ---------------- | ----------------- | -------------- | ------------------------- |
| [preencher]         | [preencher]      | [preencher]       | [preencher]    | [preencher]               |
| [preencher]         | [preencher]      | [preencher]       | [preencher]    | [preencher]               |
| [preencher]         | [preencher]      | [preencher]       | [preencher]    | [preencher]               |

## 5. Critérios de aceitação

| Frente              | Evidência mínima sugerida                                                                                                                                                                                     |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Inventário          | Cada agente encontrado tem ID, finalidade, dono, substituto e revisão; fontes de descoberta e lacunas de cobertura estão documentadas.                                                                        |
| Identidade e escopo | Uma execução é distinguível da atividade humana; uma ação permitida funciona e uma tentativa fora do escopo é negada e registrada.                                                                            |
| Credenciais         | O emissor e a expiração são conhecidos; interromper novas emissões funciona; a equipe mediu a duração do acesso já emitido e testou a contenção no recurso ou na execução.                                    |
| Auditoria           | Uma pessoa independente reconstrói a execução, a origem do conteúdo, a decisão e o resultado pela correlação; registros têm acesso controlado e proteção contra alteração pelo agente.                        |
| Aprovação           | Pedidos sem resposta ou expirados são negados; alteração do payload invalida a aprovação; mudança no estado esperado bloqueia a escrita condicional e exige reavaliação; recuperação tem autorização própria. |

Valide primeiro em ambiente de teste, com dados sintéticos e ações de alcance limitado. Registre os resultados e as limitações; a existência do formulário, isoladamente, não comprova que o controle funciona.
