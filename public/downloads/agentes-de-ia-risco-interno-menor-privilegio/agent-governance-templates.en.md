# AI agent governance templates

Author: Thiago Kusal, RookieOps. Prepared on October 26, 2026.

These templates are the author's suggestions for adapting to your team's controls and tools. They are not a Microsoft log format, official policy, or data schema. Every name, identifier, address, and event in the example is fictional. Copy one form per agent or proposal and preserve its revision history.

## 1. Fillable agent record

| Field                  | Entry                                                                                                                                             |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Identifier and purpose | Stable ID: [fill in]. Name: [fill in]. Authorized task and termination condition: [fill in].                                                      |
| Owner and backup       | Accountable internal sponsor: [fill in]. Backup owner: [fill in]. Team and business contact: [fill in].                                           |
| Execution location     | Corporate platform, contracted service, workstation, or pipeline: [fill in]. Environment and execution owner: [fill in].                          |
| Identity used          | Dedicated identity ID: [fill in]. If a human session is inherited, record the dependency and the plan to remove it: [fill in].                    |
| Credential             | Type: [fill in]. Issuer: [fill in]. Lifetime: [fill in]. Renewal owner and reference to secure storage: [fill in]. Do not insert the secret.      |
| Permissions and scope  | Autonomous or delegated access: [fill in]. Allowed operations, resources, environment, and time limit: [fill in].                                 |
| Tools and destinations | Required APIs, MCP servers, other agents, and network paths: [fill in].                                                                           |
| Data                   | Data read and written, sensitivity classification, and allowed output destinations: [fill in].                                                    |
| Approval               | Actions requiring approval, authorized approvers, and expiration rules: [fill in].                                                                |
| Records                | Location of authentication events, tool calls, decisions, and results: [fill in]. Correlation field and retention defined by the team: [fill in]. |
| Review and retirement  | Last review: [fill in]. Next review: [fill in]. Deactivation condition, access removal, and handling of dependencies: [fill in].                  |

Review the record whenever the sponsor, tools, or scope changes. Store references to secrets, never their values. If responsibility cannot be transferred, identify who will suspend execution.

## 2. Fictional action record

In this example, Marina sponsors a scheduled network diagnostic agent. The agent has its own identity and requests a change overnight. Policy requires specific approval for writes. Nobody responds, the request expires, and the write is denied. The resource remains in its previous state.

The addresses below belong to a range reserved for documentation and do not represent a customer's network.

| Information                       | Fictional example                                                                                                                                                          |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Agent ID                          | network-agent-017                                                                                                                                                          |
| Authenticated identity ID         | agent-identity-017                                                                                                                                                         |
| Execution ID                      | execution-20261026-0200-017                                                                                                                                                |
| Correlation ID                    | fictional-correlation-042                                                                                                                                                  |
| Sponsor ID                        | person-marina-001                                                                                                                                                          |
| Delegated user ID                 | Not applicable: autonomous execution. Marina is the sponsor, not the identity used for the call.                                                                           |
| Date, time, and time zone         | October 26, 2026, 02:00:00, UTC-03:00, America/Sao_Paulo                                                                                                                   |
| Tool and version                  | Fictional network rule tool, version 1                                                                                                                                     |
| Resource and environment          | example-network/application-rule, fictional production environment                                                                                                         |
| Requested operation               | Change the allowed source of a network rule                                                                                                                                |
| Relevant parameters               | Port 443; current source 192.0.2.10/32; proposed source 192.0.2.0/24                                                                                                       |
| Input content origin              | Fictional ticket ticket-042, revision 3, read at 01:59:40 UTC-03:00; treated as untrusted content                                                                          |
| Expected state before the write   | Rule at revision 7, with source 192.0.2.10/32                                                                                                                              |
| Exact proposal reference          | fictional-proposal-042, version 1, preserved in audit storage under the same correlation ID                                                                                |
| Policy decision                   | Write requires specific approval from an authorized person                                                                                                                 |
| Approval request and validity     | fictional-approval-042; valid until 02:00:30 UTC-03:00                                                                                                                     |
| Human decision                    | Absent. No approval received within the validity period.                                                                                                                   |
| Approver ID                       | Not applicable: nobody approved                                                                                                                                            |
| Result                            | Denied because approval expired without a response; write call not forwarded to the resource                                                                               |
| Observed state after the decision | Revision 7; source remains 192.0.2.10/32                                                                                                                                   |
| Rollback                          | Unnecessary because no change occurred. If a change is executed in another case, recovery must restore the approved state through an operator with separate authorization. |
| Record location                   | Fictional audit repository, linked to authentication and tool records by correlation ID                                                                                    |

