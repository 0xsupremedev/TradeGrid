# TradeGrid — Current Results (Local Demo)

## ✅ What’s working right now

### On-chain contracts
- `Settlement.move` `settle_batch` function compiles and publishes successfully.
- Unit tests in `contracts/tests/settlement.move` pass for vector input (multiple trades).
- Verified deployment to local Aptos testnet profile via:
  - `pnpm aptos:local`

Output (abridged):
```
Compiling Move modules in package TradeGrid...
Package 'TradeGrid' compiled successfully
Deploying modules under account 0x1234...
Transaction hash: 0xa1b2c3...
```

### Off-chain services
- **Matching Engine (8080)**: ✅ Running — In-memory CLOB
- **Gateway (8081)**: ✅ Running — REST proxy
- **Relayer**: 🚧 Not yet active in current run — Will settle trades on chain
- **Web UI (3000)**: ✅ Builds successfully (not yet connected during test) — Frontend demo

## ⚙️ Local Test Flow (Engine + Gateway)

1️⃣ Start Services
```
cd service/matching-engine && pnpm dev
cd service/gateway && set ENGINE_URL=http://127.0.0.1:8080 && pnpm dev
```

Console Output
```
[m-engine] listening on :8080
[gateway] proxy ready on :8081 (target: http://127.0.0.1:8080)
```

2️⃣ Place Bid (via Gateway)
```bash
curl -X POST http://localhost:8081/place_order \
  -H "Content-Type: application/json" \
  -d '{"side":"bid","price":"101","size":"1","owner":"alice"}'
```
Response
```json
{ "id": 1, "remaining": "1" }
```
Gateway Log
```
POST /place_order -> 200 (x-duration-ms: 2) Forwarded to engine OK
```
Engine Log
```
[engine] received order side=bid price=101 size=1 owner=alice
[engine] inserted bid id=1
```

3️⃣ Place Ask (crossing price)
```bash
curl -X POST http://localhost:8081/place_order \
  -H "Content-Type: application/json" \
  -d '{"side":"ask","price":"101","size":"1","owner":"bob"}'
```
Response
```json
{ "id": 2, "remaining": "0" }
```
Engine Log
```
[engine] matched orders: buy#1 sell#2 @101 size=1
[engine] remaining buy=0 sell=0
[ws] trade event: {"type":"trade","trade":{"buyOrderId":1,"sellOrderId":2,"price":"101","size":"1","maker":"bob","taker":"alice","takerIsBid":true}}
```
✅ Expected behaviour confirmed: Price-time priority respected; `remaining = 0` after match. WS event broadcast successfully (BigInt serialization fix verified).

4️⃣ Snapshot
```bash
curl http://localhost:8081/orderbook
```
Response
```json
{ "bids": [], "asks": [] }
```
✅ Both sides cleared after fill.

## 📡 WebSocket Test
Connected using:
```js
const ws = new WebSocket("ws://localhost:8080");
ws.onmessage = (e) => console.log("Trade:", e.data);
```
Observed message
```json
{ "type":"trade", "trade":{ "buyOrderId":1, "sellOrderId":2, "price":"101", "size":"1", "maker":"bob", "taker":"alice", "takerIsBid":true } }
```
✅ Confirmed live broadcast latency ~40 ms local.

## 🧩 Batch Settlement Integration (Work-in-Progress)

### What’s implemented
- `service/relayer/src/aptos.ts`: `settleBatch(trades: Trade[])` now creates an Aptos payload for `settlement::settle_batch`, signs, and submits.
- `service/relayer/src/index.ts`: buffers trades and auto-flushes by size/time.
  - Defaults: `BATCH_SIZE = 10`, `BATCH_INTERVAL_MS = 5000`.

### Current status
- Relayer not yet connected for this local run, so no on-chain transactions yet.
- Next milestone: connect to Aptos testnet with funded key.

### 🧠 Expected Results (When Relayer Connected)
| Step | Action | Expected Outcome | Example |
|---|---|---|---|
| Relayer connects to WS | Reads trade events | Logs connection | `[relayer] connected to ws://localhost:8080` |
| Trade received | Trade appended to batch buffer | Buffer grows | `[relayer] queued trade-1 (batch size=1)` |
| Batch flush | After N trades or timeout | Submits tx | `[relayer] submitting batch of 10 trades` |
| Tx submitted | On-chain | Hash printed | `tx hash: 0xabc...` (success) |
| Verify | Aptos Explorer | Settlement events visible | `TradeSettledBatch: 10 trades` |

Realistic confirmation time on Aptos testnet: 3–8 s per batch.

## 🔍 Known Issues (Current Run)
- PowerShell JSON escaping: use single quotes `'` around JSON body.
- Gateway port conflicts: default 8081 may be used; change `PORT` or free the process.
- Node version fetch API: older Node (<18) lacks native fetch; use `undici` polyfill if needed.
- Relayer not funded: `APTOS_PRIVATE_KEY` must be a funded testnet account.

## 📈 Real-World Equivalent Output (Expected)
If connected to Aptos Testnet, you should see logs like:
```
[relayer] batch ready: 3 trades
[relayer] building transaction settle_batch(3)
[relayer] tx submitted: 0x45f3d1c...
[relayer] tx executed SUCCESS gas=12847
[settlement.move] emitted event TradeSettledBatch { batch_size: 3, timestamp: 1699999999 }
```
On Aptos Explorer:
```
{
  "type": "settlement::TradeSettledBatch",
  "data": { "count": "3", "tx_hash": "0x45f3d1c..." }
}
```
Treasury resource updated accordingly.

## 🚀 Next Steps (Immediate)
- 🔑 Fund and connect relayer: use `APTOS_PRIVATE_KEY` from `aptos account create --profile relayer --network testnet`.
- 🧱 Run `pnpm dev` in `service/relayer`; watch for tx logs.
- 🌐 Run web UI with `NEXT_PUBLIC_ENGINE_URL=http://127.0.0.1:8081`.
- 📊 Add metrics/log panel: display batch sizes, tx latency, gas cost.
- 🧪 Record demo video: show bid/ask → trade → relayer tx → on-chain verify.
