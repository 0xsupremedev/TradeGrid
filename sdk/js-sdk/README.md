# TradeGrid JS SDK

Install and usage:

```ts
import { TradeGridClient } from '@tradegrid/sdk';

const client = new TradeGridClient('http://localhost:8080');
await client.placeOrder({ side: 'bid', price: 100, size: 1, owner: 'demo' });
console.log(await client.orderbook());
```

API:
- `placeOrder({ side, price, size, owner })`
- `cancelOrder(id)`
- `orderbook()`



