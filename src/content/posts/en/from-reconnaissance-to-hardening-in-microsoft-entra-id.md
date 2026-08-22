---
title: 'From reconnaissance to hardening in Microsoft Entra ID'
description: 'Turn your Microsoft Entra ID reconnaissance into a protection plan with least privilege, PIM, and Conditional Access.'
pubDate: 2026-07-30
author: 'Thiago Kusal'
authorUrl: 'https://tkusal.com.br'
lang: en
categories: ['Microsoft 365']
tags: ['Entra ID', 'IAM', 'Security', 'Intermediate']
cover: '/images/posts/do-reconhecimento-ao-hardening-no-microsoft-entra-id/camadas-de-seguranca-e-menor-privilegio.webp'
coverAlt: 'Illustration of person, workload, and device identities going through access policy layers.'
toc: true
comments: true
draft: false
---

By 9:20 AM, Marina had already logged into Outlook, joined the Teams meeting, and opened the document in SharePoint. Everything worked. For the technology team, however, “it worked” is just the beginning: is the access protected against phishing? Are administrative roles active without a clear need? Is an automation storing a password in the code? If a policy blocks the environment, is there a rollback path?

These questions mark the shift from reconnaissance to **hardening**, or security reinforcement. The goal is to reduce attack surfaces, standing privileges, and single points of failure without hindering legitimate work.

If concepts like tenant, authentication, and authorization are still new, [Microsoft Entra ID for beginners](/posts/identidade-na-nuvem-microsoft-entra-id-para-iniciantes/) offers a mind map and a read-only guide. This article can also be read independently: here, the focus is on protection decisions.

## The expected outcome

By the end of this reading, you should be able to:

- explain why workloads need their own identities;
- recognize when a managed identity prevents secrets in the code;
- differentiate the purpose of OpenID Connect, OAuth 2.0, and the main token types;
- relate Conditional Access, licensing, and security defaults;
- plan least privilege and just-in-time access with PIM (Privileged Identity Management);
- organize a hardening checklist with a pilot group, monitoring, and rollback.

The outcome will not be a universal configuration. It will be a decision plan that you can adapt to your environment's risk, licenses, and dependencies.

## Before you begin

To turn this content into an actionable plan, gather:

- an inventory of users, guests, groups, devices, and workload identities;
- the list of administrative roles and permissions over critical resources;
- the available licenses in the tenant;
- the people responsible for identity, devices, applications, and incident response;
- a validation window and a lab environment or pilot group.

Microsoft portals, commercial names, and usage rights change over time. Confirm the current documentation and your organization's contract before assuming a specific control is available.

> [!CAUTION]
> Do not apply these recommendations directly in production. Authentication policies, Conditional Access, and privileged roles can affect all services that trust the tenant. Preserve emergency accounts, validate dependencies, and define the rollback before modifying controls.

## People, devices, and workloads

An identity strategy does not only protect human accounts. It must consider at least three types of requestors:

- **people**, who typically use a password, passkey, biometrics, or another interactive method;
- **devices**, whose registration, join status, and compliance state can take part in the access decision;
- **workloads**, such as applications, services, scripts, agents, and automations.

Imagine Marina needs to set up an automation to read a secret in Azure Key Vault. Using her personal account would create a dependency on an employee's lifecycle, complicate auditing, and amplify the impact of a compromised credential. Creating an application secret directly in the code would just trade one problem for another.

The workload must have its own identity and receive only the necessary permissions for the task.

### Managed identities eliminate credentials from code

When the automation runs on a compatible Azure resource, a **managed identity** can obtain tokens from Microsoft Entra ID without the team having to provision or rotate passwords and certificates in the code.

There are two types:

| Type                   | Lifecycle                                                               | Typical usage                                         |
| ---------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------- |
| System-assigned        | Tied to the Azure resource; the identity is deleted when it is deleted  | A workload with an exclusive identity                 |
| User-assigned          | Independent resource, can be associated with one or more workloads      | Reusable or separately managed identity               |

“No secret in the code” does not mean “no authorization”. The identity still needs to be granted permission on the target resource. A valid token for Key Vault, for instance, does not authorize reading if the required role or access policy has not been granted.

For workloads running outside Azure, an app registration and its respective _service principal_ are still common. If the source platform offers a trusted identity, prefer **workload identity federation**, which allows exchanging the external token for a Microsoft Entra token without maintaining a static secret. When federation is not possible, prefer a securely stored and rotated certificate; use _client secrets_ only as a last resort.

Within Azure, when the source service supports managed identity and the destination offers authentication through Microsoft Entra, managed identity remains the recommended option. In any scenario, static secrets in configuration files, pipelines, and repositories should be treated as a risk to eliminate.

## Protocols and tokens: trust behind the scenes

In a modern sign-in, the application should not receive Marina's password. It establishes trust with the identity provider through standardized protocols:

