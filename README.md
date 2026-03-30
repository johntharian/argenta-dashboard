# AgentPay Dashboard

> **Financial infrastructure for AI agents.** Give your agent a wallet, not your credit card.

AgentPay provides a secure, programmable financial proxy layer for autonomous AI agents. Instead of handing your primary credit card to an AI, AgentPay issues a virtual "wallet" governed by strict, customizable spending policies (daily limits, total budget, merchant allowlists). Every transaction runs through a dual-gate security check—first against your custom policy engine, and again independently via Stripe Issuing webhook verification before the card network settles.

## Overview

- **Scoped Budgets:** Enforce daily, weekly, per-transaction, or total budget limits on any agent.
- **Instant Freeze:** Revoke spending power immediately. Blocks cascade to any child wallets.
- **Zero Exposure:** Agents never see real card numbers—only a scoped integration key.
- **MCP-Native:** Connects smoothly out-of-the-box with tools like Claude, Cursor, and any Model Context Protocol compliant runtime.
- **Real-time Alerting:** Catch threshold warnings and approve hooks dynamically.

## Common Use Cases

1. **Autonomous Procurement:** Let agents buy compute power or datasets independently while governed by hard caps.
2. **Customer Support:** Empower AI support bots to issue small, predetermined appeasements directly to users.
3. **Marketing & Ad Spend:** Let growth agents autonomously scale campaigns based on real-time performance.

## Getting Started

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Run the Development Server:**
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack
Built with **Next.js** (App Router) and vanilla CSS leveraging dark minimalist styling and dynamic CSS variables layout.
