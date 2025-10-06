import { TradeGridClient } from '../../sdk/js-sdk/src/client';

test('end-to-end place and snapshot', async () => {
  const client = new TradeGridClient(process.env.ENGINE_URL || 'http://localhost:8080');
  await client.placeOrder({ side: 'bid', price: 100, size: 1, owner: 'e2e' });
  const ob = await client.orderbook();
  expect(ob.bids.length + ob.asks.length).toBeGreaterThan(0);
});


