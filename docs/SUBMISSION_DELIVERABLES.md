## TradeGrid — Deliverables, Outcomes, Validation, and Demo Plan

Nice — here’s a clear, concrete list of what you will get (results & artifacts) after building the TradeGrid scaffold and finishing the MVP described earlier. I break it down into Deliverables (what you can show), Functional outcomes (what works), Technical outcomes & targets (what you can measure), Submission artifacts & demo outcomes (what judges will see), Validation steps (how to prove each result), and next-step / growth signals you can point to in your pitch.

1) Deliverables — files & running things you’ll have

A monorepo with working folders:

/contracts — Move package with OrderBook.move, unit test script(s), and Move.toml.

/service/matching-engine — TypeScript matching engine (REST + WS), in-memory CLOB, relayer stub, Dockerfile.

/web — Next.js demo UI with a trading form and basic orderbook view, Dockerfile.

/sdk/js-sdk — TypeScript client (TradeGridClient) with example script.

/sdk/py-sdk — Minimal Python client with example.

/infra/docker-compose.yml — local docker-compose to run engine + web together.

Root workspace configs: package.json, pnpm-workspace.yaml.

CI skeleton (optional if you add it) and README docs for running locally and demo steps.

2) Functional outcomes — what actually works end-to-end

Place orders from the web UI (or SDK) → orders accepted by the matching engine (HTTP).

Orderbook snapshot endpoint (GET /orderbook) that shows top bids/asks.

Cancel orders via API.

Order events broadcast over WebSocket for live UI updates.

Relayer stub that demonstrates how matched trade events would be packaged for on-chain settlement (Move contract stub ready).

Move contract deployed locally/testnet (OrderBook package) with at least basic order insertion and events; test script demonstrates insertion.

Local dev environment: docker compose up --build brings up engine + web for demo.

3) Technical outcomes & measurable targets (what you'll be able to show)

These are targets for your hackathon MVP. Exact numbers depend on hardware, Node vs Rust, and testnet conditions — treat them as realistic, demonstrable goals.

Order ingestion (engine accepts): ~hundreds of orders/sec from a single NodeJS instance (in-memory) — enough for a convincing demo load test.

Matching latency (off-chain): <10–50 ms from in-gateway acceptance to match decision for single-threaded in-memory matcher (observable in logs).

On-chain settlement readiness: relayer packages matched trades; a single settlement transaction (once implemented) should be demonstrable on testnet with a tx hash.

Front-end responsiveness: live orderbook updates via WS with update latency <200 ms (local network).

Test coverage: Move unit test(s) validate core invariants (order insertion, event emission); TypeScript unit tests for orderbook operations.

Gas / cost baseline (demo): sample settlement tx on testnet with measured gas used (report one or two example tx hashes + gas used).

Resource isolation proof: run concurrent non-conflicting market operations and show they don’t conflict (demonstrates aptitude for Aptos parallelism in pitch).

4) Submission artifacts & demo outcomes judges will see

Hosted demo link (or Docker instructions) the judges can open and test.

2–4 minute demo video showing: order placement → match event → relayer packaging → (optional) on-chain settlement TX. Include recorded metrics.

Public GitHub repo with: README, /contracts tests and Move code, /service server, /web UI, SDKs, and demo scripts.

Sample testnet tx hashes used in demo and a short “how to reproduce” section.

One-pager / pitch PDF describing architecture, security considerations, and roadmap.

Benchmarks summary (orders/sec, match latency, settlement gas) and graphs from your load tests.

5) How to validate each deliverable (quick checklist you can run)

Repo & files: open GitHub and show folder list / latest commit.

Local demo: run pnpm -w install then pnpm --filter @tradegrid/matching-engine dev and NEXT_PUBLIC_ENGINE_URL=http://localhost:8080 pnpm --filter @tradegrid/web dev — open http://localhost:3000 and place an order.

Docker demo: cd infra && docker compose up --build → visit http://localhost:3000.

REST endpoints: curl -X POST http://localhost:8080/place_order -d '{"owner":"demo","price":"100","size":"1","side":"buy"}' → returns id.

WS events: connect a WS client to ws://localhost:8080 and verify order_placed messages.

Move tests: run move unit-test or aptos test harness against local devnet and show green tests.

Performance: run provided scripts/loadtest.ts to generate orders; collect orders/sec and latency logs; present as graph/images.

6) What judges / stakeholders will perceive (how this maps to wins)

Technical depth: on-chain Move module + off-chain matching + relayer demonstrates understanding of hybrid architecture — strong for Best Tech Implementation.

Product fit: working cross-market orderbook + live demo fits the hackathon theme (DeFi / trading infra).

Polish & reproducibility: Dockerized demo + SDKs + README make it easy for judges to test — big plus.

Metrics & benchmarks: backing claims with orders/sec and latency numbers gives credibility vs. just UI-only demos.

7) Known limitations & caveats (be transparent in your submission)

Current matching engine is in-memory (TypeScript). For production you’ll want a persisted, fault-tolerant engine (Redis/Postgres + durable logs) or a Rust-based low-latency engine.

The Move OrderBook provided in the scaffold is minimal — full atomic on-chain matching and settlement requires additional Move modules (Settlement, Escrow) or a design where off-chain matching signs proofs verified on-chain.

Cross-chain settlement (LayerZero/CCTP) not included in the minimal scaffold — can be shown as an integration plan or demoed with a mocked flow.

8) Post-MVP / growth signals (what to add next to level-up)

Replace TS in-memory matcher with a Rust engine for true low-latency throughput and durability.

Implement on-chain verification of off-chain matches (matcher signs trade; Move verifies signature) to remove full trust in relayer.

Add batch settlement to reduce gas and show gas savings graphs.

Integrate Circle CCTP or LayerZero for actual cross-chain settlement demonstration.

Add more markets, on-chain LP integration (AMM hybrid), leaderboards & copy-trading vault settlement.

9) Quick “what to show” checklist for the demo video

00:00–00:10 Problem + TradeGrid one-liner.

00:10–00:40 Live UI: place orders, show orderbook update.

00:40–01:10 Matching engine logs: show order matched and trade event emitted.

01:10–01:40 Relayer packaging the trade + (optional) on-chain settlement tx hash shown on explorer.

01:40–02:00 Benchmarks snapshot: orders/sec, latency, gas baseline.

02:00–02:20 Closing: roadmap & why Aptos.


