import { useEffect } from 'react';
import { useAppStore } from '../state/store';
import { motion } from 'framer-motion';

export default function TradeFeed() {
  const { trades, addTrade } = useAppStore();
  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_ENGINE_URL || '';
    if (!base) return;
    const wsUrl = base.replace('http', 'ws');
    const ws = new WebSocket(wsUrl);
    ws.onmessage = (msg) => {
      try {
        const data = JSON.parse(String(msg.data));
        if (data.type === 'trade') addTrade(data.trade);
      } catch {}
    };
    return () => ws.close();
  }, [addTrade]);
  return (
    <div className="glass rounded-lg p-3 overflow-hidden border border-cyan-400/20">
      <div className="text-xs uppercase text-slate-400 mb-2">Recent Trades</div>
      <div className="whitespace-nowrap overflow-hidden">
        <motion.div className="inline-block" animate={{ x: ['0%', '-50%'] }} transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}>
          {trades.map((t) => (
            <span key={t.id} className={`mx-6 ${t?.side==='bid'?'text-emerald-400':'text-rose-400'}`}>
              <span className="text-slate-400">{t.id}</span> | {t.price} | {t.size} | {t.maker || 'maker'} → {t.taker || 'taker'}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}


