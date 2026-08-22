---
slug: oneqode
company: OneQode
title: Senior Software Engineer (Contract, Product Lead)
start: 2025-10
end: present
location: Remote
tech:
  - TypeScript
  - Nuxt
  - Vue
  - Astro
  - Fastify
  - PostgreSQL
  - OAuth2 / OIDC
  - Docker
  - Monorepo
  - AI Orchestration
highlights:
  - Built and run the single sign-on system behind every OneQode product, one login covering seven services including the customer billing portal, with 2,000+ existing customer accounts moved across
  - Built a secure deal room where investors and outside counterparties review confidential documents, with eight levels of access and a full record of who opened what
  - "Built three tools that run day-to-day operations: an NDA system that shortened time-to-signature, a staff file library, and a virtual office for the remote team"
  - Launched the public website in eight languages, on a shared design system now used across every OneQode product so brand and search visibility are managed in one place
  - Built Frontier, a self-service quoting tool for custom infrastructure, from prototype to production, with its 3D globe becoming a primary selling point in investor and partner pitches, then retired it cleanly when priorities shifted
  - "Built the AI-assisted development system behind all of it: a shared toolkit of specialist agents and automated review and release workflows, packaged for the team, that lets one contractor cover fourteen codebases"
askContext:
  - OneQode is a high-performance IaaS provider serving multinational enterprise and government customers, with a differentiated APAC Central region in Guam and its own international carrier network.
  - Identity is a centralized OAuth2/OIDC authorization server on Fastify and PostgreSQL, at v1.23.0 across 22 releases. It is the sole identity provider for seven registered clients, spanning WHMCS billing, the cloud console, the NDA tool, the staff library, the virtual office, the data room, and Cloudflare Access federation.
  - Auth work centered on standards correctness rather than traffic scale, PKCE with S256 on every client, RS256 id_token signing, back-channel logout for cross-system session revocation, token introspection and revocation, hashed client secrets and access tokens, a multi-session account chooser, and passwordless signup fenced to staff domains.
  - The WHMCS billing bridge is a PHP OIDC module written without Composer or external dependencies, implementing Authorization Code plus PKCE by hand, resolving or provisioning billing clients against Identity, and minting single-use short-lived SSO tokens.
  - Vault is a self-hosted virtual data room with an eight-tier permission ladder, per-file AES-256-GCM envelope encryption, Collabora WOPI rendering so raw documents never reach the browser, sensitivity-based watermarking, and a complete audit trail. It exposes a scoped API letting an agent act as a specific user identity without exceeding that user's grants.
  - The design system publishes to npm across twelve semantic releases, using Style Dictionary to emit CSS custom properties, a Tailwind theme, shadcn variables, and a motion controller, with fifteen recipe patterns and a lint gate that rejects hardcoded colors and arbitrary pixel values.
  - The public site is a static Astro build, migrated from Astro 5 to 7, with eight locales at full parity including Arabic, Japanese, and Chinese, an LLM-assisted translation resync engine with curation-safe per-key state tracking, and locale-aware structured data, hreflang, and social metadata.
  - Frontier was a Nuxt and Fastify quoting platform on Supabase and Typesense, with row-level security across 31 tables, an interactive 3D globe solutions builder, dynamic pricing, partner white-labeling, and a full draft-to-deployed order lifecycle. It reached production and demo use but never carried an active user base, and was mothballed in August 2026 as infrastructure-as-code that can be reopened on a single deploy.
  - Delivery across fourteen repositories is coordinated through a purpose-built multi-agent workspace, packaged and versioned as an internal Claude Code plugin so the whole team installs the same setup. A planner agent sequences cross-project changes and delegates to sixteen project-specific coder, reviewer, and test-writer agents, alongside nine workflow skills for planning, release readiness, component scaffolding, and design system enforcement.
---

Contract engineering lead across OneQode's platform layer, covering the company-wide single sign-on provider, secure document and contract systems, the public website and its design system, and the Frontier quoting product from prototype through to a clean retirement.
