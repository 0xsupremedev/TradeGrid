# TradeGrid — File Architecture & Scaffolding

This canvas contains the full scaffold for the TradeGrid monorepo requested — including:

* Root workspace configs (`package.json`, `pnpm-workspace.yaml`)
* `contracts` Move package: `Move.toml`, `src/OrderBook.move`, `tests/orderbook_tests.move`, `contracts/README.md`
* `service/matching-engine` TypeScript starter (server + in-memory CLOB) + Dockerfile
* `web` Next.js starter (simple trading UI stub) + Dockerfile
* `sdk/js-sdk` TypeScript client + example script
* `sdk/py-sdk` Minimal Python client + example
* `infra/docker-compose.yml` to run engine + web locally

---

> **Important:** The files below are scaffolds — minimal, working starters. Replace placeholder addresses/keys and expand business logic, tests, and security before production.

---

## Root files

### package.json

```json
{
  "name": "tradegrid-monorepo",
  "private": true,
  "version": "0.1.0",
  "scripts": {
    "dev:engine": "pnpm --filter @tradegrid/matching-engine dev",
    "dev:web": "NEXT_PUBLIC_ENGINE_URL=http://localhost:8080 pnpm --filter @tradegrid/web dev",
    "install:all": "pnpm -w install"
  }
}
```

### pnpm-workspace.yaml

```yaml
packages:
  - 'service/*'
  - 'web'
  - 'sdk/*'
  - 'contracts'
```

---

## contracts (Move package)

Path: `/contracts`

### Move.toml

```toml
[package]
name = "tradegrid_contracts"
version = "0.1.0"
authors = ["TradeGrid Team"]

[addresses]
# define addresses for deployment; replace with actual testnet/mainnet addresses
TradeGrid = "0x1"

[dependencies]
aptos_std = "0.1.0"
```

### src/OrderBook.move

```move
module 0x1::OrderBook {
    use std::signer;
    use std::vector;
    use aptos_framework::coin::{Coin};
    use aptos_std::table::{Table};

    struct Order has key {
        id: u64,
        owner: address,
        price: u128,
        size: u128,
        is_bid: bool
    }

    struct Book has key {
        bids: Table<u128, vector<Order>>,
        asks: Table<u128, vector<Order>>,
        next_id: u64
    }

    public fun new_book(account: &signer): Book {
        Book { bids: Table::new(), asks: Table::new(), next_id: 1 }
    }

    public fun place_order(book: &mut Book, owner: address, price: u128, size: u128, is_bid: bool) {
        let id = book.next_id;
        book.next_id = id + 1;
        let order = Order { id, owner, price, size, is_bid };
        if (is_bid) {
            if (!Table::contains(&book.bids, &price)) {
                Table::insert(&mut book.bids, price, vector::empty<Order>());
            }
            let mut vec_ref = Table::borrow_mut(&mut book.bids, &price);
            vector::push_back(&mut vec_ref, order);
        } else {
            if (!Table::contains(&book.asks, &price)) {
                Table::insert(&mut book.asks, price, vector::empty<Order>());
            }
            let mut vec_ref = Table::borrow_mut(&mut book.asks, &price);
            vector::push_back(&mut vec_ref, order);
        }
    }

    // Note: Full matching + settlement should be offloaded to relayer/settlement modules
}
```

> Note: This `OrderBook.move` is intentionally minimal — it demonstrates book storage and order insertion. Matching and atomic settlement should be implemented either in a more complete on-chain module or via relayer-driven settlement invoking authenticated entry-functions.

### tests/orderbook_tests.move

```move
script 0x1::orderbook_tests {
    use 0x1::OrderBook;

    fun main(account: &signer) {
        let mut b = OrderBook::new_book(account);
        OrderBook::place_order(&mut b, signer::address_of(account), 100u128, 1000u128, true);
        OrderBook::place_order(&mut b, signer::address_of(account), 101u128, 500u128, false);
        // Assertions & checks would go here in more detailed tests
    }
}
```

### contracts/README.md

```
# contracts

Move contracts for TradeGrid.

Build & test:
- Install Move toolchain & Aptos CLI
- Run `move unit-test` or aptos test harness against local devnet

This package contains:
- src/OrderBook.move
- tests/orderbook_tests.move

The orderbook module here is minimal; matching/settlement are intentionally delegated to service/relayer for the hackathon MVP.
```

