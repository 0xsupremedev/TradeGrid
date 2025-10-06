# TradeGrid — Hybrid CLOB on Aptos (Comprehensive Docs)

## Overview
TradeGrid is a high-performance, hybrid central limit order book (CLOB) built for Aptos. It combines off-chain low-latency matching with on-chain settlement, exposing clean REST/WebSocket APIs and SDKs for easy integration. The architecture aligns with Aptos parallel execution and provides a clear path to batched and cross-chain settlement.

- Core: In-memory matching engine (TypeScript), REST + WS
- On-chain: Move modules (OrderBook, Settlement, Treasury, BridgeAdapter, Utils)
- Relayer: Aptos SDK integration for settlement calls
- Gateway: Lightweight proxy for engine APIs
- Web: Next.js demo UI
- SDKs: TypeScript (JS) and Python clients
- Infra: Docker Compose for local demo

## Key Features (current)
- Off-chain matching with deterministic, price-time priority within the demo scope
- REST endpoints for order placement, cancellation, and orderbook snapshots
- WebSocket trade events broadcast from the matching engine
- JS SDK for programmatic access to place/cancel orders and query orderbook
- Simple gateway service to front the engine
- Demo web UI for placing orders and viewing the book
- Relayer stub that packages trade data and submits a Settlement transaction via Aptos SDK
- Move package scaffold including `OrderBook.move`, `Settlement.move`, `Treasury.move`, and tests
- One-command local demo via Docker Compose

## Repository Structure
```
contracts/        # Move smart contracts and tests (OrderBook, Settlement, Treasury, etc.)
service/
  matching-engine/ # Fastify REST + WS in-memory CLOB
  gateway/         # Thin proxy to the engine for external consumers
  relayer/         # Aptos integration for settlement
sdk/
  js-sdk/          # TypeScript client
  py-sdk/          # Python client (minimal)
web/               # Next.js demo UI
infra/             # docker-compose for local demo
scripts/           # Local dev and demo scripts (PowerShell)
docs/              # Documentation
```

## Architecture
- Matching happens off-chain for low latency and simplicity in the MVP.
- Trades are emitted as WS events; the relayer can consume and submit on-chain settlements.
- On-chain Move modules define the structures and entry points to support future full settlement.
- Gateway provides a stable public surface area (REST) to the engine.
- SDKs and the web UI talk to the gateway/engine.

### Data Flow
1) Client places order -> Engine REST `/place_order`
2) Engine matches vs in-memory book; emits `trade` events over WS
3) UI/consumers update orderbook via `/orderbook` and subscribe to WS
4) Relayer packages `trade` and calls `settlement::settle_trade` via Aptos SDK

## Services

### Matching Engine (service/matching-engine)
- Framework: Fastify + ws, input validation via zod
- Endpoints:
  - `POST /place_order` { side: 'bid'|'ask', price: string, size: string, owner: string }
    - Returns: `{ id, remaining }`
    - Header `x-duration-ms` indicates handling time
  - `POST /cancel_order` { id: number }
    - Returns: `{ cancelled: number|null }`
  - `GET /orderbook`
    - Returns: `{ bids: {id, price, remaining}[], asks: {id, price, remaining}[] }`
    - Header `x-duration-ms` indicates snapshot time
- WebSocket:
  - Broadcasts `{ type: 'trade', trade: { buyOrderId, sellOrderId, price, size, maker, taker, takerIsBid } }`
- Order book implementation: `InMemoryOrderBook`
  - Price-time priority via sort before matching; inserts append for simplicity

### Gateway (service/gateway)
- Thin Fastify proxy to the engine
- Endpoints:
  - `POST /place_order` -> forwards to `ENGINE_URL/ place_order`
  - `GET /orderbook` -> forwards to `ENGINE_URL/orderbook`
  - `GET /health` -> `{ ok: true }`

### Relayer (service/relayer)
- Uses `aptos` SDK
- Environment:
  - `APTOS_NETWORK`, `APTOS_NODE_URL`, `APTOS_PRIVATE_KEY`, `CONTRACT_ADDRESS`, `MAKER_OVERRIDE`
- Function:
  - `settleTrade(trade)` builds and submits tx calling `${addr}::settlement::settle_trade`
- Note: A WS consumer that reads engine trades and calls `settleTrade` can be added or run as part of the service

