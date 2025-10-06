import { TradeGridClient } from '../sdk/js-sdk/src/client';

async function main() {
  const baseUrl = process.env.ENGINE_URL || 'http://localhost:8080';
  const client = new TradeGridClient(baseUrl);
  const n = Number(process.env.N || 100);
  const side = (process.env.SIDE as 'bid' | 'ask') || 'bid';
  const start = Date.now();
  await Promise.all(Array.from({ length: n }).map((_v, i) =>
    client.placeOrder({ side, price: 100 + (i % 10), size: 1, owner: 'loadtest' })
  ));
  const ms = Date.now() - start;
  console.log({ submitted: n, ms, perSec: (n / (ms / 1000)).toFixed(1) });
}

main();