- **OpenID Connect (OIDC)** adds an identity layer on top of OAuth 2.0 and is used to authenticate the person in the application;
- **OAuth 2.0** allows a client to request delegated access or access on its own behalf to a protected resource;
- **SAML** is still common in enterprise application integration and SSO.

OIDC and OAuth 2.0 can participate in the same experience, but they answer different questions: who signed in and what access is being requested.

The main tokens also serve different purposes:

| Token          | Recipient and purpose                                                 |
| -------------- | --------------------------------------------------------------------- |
| ID token       | Helps the client application confirm the person's authentication      |
| Access token   | Is presented to the API or protected resource to request access       |
| Refresh token  | Allows the client to request new tokens, according to the flow's rules|

Tokens are sensitive and temporary credentials. They should not be pasted into support tickets (like the ones stuck in the Service Desk queue), screenshots, repositories, or public tools. Applications should use supported libraries, request only the necessary scopes, and validate the tokens intended for them.

## Conditional Access: policy, signal, and control

Conditional Access combines assignments, signals, and controls. Practically speaking, a policy answers:

> If this specific identity accesses this specific resource under these conditions, what control should be applied?

An organization can require MFA for administrative roles, mandate a compliant device for sensitive data, block legacy authentication, or react to risk levels. The policy controls whether the session can proceed; the resource permissions still define what the identity can do afterward.

### Licensing changes the design

Conditional Access is available with **Microsoft Entra ID P1 or P2**. Microsoft 365 Business Premium and Microsoft 365 E3 include Microsoft Entra ID P1; Microsoft 365 E5 includes Microsoft Entra ID P2. Policies based on user or sign-in risk rely on P2 features.

Microsoft 365 E7 includes Microsoft 365 E5 and the Microsoft Entra Suite, among other components. This expands the available feature set, but does not eliminate the need to confirm prerequisites, license quantities, and usage rights for each protected population.

Tenants without P1 or P2 can use **security defaults** to get a preconfigured baseline protection, including MFA registration and legacy authentication block. Security defaults and Conditional Access should not be treated as two competing sets enabled without planning; when migrating, maintain the previous coverage until the new policy is validated.

Since products and contracts evolve, use the names above as initial guidance and confirm the licensing documentation before approving the architecture.

## Least privilege and temporary access

Granting “Global Administrator just to make sure it works” turns convenience into risk. The permission should be at the correct layer, in the smallest scope possible, and active only for the necessary period.

Before granting access, answer:

1. what task will be performed?
2. what is the minimum role that allows completing it?
3. in what scope does it need to apply?
4. how long should the access remain active?
5. which logs and approvals will prove the usage?

### Where PIM helps

**Privileged Identity Management (PIM)** allows making a role eligible for temporary activation instead of keeping it permanently active. Based on the policy, activation might require MFA, justification, approval, and a time limit.

PIM reduces standing privilege, but it does not choose the correct role for the team. Making an excessive assignment temporary still leaves an excessive privilege during the activation.

To use all PIM features, the tenant needs Microsoft Entra ID P2 or Microsoft Entra ID Governance licenses for the people covered by the licensing rules. Also, confirm the specific requirements for approvers, reviewers, groups, and workload identities.

## Initial hardening checklist

A small environment is not a risk-free environment. Prioritize controls that reduce both the likelihood and the impact of a compromise:

1. **Protect human accounts with MFA.** For simple environments, evaluate security defaults; for granular needs and compatible licensing, plan Conditional Access.
2. **Prefer phishing-resistant authentication.** Plan FIDO2 passkeys, security keys, or other methods suitable for the risk, without forgetting recovery and support.
3. **Separate administrative accounts from daily activities.** Email and everyday browsing increase the attack surface of a privileged account.
4. **Maintain at least two emergency access accounts.** They must be exclusive for contingencies, cloud-native, protected by strong methods, and continuously monitored.
5. **Apply least privilege.** Avoid standing and broad roles when a specific, restricted, or temporary role can solve the need.
6. **Grant access through groups when it makes sense.** Groups with defined purposes, scopes, and owners make people's onboarding, movement, and offboarding more predictable.
7. **Manage the lifecycle.** Create, review, disable, and remove access as people and workloads (JML - Joiner, Mover, Leaver processes) join, change roles, or leave.
8. **Protect workload identities.** Prefer managed identities when available and treat certificates, secrets, and tokens as sensitive credentials.
9. **Monitor sign-ins and changes.** Sign-in logs help understand authentications; audit logs show directory changes.

Do not try to deploy all nine items simultaneously. Start with privileged identities and recovery paths, establish visibility, and advance in verifiable increments.

## Common hardening mistakes

- **“MFA makes any access secure.”** MFA reduces risks, but it does not fix excessive permissions, compromised devices, or bad consent decisions.
- **“Global Administrator and Owner are the same thing.”** The roles belong to different control planes.
- **“An application doesn't need an identity.”** Applications and automations also authenticate and should receive the least privilege.
- **“Managed identity doesn't need review.”** It eliminates credential management, not the risk of excessive permissions or misuse.
- **“If report-only mode didn't block anyone, the policy is ready.”** Telemetry needs to represent actual users, apps, devices, and exceptions before enforcement.
- **“The emergency account can be used when daily administration is hard.”** Its use should be exceptional, monitored, and investigated.
- **“If the sign-in failed, just reset the password.”** Logs, policies, device state, MFA, risk, and authorization might point to another cause.

