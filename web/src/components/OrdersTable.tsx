import { useMemo, useState } from 'react';
import { useAppStore } from '../state/store';

type SortKey = 'id' | 'side' | 'price' | 'size' | 'status';

export default function OrdersTable() {
  const { orderBook } = useAppStore();
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('price');
  const [asc, setAsc] = useState(false);

  const rows = useMemo(() => {
    const merged = [...orderBook.bids, ...orderBook.asks];
    const filtered = merged.filter((r) => [r.id, r.side, r.status].some((v) => String(v || '').toLowerCase().includes(query.toLowerCase())));
    const sorted = filtered.sort((a, b) => {
      const A: any = (a as any)[sortKey];
      const B: any = (b as any)[sortKey];
      return (A > B ? 1 : A < B ? -1 : 0) * (asc ? 1 : -1);
    });
    return sorted;
  }, [orderBook, query, sortKey, asc]);

  function toggle(key: SortKey) {
    if (sortKey === key) setAsc(!asc); else { setSortKey(key); setAsc(false); }
  }

  return (
    <div className="glass rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs uppercase text-slate-400">Active Orders</div>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter..." className="bg-transparent border border-white/10 rounded px-2 py-1 text-sm outline-none focus:border-neon" />
      </div>
      <div className="grid grid-cols-5 text-xs text-slate-400">
        <button className="text-left" onClick={() => toggle('id')}>ID</button>
        <button className="text-left" onClick={() => toggle('side')}>Side</button>
        <button className="text-left" onClick={() => toggle('price')}>Price</button>
        <button className="text-left" onClick={() => toggle('size')}>Size</button>
        <button className="text-left" onClick={() => toggle('status')}>Status</button>
      </div>
      <div className="mt-1 divide-y divide-white/5 max-h-64 overflow-auto">
        {rows.map((r) => (
          <div key={r.id} className="grid grid-cols-5 text-sm py-1">
            <div className="text-slate-300">{r.id}</div>
            <div className={r.side === 'bid' ? 'text-emerald-400' : 'text-rose-400'}>{r.side}</div>
            <div className="text-slate-200">{r.price}</div>
            <div className="text-slate-200">{r.remaining ?? r.size}</div>
            <div className="text-slate-400">{r.status || 'open'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}