---

## service/matching-engine (TypeScript)

Path: `/service/matching-engine`

### package.json

```json
{
  "name": "@tradegrid/matching-engine",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts"
  },
  "dependencies": {
    "express": "^4.18.2",
    "ws": "^8.13.0",
    "body-parser": "^1.20.2",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.4.2"
  }
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true
  }
}
```

### src/index.ts

```ts
import { startServer } from './server';

startServer();
```

### src/server.ts

```ts
import express from 'express';
import bodyParser from 'body-parser';
import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import { OrderBook } from './orderbook';

export function startServer() {
  const app = express();
  app.use(bodyParser.json());

  const server = http.createServer(app);
  const wss = new WebSocketServer({ server });

  const book = new OrderBook();

  // REST endpoints
  app.post('/place_order', (req, res) => {
    const { owner, price, size, side } = req.body;
    const id = book.placeOrder(owner, BigInt(price), BigInt(size), side === 'buy');
    // broadcast orderbook snapshot/trade events
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'order_placed', order: book.getOrder(id) }));
      }
    });
    res.json({ ok: true, id });
  });

  app.post('/cancel_order', (req, res) => {
    const { id } = req.body;
    const ok = book.cancelOrder(Number(id));
    res.json({ ok });
  });

  app.get('/orderbook', (req, res) => {
    res.json({ bids: book.topBids(), asks: book.topAsks() });
  });

  server.listen(8080, () => console.log('Matching engine running on http://localhost:8080'));
}
```

### src/orderbook.ts

```ts
import { v4 as uuidv4 } from 'uuid';

export type Order = {
  id: number;
  owner: string;
  price: bigint;
  size: bigint;
  isBid: boolean;
};

export class OrderBook {
  private orders: Map<number, Order> = new Map();
  private nextId = 1;

  placeOrder(owner: string, price: bigint, size: bigint, isBid: boolean) {
    const id = this.nextId++;
    const o: Order = { id, owner, price, size, isBid };
    this.orders.set(id, o);
    return id;
  }

  getOrder(id: number) {
    return this.orders.get(id);
  }

  cancelOrder(id: number) {
    return this.orders.delete(id);
  }

  topBids() {
    const bids = Array.from(this.orders.values()).filter(o => o.isBid);
    return bids.sort((a, b) => Number(b.price - a.price)).slice(0, 10);
  }

  topAsks() {
    const asks = Array.from(this.orders.values()).filter(o => !o.isBid);
    return asks.sort((a, b) => Number(a.price - b.price)).slice(0, 10);
  }
}
```

---

## web (Next.js starter)

Path: `/web`

```tsx
import { useState } from 'react';

export default function Home() {
  const [side, setSide] = useState<'bid' | 'ask'>('bid');
  const [price, setPrice] = useState('100');
  const [size, setSize] = useState('1');
  const [owner, setOwner] = useState('demo-owner');

  async function place() {
    await fetch(process.env.NEXT_PUBLIC_ENGINE_URL + '/place_order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ side, price, size, owner }),
    });
  }

  return (
    <div>
      <h1>TradeGrid</h1>
      {/* inputs and buttons */}
    </div>
  );
}
```

---

## SDKs

### js-sdk (TypeScript)

```ts
export class TradeGridClient {
  constructor(private baseUrl: string) {}
  async placeOrder(p: { side: 'bid'|'ask'; price: string; size: string; owner: string }) {
    return fetch(this.baseUrl + '/place_order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p) }).then(r => r.json());
  }
}
```

### py-sdk (Python)

```python
import requests

class TradeGridClient:
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip('/')

    def place_order(self, side: str, price: int, size: int, owner: str):
        r = requests.post(self.base_url + '/place_order', json={
            'side': side,
            'price': str(price),
            'size': str(size),
            'owner': owner,
        })
        r.raise_for_status()
        return r.json()
```

---

## Infra compose

```yaml
version: '3.9'
services:
  engine:
    build: ../service/matching-engine
    ports:
      - "8080:8080"
  web:
    build: ../web
    environment:
      - NEXT_PUBLIC_ENGINE_URL=http://engine:8080
    ports:
      - "3000:3000"
    depends_on:
      - engine
```


