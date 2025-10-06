import WebSocket from 'ws';
import { settleTrade, settleBatch } from './aptos';

const ENGINE_WS = process.env.ENGINE_WS || 'ws://localhost:8080';

function submitSettlement(trade: any) {
  // Placeholder: integrate Aptos SDK / Move calls here
  // eslint-disable-next-line no-console
  console.log('Submitting settlement for trade', trade);
}

const BATCH_SIZE = Number(process.env.BATCH_SIZE || 5);
const BATCH_INTERVAL_MS = Number(process.env.BATCH_INTERVAL_MS || 1500);

function main() {
  const ws = new WebSocket(ENGINE_WS);
  const buffer: any[] = [];
  let timer: NodeJS.Timeout | null = null;

  function flush() {
    if (buffer.length === 0) return;
    const trades = buffer.splice(0, buffer.length);
    settleBatch(trades.map((t) => ({
      buyOrderId: t.buyOrderId,
      sellOrderId: t.sellOrderId,
      price: String(t.price),
      size: String(t.size),
      maker: t.maker,
      taker: t.taker,
      takerIsBid: !!t.takerIsBid,
    }))).then(({ txHash }) => {
      // eslint-disable-next-line no-console
      console.log('settled batch tx', txHash, 'size', trades.length);
    }).catch((e) => console.error('settleBatch error', e));
  }

  function scheduleFlush() {
    if (timer) return;
    timer = setTimeout(() => {
      timer = null;
      flush();
    }, BATCH_INTERVAL_MS);
  }
  ws.on('open', () => {
    // eslint-disable-next-line no-console
    console.log('Relayer connected to', ENGINE_WS);
  });
  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(String(data));
      if (msg.type === 'trade') {
        submitSettlement(msg.trade);
        buffer.push(msg.trade);
        if (buffer.length >= BATCH_SIZE) flush(); else scheduleFlush();
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Invalid message', e);
    }
  });
  ws.on('close', () => {
    // eslint-disable-next-line no-console
    console.log('Relayer disconnected');
    setTimeout(main, 1000);
  });
}

main();


