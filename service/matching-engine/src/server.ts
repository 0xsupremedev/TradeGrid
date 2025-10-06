import Fastify from 'fastify';
import { WebSocketServer } from 'ws';
import { z } from 'zod';
import { InMemoryOrderBook, PlaceOrderRequest } from './orderbook';

export async function createServer() {
  const app = Fastify({ logger: true });
  // CORS for local dev
  app.addHook('onRequest', async (req, reply) => {
    reply.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    reply.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      reply.status(204).send();
    }
  });
  const book = new InMemoryOrderBook();

  const startedAt = () => process.hrtime.bigint();
  const toMs = (ns: bigint) => Number(ns) / 1e6;

  app.post('/place_order', async (req, reply) => {
    const t0 = startedAt();
    const schema = z.object({
      side: z.enum(['bid', 'ask']),
      price: z.string(),
      size: z.string(),
      owner: z.string().min(2),
    });
    const body = schema.parse(req.body);
    const result = book.placeOrder({
      side: body.side,
      price: BigInt(body.price),
      size: BigInt(body.size),
      owner: body.owner,
    } satisfies PlaceOrderRequest);
    const t1 = startedAt();
    reply.header('x-duration-ms', toMs(t1 - t0).toFixed(2)).send(result);
  });

  app.post('/cancel_order', async (req, reply) => {
    const schema = z.object({ id: z.number().int().positive() });
    const body = schema.parse(req.body);
    const result = book.cancelOrder(body.id);
    reply.send(result);
  });

  app.get('/orderbook', async (_req, reply) => {
    const t0 = startedAt();
    const res = book.snapshot();
    const t1 = startedAt();
    reply.header('x-duration-ms', toMs(t1 - t0).toFixed(2)).send(res);
  });

  const server = app.server;
  const wss = new WebSocketServer({ server });
  book.onTrade((trade) => {
    const payload = JSON.stringify({
      type: 'trade',
      trade: {
        ...trade,
        price: trade.price.toString(),
        size: trade.size.toString(),
      },
    });
    for (const client of wss.clients) {
      if (client.readyState === 1) client.send(payload);
    }
  });

  return app;
}