## Safe deployment and rollback

A change in Microsoft Entra ID can affect several services at the same time. Treat the deployment as a production change:

1. **Record the current state.** Document the existing policy, affected identities, and a log baseline.
2. **Define outcome and criteria.** Specify the reduced risk, expected behavior, and signals that will indicate failure.
3. **Confirm dependencies and licenses.** Include service accounts, legacy applications, devices, and external users.
4. **Ensure emergency access.** Test the accounts and the recovery procedure before the change.
5. **Use a pilot group.** Include representative scenarios and apply report-only mode when available.
6. **Observe before expanding.** Track logs, tickets, and operational impacts for a set period.
7. **Expand in stages.** Avoid hitting the entire tenant in a single change.
8. **Rollback based on defined criteria.** Restore the documented state if the failure signals are met.

Do not remove the previous control until you prove that the replacement offers equivalent or better coverage. This is especially important when migrating from security defaults to Conditional Access policies.

## How to validate the plan

Before configuring any control, check if the change document answers:

- which identities, resources, and applications are in scope?
- what concrete risk will be reduced?
- what license enables the feature, and who needs to be licensed?
- which accounts or applications might be blocked?
- who approves, monitors, and decides on the rollback?
- which log events demonstrate success or failure?
- how will administrative access be recovered?

If any answer relies on “probably,” turn the assumption into a lab validation or consult the system owner.

## Primary references

- [Connect apps to resources without managing credentials](https://learn.microsoft.com/entra/identity/managed-identities-azure-resources/overview-for-developers?wt.mc_id=studentamb_365381)
- [Security best practices for app properties](https://learn.microsoft.com/entra/identity-platform/security-best-practices-for-app-registration?wt.mc_id=studentamb_365381)
- [Create trust between an app and an external identity provider](https://learn.microsoft.com/entra/workload-id/workload-identity-federation-create-trust?wt.mc_id=studentamb_365381)
- [Security tokens and claims overview](https://learn.microsoft.com/entra/identity-platform/security-tokens?wt.mc_id=studentamb_365381)
- [OpenID Connect on the Microsoft identity platform](https://learn.microsoft.com/entra/identity-platform/v2-protocols-oidc?wt.mc_id=studentamb_365381)
- [OAuth 2.0 authorization code flow](https://learn.microsoft.com/entra/identity-platform/v2-oauth2-auth-code-flow?wt.mc_id=studentamb_365381)
- [Conditional Access overview](https://learn.microsoft.com/entra/identity/conditional-access/overview?wt.mc_id=studentamb_365381)
- [Multifactor authentication and Conditional Access licensing](https://learn.microsoft.com/entra/identity/authentication/concept-mfa-licensing?wt.mc_id=studentamb_365381)
- [Security defaults in Microsoft Entra ID](https://learn.microsoft.com/entra/fundamentals/security-defaults?wt.mc_id=studentamb_365381)
- [Plan a Privileged Identity Management deployment](https://learn.microsoft.com/entra/id-governance/privileged-identity-management/pim-deployment-plan?wt.mc_id=studentamb_365381)
- [Microsoft Entra ID Governance licensing fundamentals](https://learn.microsoft.com/entra/id-governance/licensing-fundamentals?wt.mc_id=studentamb_365381)
- [Microsoft 365 E7](https://www.microsoft.com/microsoft-365/enterprise/e7?wt.mc_id=studentamb_365381)
- [Manage emergency access administrative accounts](https://learn.microsoft.com/entra/identity/role-based-access-control/security-emergency-access?wt.mc_id=studentamb_365381)
- [Monitoring and health overview](https://learn.microsoft.com/entra/identity/monitoring-health/overview-monitoring-health?wt.mc_id=studentamb_365381)

## Conclusion

Marina does not need to know every policy protecting her session. The technology team, on the other hand, must ensure that her perceived simplicity does not hide standing credentials, excessive privileges, or irreversible changes.

Microsoft Entra ID hardening is not a button or a one-time checklist. It is a cycle: reconnaissance of identities and dependencies, prioritizing risks, applying the least effective control, observing the results, and reviewing access.

The question guiding this cycle remains simple:

> Who or what is requesting access, has the identity been proven, are the conditions acceptable, and is there permission to perform this action?

The more clearly the environment answers, the smaller the gap between “access works” and “access is protected”.

## Note on independence and trademarks

This is independent editorial content and is not affiliated with, authorized, sponsored, or approved by Microsoft Corporation. Microsoft, Microsoft Entra, Microsoft 365, and Azure are trademarks of the Microsoft group of companies. All other trademarks belong to their respective owners.

The text and illustration were produced specifically for this RookieOps article.