## SDKs

### JS SDK (sdk/js-sdk)
- `TradeGridClient(baseUrl)`
  - `placeOrder({ side, price, size, owner })`
  - `cancelOrder(id)`
  - `orderbook()`
- Types: `Side = 'bid' | 'ask'`

### Python SDK (sdk/py-sdk)
- Minimal client and example to interact with the API (see `pyproject.toml`, `tradegrid/client.py`)

## Web App (web)
- Next.js page at `/` with a simple form to:
  - place bids/asks
  - refresh and display bids/asks
- Uses `NEXT_PUBLIC_ENGINE_URL` to target engine/gateway

## Contracts (contracts)
- Key modules in `sources/`:
  - `OrderBook.move`: order data structures, insertion events (scaffold)
  - `Settlement.move`: `init`, `deposit`, `settle_trade` (demo settlement path)
  - `Treasury.move`: asset custody primitives (scaffold)
  - `BridgeAdapter.move`: cross-chain hooks (roadmap)
  - `utils.move`: helpers
- Build outputs in `build/tradegrid/` include bytecode, sources, and maps
- Tests in `tests/` cover orderbook/settlement invariants

## APIs

### Engine REST
- `POST /place_order`
```json
{
  "side": "bid",
  "price": "100",
  "size": "1",
  "owner": "demo"
}
```
Response:
```json
{ "id": 1, "remaining": "0" }
```

- `POST /cancel_order`
```json
{ "id": 1 }
```
Response:
```json
{ "cancelled": 1 }
```

- `GET /orderbook`
Response:
```json
{
  "bids": [{ "id": 1, "price": "100", "remaining": "1" }],
  "asks": [{ "id": 2, "price": "101", "remaining": "1" }]
}
```

### WebSocket Trades
```json
{ "type": "trade", "trade": { "buyOrderId": 3, "sellOrderId": 2, "price": "100", "size": "1", "maker": "maker1", "taker": "taker1", "takerIsBid": true } }
```

## Local Development

### Prerequisites
- Node.js 18+
- pnpm
- Aptos CLI 7.7.0+

### Scripts (root)
- `pnpm aptos:local` — start local testnet + deploy via PowerShell scripts
- `pnpm aptos:reset` — reset environment
- `pnpm aptos:trade` — run a scripted trading demo

### Docker Compose
- File: `infra/docker-compose.yml`
- Services: `engine`, `gateway`, `relayer`, `web`
- Example environment:
  - `NEXT_PUBLIC_ENGINE_URL=http://localhost:8081`
  - `APTOS_PRIVATE_KEY=<ed25519-hex>`

Run:
```bash
docker compose -f infra/docker-compose.yml up --build
```
Open `http://localhost:3000` and place orders.

## Example Usage

### Using JS SDK
```ts
import { TradeGridClient } from '@tradegrid/js-sdk';

const client = new TradeGridClient('http://localhost:8081');
await client.placeOrder({ side: 'bid', price: 100n, size: 1n, owner: 'alice' });
const book = await client.orderbook();
console.log(book);
```

### Using HTTP directly
```bash
curl -X POST http://localhost:8081/place_order \
  -H 'Content-Type: application/json' \
  -d '{"side":"bid","price":"100","size":"1","owner":"demo"}'
```

## Benchmarks & Targets (MVP)
- Order ingestion: hundreds of orders/sec (single Node instance, in-memory)
- Matching latency: <10–50 ms typical on local
- WS update latency: <200 ms local
- Settlement: relayer submits a `settle_trade` tx (demo/testnet)

## Security & Limitations
- In-memory engine (no durability). For production: persistent logs (Redis/Postgres) or Rust engine
- Minimal on-chain settlement path; verification of off-chain matches via signatures is roadmap
- Cross-chain settlement via CCTP/LayerZero is planned, not included in MVP

## Roadmap
- Rust-based matching engine for lower latency and durability
- Signature-verified off-chain matches, checked on-chain
- Batch settlement to reduce gas and amortize costs
- Cross-chain settlement (CCTP/LayerZero)
- Copy-trading vaults + social features
- Expanded markets and liquidity programs

## References
- See `docs/SUBMISSION_DELIVERABLES.md` for demo checklists and validation
- `docs/PITCH.md` for one-liner, differentiation, and roadmap
- Root `readme.md` for quick start commands
