import { useEffect, useRef } from 'react';
import { createChart, ISeriesApi } from 'lightweight-charts';

export default function Chart() {
  const ref = useRef<HTMLDivElement | null>(null);
  const series = useRef<ISeriesApi<'Candlestick'> | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const chart = createChart(ref.current, {
      layout: { background: { color: 'transparent' }, textColor: '#9aa4b2' },
      grid: { vertLines: { color: 'rgba(255,255,255,0.06)' }, horzLines: { color: 'rgba(255,255,255,0.06)' } },
      timeScale: { timeVisible: true, borderColor: 'rgba(255,255,255,0.08)' },
      rightPriceScale: { borderColor: 'rgba(255,255,255,0.1)' },
    });
    const s = chart.addCandlestickSeries({ upColor: '#16a34a', downColor: '#ef4444', borderDownColor: '#ef4444', borderUpColor: '#16a34a', wickDownColor: '#ef4444', wickUpColor: '#16a34a' });
    series.current = s;
    s.setData(sample());
    // moving average overlays
    const ma5 = chart.addLineSeries({ color: '#60a5fa', lineWidth: 1 });
    const ma10 = chart.addLineSeries({ color: '#f472b6', lineWidth: 1 });
    const data = sample();
    const m5 = movingAverage(data, 5);
    const m10 = movingAverage(data, 10);
    ma5.setData(m5);
    ma10.setData(m10);
    const onResize = () => chart.applyOptions({ width: ref.current?.clientWidth || 600, height: 300 });
    onResize();
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); chart.remove(); };
  }, []);

  return <div className="glass rounded-lg p-3 border border-cyan-400/20"><div ref={ref} className="w-full h-[320px]" /></div>;
}

function sample() {
  const now = Math.floor(Date.now() / 1000) - 3600 * 24;
  const out: any[] = [];
  let price = 100;
  for (let i = 0; i < 120; i++) {
    const open = price;
    const delta = (Math.random() - 0.5) * 2;
    price = Math.max(1, price + delta);
    const close = price;
    const high = Math.max(open, close) + Math.random();
    const low = Math.min(open, close) - Math.random();
    out.push({ time: now + i * 60, open, high, low, close });
  }
  return out;
}

function movingAverage(data: any[], period: number) {
  const out: any[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period) continue;
    const slice = data.slice(i - period, i);
    const avg = slice.reduce((a, b) => a + b.close, 0) / period;
    out.push({ time: data[i].time, value: Number(avg.toFixed(4)) });
  }
  return out;
}


