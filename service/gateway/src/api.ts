import Fastify from 'fastify';
import { z } from 'zod';

const app = Fastify({ logger: false });
// CORS for local dev (web on 3000/4100/4200)
app.addHook('onRequest', async (req, reply) => {
  reply.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  reply.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    reply.status(204).send();
  }
});
const ENGINE_URL = process.env.ENGINE_URL || 'http://localhost:8080';

app.post('/place_order', async (req, reply) => {
  const schema = z.object({ side: z.enum(['bid', 'ask']), price: z.string(), size: z.string(), owner: z.string() });
  const body = schema.parse(req.body);
  const res = await fetch(ENGINE_URL + '/place_order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  reply.status(res.status).send(await res.json());
});

app.get('/orderbook', async (_req, reply) => {
  const res = await fetch(ENGINE_URL + '/orderbook');
  reply.status(res.status).send(await res.json());
});

app.get('/health', async (_req, reply) => {
  reply.send({ ok: true });
});

const port = Number(process.env.PORT || 8081);
app.listen({ port, host: '0.0.0.0' }).then(() => console.log('gateway on :' + port));


