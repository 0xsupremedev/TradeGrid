import WebSocket from 'ws';
import Database from 'better-sqlite3';
import { canonicalMessageBytes, verifyMessageHex } from '../../shared/crypto';
import { AptosClient, Types } from 'aptos';

type TradeEvent = { tradeId: string; buyOrderId: number; sellOrderId: number; price: string; size: string; maker: string; taker: string; makerPubkey?: string; signature?: string; timestamp: number };

interface BatcherOpts { engineWs: string; aptosNodeUrl: string; privateKeyHex: string; contractAddress: string; batchSize?: number; batchIntervalMs?: number; dbPath?: string }

export class Batcher {
  ws?: WebSocket;
  db: Database.Database;
  buffer: TradeEvent[] = [];
  timer?: NodeJS.Timeout;
  opts: BatcherOpts;
  client: AptosClient;

  constructor(opts: BatcherOpts) {
    this.opts = { batchSize: 20, batchIntervalMs: 5000, dbPath: './relayer.db', ...opts };
    this.db = new Database(this.opts.dbPath!);
    const schema = String(require('fs').readFileSync(require('path').join(__dirname, '../sql/schema.sql')));
    this.db.exec(schema);
    this.client = new AptosClient(this.opts.aptosNodeUrl);
  }

  start() {
    this.ws = new WebSocket(this.opts.engineWs);
    this.ws.on('open', () => console.info(`[relayer] connected ${this.opts.engineWs}`));
    this.ws.on('message', (d) => this.onMessage(String(d)));
    this.ws.on('close', () => { console.warn('[relayer] ws closed, retrying in 3s'); setTimeout(() => this.start(), 3000); });
    this.timer = setInterval(() => this.flushIfNeeded(true), this.opts.batchIntervalMs);
  }

  onMessage(raw: string) {
    try {
      const msg = JSON.parse(raw);
      if (msg.type === 'trade' && msg.trade) {
        const t: TradeEvent = msg.trade;
        if (t.signature && t.makerPubkey) {
          const ok = verifyMessageHex(t.makerPubkey, canonicalMessageBytes({ tradeId: t.tradeId, buyOrderId: t.buyOrderId, sellOrderId: t.sellOrderId, price: t.price, size: t.size, maker: t.maker, taker: t.taker, timestamp: t.timestamp }), t.signature);
          if (!ok) return this.saveFailed(t.tradeId, 'signature_invalid');
        }
        const seen = this.db.prepare('SELECT trade_id FROM processed_trades WHERE trade_id = ?').get(t.tradeId);
        if (seen) return;
        this.buffer.push(t);
        if (this.buffer.length >= (this.opts.batchSize || 20)) this.flush();
      }
    } catch {}
  }

  flushIfNeeded(force = false) {
    if (!this.buffer.length) return;
    if (force || this.buffer.length >= (this.opts.batchSize || 20)) this.flush();
  }

  async flush() {
    if (!this.buffer.length) return;
    const batch = this.buffer.splice(0, this.opts.batchSize || 20);
    const batchId = `batch-${Date.now()}`;
    try {
      const tx = await this.submitBatchOnChain(batch, batchId);
      const now = Date.now();
      this.db.prepare('INSERT OR REPLACE INTO batches(batch_id,size,submitted_at,tx_hash) VALUES(?,?,?,?)').run(batchId, batch.length, now, tx);
      const mark = this.db.prepare('INSERT OR REPLACE INTO processed_trades(trade_id,tx_hash,submitted_at) VALUES(?,?,?)');
      const tr = this.db.transaction((rows: TradeEvent[]) => { for (const r of rows) mark.run(r.tradeId, tx, now); });
      tr(batch);
    } catch (e) {
      for (const t of batch) this.saveFailed(t.tradeId, String(e));
    }
  }

  saveFailed(tradeId: string, reason: string) {
    const now = Date.now();
    this.db.prepare('INSERT OR REPLACE INTO failed_trades(trade_id,reason,last_attempt_at,attempts) VALUES(?,?,?,COALESCE((SELECT attempts FROM failed_trades WHERE trade_id = ?),0)+1)')
      .run(tradeId, reason, now, tradeId);
  }

  async submitBatchOnChain(batch: TradeEvent[], batchId: string): Promise<string> {
    const fn = `${this.opts.contractAddress}::settlement::settle_batch`;
    const tradesArg = batch.map((t) => ({ trade_id: t.tradeId, buy_order_id: t.buyOrderId.toString(), sell_order_id: t.sellOrderId.toString(), price: t.price, size: t.size, maker: t.maker, taker: t.taker, timestamp: t.timestamp.toString(), maker_pubkey: t.makerPubkey || '', signature: t.signature || '' }));
    const payload: Types.UserTransactionRequest = { function: fn, type_arguments: [], arguments: [JSON.stringify(tradesArg), batchId] } as any;
    // Replace with real sign/submit; this is a placeholder flow using Faucet-like local signer in your environment.
    const res: any = await this.client.view({ function: fn, type_arguments: [], arguments: [] } as any).catch(() => ({ hash: `0x${Math.random().toString(16).slice(2)}` }));
    return res.hash || `0x${Math.random().toString(16).slice(2)}`;
  }
}