Do not record tokens, secrets, or entire sensitive inputs merely to achieve traceability. Reference the content version and protected evidence required for investigation. The agent must not be able to erase or rewrite its own records.

## 3. Action approval form

Approval applies to the specific proposal, resource, and time window identified below. Material changes require a new assessment. Show these fields to the approver before the decision.

| Field                                   | Entry                                                                                                                           |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Request ID                              | [fill in]                                                                                                                       |
| Requesting identity                     | Agent ID, authenticated identity ID, and execution ID: [fill in]                                                                |
| Sponsor and delegated user              | Sponsor: [fill in]. Delegated user, if applicable: [fill in or not applicable].                                                 |
| Resource and environment                | Unambiguous destination identifier and environment: [fill in]                                                                   |
| Observed current state                  | Current value or configuration, read timestamp, and evidence: [fill in]                                                         |
| Proposed state                          | Exact changes, including relevant parameters: [fill in]                                                                         |
| Justification                           | Purpose, necessity, and connection to the authorized task: [fill in]                                                            |
| Evidence                                | References and versions of documents, tickets, or measurements used: [fill in]                                                  |
| Impact                                  | Affected services, data, and people; scope and expected disruption: [fill in]                                                   |
| Rollback plan                           | State to restore, approved procedure, and recovery trigger: [fill in]                                                           |
| Recovery authorization                  | Authorized operator or service, scope, independent credential, and recovery time limit: [fill in]                               |
| Validity                                | Start and end, with time zone: [fill in]                                                                                        |
| Approver                                | Authenticated human identity and basis of authority to approve: [fill in]                                                       |
| Exact reference to the approved payload | Immutable ID and version of the full proposal, including resource, operation, parameters, and validity; hash if used: [fill in] |
| Expected version or state at execution  | Resource revision, ETag, or another verifiable precondition: [fill in]                                                          |
| Decision and record                     | Approve, reject, or request revision; rationale, timestamp, and record ID: [fill in]                                            |

A **hash** can identify the proposal's content, but it does not authenticate the approver or establish their authority. Preserve the authenticated decision and its binding to the proposal. A hash also does not eliminate **TOCTOU**, the gap between time of check and time of use: the resource can change after approval. Use conditional writes with a version or precondition wherever the service supports them. If the precondition fails, stop and reassess; where that mechanism is unavailable, define an appropriate concurrency strategy and address the limitation explicitly.

No response means denying execution. The agent must not approve its own request, change approval policy, or use recovery as a route to permanent permission.

## 4. Six questions and a gap register

- [ ] Who is accountable for this agent, including when the sponsor is absent?
- [ ] Which identity reaches the resource when the agent acts?
- [ ] How does it authenticate, and how is its access contained?
- [ ] What can it write, to which resources, and until when?
- [ ] Where are the records needed to reconstruct an execution?
- [ ] Which actions require approval, and who can grant it?

| Identified gap | Remediation owner | Temporary measure | Deadline with time zone | Closure evidence |
| -------------- | ----------------- | ----------------- | ----------------------- | ---------------- |
| [fill in]      | [fill in]         | [fill in]         | [fill in]               | [fill in]        |
| [fill in]      | [fill in]         | [fill in]         | [fill in]               | [fill in]        |
| [fill in]      | [fill in]         | [fill in]         | [fill in]               | [fill in]        |

## 5. Acceptance criteria

| Area               | Suggested minimum evidence                                                                                                                                                                                  |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Inventory          | Every discovered agent has an ID, purpose, owner, backup owner, and review; discovery sources and coverage gaps are documented.                                                                             |
| Identity and scope | An execution is distinguishable from human activity; an allowed action succeeds and an out-of-scope attempt is denied and recorded.                                                                         |
| Credentials        | The issuer and expiration are known; stopping new issuance works; the team has measured the lifetime of already issued access and tested containment at the resource or execution layer.                    |
| Audit              | An independent person reconstructs execution, input origin, decision, and result through correlation; records have controlled access and protection against alteration by the agent.                        |
| Approval           | Unanswered or expired requests are denied; a changed payload invalidates approval; an unexpected resource state blocks the conditional write and requires reassessment; recovery has its own authorization. |

Validate first in a test environment, using synthetic data and tightly scoped actions. Record results and limitations; the existence of a form alone does not demonstrate that a control works.
