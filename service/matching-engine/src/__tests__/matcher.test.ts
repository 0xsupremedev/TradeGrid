import { InMemoryOrderBook } from '../orderbook';

async function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

test('place and match orders', async () => {
  const book = new InMemoryOrderBook();
  const trades: any[] = [];
  book.onTrade((t) => trades.push(t));
  book.placeOrder({ side: 'ask', price: 100n, size: 1n, owner: 'maker' });
  book.placeOrder({ side: 'bid', price: 100n, size: 1n, owner: 'taker' });
  await sleep(10);
  expect(trades.length).toBeGreaterThan(0);
  expect(trades[0].price.toString()).toBe('100');
});


