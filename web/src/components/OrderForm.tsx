import { useState, useEffect } from 'react';
import { useApi } from '../services/api';
import { useWallet } from '../hooks/useWallet';

export default function OrderForm() {
  const api = useApi();
  const { address } = useWallet();
  const [side, setSide] = useState<'bid' | 'ask'>('bid');
  const [price, setPrice] = useState('100');
  const [size, setSize] = useState('1');
  const [owner, setOwner] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => { if (address) setOwner(address); }, [address]);

  const priceValid = /^[0-9]+(\.[0-9]+)?$/.test(price);
  const sizeValid = /^[0-9]+(\.[0-9]+)?$/.test(size);
  const canSubmit = priceValid && sizeValid && (owner || address);
  return (
    <div className="glass rounded-lg p-3 border border-cyan-400/20">
      <div className="text-xs uppercase text-slate-400 mb-2">Place Order</div>
      <div className="flex gap-2 items-center mb-2">
        <button onClick={() => setSide('bid')} className={`px-3 py-1 rounded border transition-shadow hover:shadow-glow ${side==='bid'?'border-neon text-neon':'border-white/10 text-slate-300'}`}>Bid</button>
        <button onClick={() => setSide('ask')} className={`px-3 py-1 rounded border transition-shadow hover:shadow-glow ${side==='ask'?'border-rose-400 text-rose-400':'border-white/10 text-slate-300'}`}>Ask</button>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <input placeholder="Enter price in APT" value={price} onChange={(e) => setPrice(e.target.value)} className={`bg-transparent border rounded px-2 py-1 outline-none focus:border-neon ${priceValid?'border-white/10':'border-rose-400/60'}`} />
        <input placeholder="Enter size" value={size} onChange={(e) => setSize(e.target.value)} className={`bg-transparent border rounded px-2 py-1 outline-none focus:border-neon ${sizeValid?'border-white/10':'border-rose-400/60'}`} />
        <input placeholder="Owner" value={owner} onChange={(e) => setOwner(e.target.value)} className="col-span-2 bg-transparent border border-white/10 rounded px-2 py-1 outline-none focus:border-neon" />
      </div>
      <button disabled={!canSubmit} className="w-full border border-neon text-neon rounded py-2 hover:shadow-glow transition-shadow disabled:opacity-50 disabled:cursor-not-allowed" onClick={async () => {
        setMsg(null); setErr(null);
        if (!/^[0-9]+(\.[0-9]+)?$/.test(price) || !/^[0-9]+(\.[0-9]+)?$/.test(size)) { setErr('Price/size must be numeric'); return; }
        try {
          await api.placeOrder({ side, price, size, owner: owner || address || 'unknown' });
          setMsg('Order placed');
        } catch (e: any) { setErr(e?.message || 'Failed to place order'); }
      }}>Place Order</button>
      {msg && <div className="text-emerald-400 mt-2 text-sm">{msg}</div>}
      {err && <div className="text-rose-400 mt-2 text-sm">{err}</div>}
    </div>
  );
}


