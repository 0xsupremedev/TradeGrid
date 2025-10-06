import { create } from 'zustand';

export type Order = { id: string; side: 'bid' | 'ask'; price: number; size: number; remaining?: number; status?: string };
export type Trade = { id: string; price: number; size: number; maker?: string; taker?: string; ts?: number };

type OrderBook = { bids: Order[]; asks: Order[] };

type AppState = {
  orderBook: OrderBook;
  trades: Trade[];
  tps: number;
  relayerOnline: boolean;
  setOrderBook: (ob: OrderBook) => void;
  addTrade: (t: Trade) => void;
  setTps: (v: number) => void;
  setRelayer: (v: boolean) => void;
};

export const useAppStore = create<AppState>((set) => ({
  orderBook: { bids: [], asks: [] },
  trades: [],
  tps: 0,
  relayerOnline: true,
  setOrderBook: (orderBook) => set({ orderBook }),
  addTrade: (t) => set((s) => ({ trades: [t, ...s.trades].slice(0, 100) })),
  setTps: (v) => set({ tps: v }),
  setRelayer: (v) => set({ relayerOnline: v }),
}));


