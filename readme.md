# TradeGrid – Hybrid CLOB on Aptos (Monorepo)
<img width="1864" height="974" alt="image" src="https://github.com/user-attachments/assets/93c5b20f-f0ec-466c-8697-fb59be6c182b" />

TradeGrid is a modern, developer‑oriented hybrid on/off‑chain order book (CLOB) built on Aptos. It marries off‑chain matching (speed) with on‑chain settlement (finality, transparency).

## Stack Overview
- Web UI: Next.js 14, React 18, Tailwind, shadcn‑style, Framer Motion
- Charts: lightweight‑charts (candles), Recharts (analytics)
- Wallets: `@aptos-labs/wallet-adapter-react` (auto‑detect browser wallets)
- State: Zustand
- Services: Matching Engine (Fastify + WS), Gateway (Fastify + CORS), Relayer (TypeScript batcher)
- Contracts: Move settlement skeleton (`settlement::settle_batch` eventing)

## Project Structure
```
tradigrid-monorepo/
├── contracts/          # Move contracts
├── service/            # backend services (engine, gateway, relayer)
├── sdk/                # JS/Python SDKs
├── web/                # Next.js dashboard
└── scripts/            # local node helpers
```

## Quick Start
Prereqs: Node 18+, pnpm. On Windows, PowerShell for local Aptos scripts.

```bash
pnpm install
pnpm add -D concurrently   # first time only

# Start full stack including local Aptos node
pnpm dev:all

# Or start services only (no local node)
pnpm dev
```

UI default: http://localhost:4101 (dev script). Engine: 8080. Gateway: 8081.
Set the UI env (if starting web alone):
```powershell
$env:NEXT_PUBLIC_ENGINE_URL="http://localhost:8080"
```

## Web UI
- Sticky navbar (Aptos status + wallet auto‑detection)
- Order Book with depth shading, best levels, spread
- Candlestick chart + MA overlays
- Orders table (filter/sort), order form with wallet autofill + validation
- Trades ticker; Network Metrics (TPS/Relayer/Volume)

## Engine & WS Contract (MVP)
REST
- `POST /place_order { side, price, size, owner }`
- `GET /orderbook`

WS
- `trade` messages on fills

## Relayer (demo)
- Buffers WS trades; prepares batches; submits to settlement (stub)
- SQLite schema for idempotency/history in `service/relayer/sql/schema.sql`

## Roadmap
- Owner order signatures & verification in engine
- WS book snapshot/diff with sequence numbers
- BCS‑encoded settle_batch and on‑chain signature verification
- Monitoring (/metrics), Grafana dashboards

## Scripts
```
pnpm dev:all   # chain + engine + gateway + relayer + web
pnpm dev       # engine + gateway + relayer + web
pnpm aptos:local / aptos:reset / aptos:trade
```

## License
Apache‑2.0
