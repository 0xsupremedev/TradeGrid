import { createContext, PropsWithChildren, useContext, useEffect } from 'react';
import { useAppStore } from '../state/store';

const EngineCtx = createContext({});

export function EngineProvider({ children }: PropsWithChildren<{}>) {
  const { setOrderBook, addTrade, setTps, setRelayer } = useAppStore();

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_ENGINE_URL || '';
    if (!base) return;
    // REST bootstrap
    fetch(base + '/orderbook').then((r) => r.ok ? r.json() : null).then((j) => { if (j) setOrderBook(j); }).catch(() => {});

    // WebSocket live feed
    const ws = new WebSocket(base.replace('http', 'ws'));
    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(String(e.data));
        switch (msg.type) {
          case 'orderbook':
            setOrderBook(msg.data);
            break;
          case 'trade':
            addTrade(msg.trade);
            break;
          case 'tps':
            setTps(Number(msg.value) || 0);
            break;
          case 'relayer':
            setRelayer(!!msg.online);
            break;
        }
      } catch {}
    };
    ws.onclose = () => setRelayer(false);
    return () => ws.close();
  }, [setOrderBook, addTrade, setTps, setRelayer]);

  return <EngineCtx.Provider value={{}}>{children}</EngineCtx.Provider>;
}

export function useEngine() { return useContext(EngineCtx); }


