import { TradeGridClient } from '../index';

async function run() {
  const client = new TradeGridClient({ baseUrl: process.env.ENGINE_URL || 'http://localhost:8080' });
  await client.placeOrder({ side: 'bid', price: 100n, size: 1n, owner: 'sdk-demo' });
  console.log(await client.orderbook());
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});


