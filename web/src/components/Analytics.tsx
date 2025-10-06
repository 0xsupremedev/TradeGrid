import { useAppStore } from '../state/store';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

export default function Analytics() {
  const { tps, relayerOnline } = useAppStore();
  const data = Array.from({ length: 24 }).map((_, i) => ({ h: i, v: Math.max(0, Math.sin(i / 3) * 50 + 100) }));
  const tpsColor = tps > 10 ? 'text-emerald-400' : tps > 3 ? 'text-amber-400' : 'text-rose-400';
  return (
    <div className="glass rounded-lg p-3 space-y-3 border border-cyan-400/20 backdrop-blur-md w-full">
      <div className="text-xs uppercase text-slate-400">Network Metrics</div>
      <div className="flex items-center justify-between">
        <div className="text-slate-400 text-sm">TPS</div>
        <div className={`text-2xl font-semibold ${tpsColor}`}>{tps.toFixed(0)}</div>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-slate-400 text-sm">Relayer</div>
        <div className={relayerOnline ? 'text-emerald-400' : 'text-rose-400'}>{relayerOnline ? 'Online' : 'Offline'}</div>
      </div>
      <div>
        <div className="text-slate-400 text-sm mb-1">24h Volume</div>
        <div className="h-24">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <Line type="monotone" dataKey="v" stroke="#00FFFF" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}


