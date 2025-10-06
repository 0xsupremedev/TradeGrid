import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { useAppStore } from '../state/store';

export default function OrderBook() {
  const { orderBook, setOrderBook } = useAppStore();

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_ENGINE_URL;
    if (!base) return;
    const ctrl = new AbortController();
    (async () => {
      try {
        const r = await fetch(base + '/orderbook', { signal: ctrl.signal });
        if (!r.ok) return;
        const j = await r.json();
        setOrderBook(j);
      } catch {}
    })();
    return () => ctrl.abort();
  }, [setOrderBook]);

  function Table({ rows, side }: { rows: any[]; side: 'bid' | 'ask' }) {
    const best = rows[0];
    return (
      <div className="glass rounded-lg p-3">
        <div className="text-xs uppercase text-slate-400 mb-2 flex items-center justify-between">
          <span>{side === 'bid' ? 'Bids' : 'Asks'}</span>
        </div>
        <div className="grid grid-cols-3 text-[11px] text-slate-400 mb-1">
          <div>Price</div><div>Size</div><div>Total</div>
        </div>
        <div className="space-y-0.5">
          <AnimatePresence initial={false}>
            {rows.slice(0, 26).map((r) => {
              const size = r.remaining ?? r.size;
              const total = size * r.price;
              const intensity = Math.min(1, size / (best ? (best.remaining ?? best.size || 1) : 1));
              const bg = side === 'bid' ? `rgba(16,185,129,${0.08 * intensity})` : `rgba(244,63,94,${0.08 * intensity})`;
              const isBest = best && r.id === best.id;
              return (
                <motion.div key={r.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }} className="grid grid-cols-3 text-[13px] px-1 py-0.5 rounded" style={{ background: bg, boxShadow: isBest ? '0 0 10px rgba(0,255,255,0.15)' : undefined }}>
                  <div className={side === 'bid' ? 'text-emerald-400' : 'text-rose-400'}>{r.price}</div>
                  <div className="text-slate-200">{size}</div>
                  <div className="text-slate-300">{total.toFixed(2)}</div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  const topBid = orderBook.bids[0]?.price ?? 0;
  const topAsk = orderBook.asks[0]?.price ?? 0;
  const spread = topBid && topAsk ? (topAsk - topBid).toFixed(4) : '-';

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-3">
        <Table rows={orderBook.bids} side="bid" />
        <Table rows={orderBook.asks} side="ask" />
      </div>
      <div className="glass rounded-lg px-3 py-2 text-xs flex items-center justify-between">
        <span className="text-slate-400">Spread</span>
        <span className="text-neon">{spread}</span>
      </div>
    </div>
  );
}


