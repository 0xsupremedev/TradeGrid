# Architecture

High-level components:
- Web (Next.js) -> Gateway (Fastify) -> Matching Engine (REST/WS)
- Relayer (WS consumer) -> Aptos (Move settlement)
- Contracts: OrderBook, Settlement, CopyVault, Treasury

Data flow:
1. Client places order via Gateway -> Engine `/place_order`
2. Engine matches orders, emits `trade` over WS
3. Relayer listens and submits `settlement::settle_trade`
4. Frontend polls `/orderbook` and listens to WS for trades


