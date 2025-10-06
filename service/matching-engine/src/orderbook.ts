export type OrderSide = 'bid' | 'ask';

export interface PlaceOrderRequest {
  side: OrderSide;
  price: bigint;
  size: bigint;
  owner: string;
}

export interface Order extends PlaceOrderRequest {
  id: number;
  remaining: bigint;
}

export interface TradeEvent {
  buyOrderId: number;
  sellOrderId: number;
  price: bigint;
  size: bigint;
  maker: string;
  taker: string;
  takerIsBid: boolean;
}

type TradeListener = (t: TradeEvent) => void;

export class InMemoryOrderBook {
  private nextOrderId = 1;
  private bids: Order[] = [];
  private asks: Order[] = [];
  private listeners: TradeListener[] = [];

  onTrade(listener: TradeListener) {
    this.listeners.push(listener);
  }

  private emitTrade(event: TradeEvent) {
    for (const l of this.listeners) l(event);
  }

  placeOrder(req: PlaceOrderRequest) {
    const order: Order = {
      id: this.nextOrderId++,
      side: req.side,
      price: req.price,
      size: req.size,
      owner: req.owner,
      remaining: req.size,
    };
    if (order.side === 'bid') {
      this.matchBid(order);
      if (order.remaining > 0n) this.insertBid(order);
    } else {
      this.matchAsk(order);
      if (order.remaining > 0n) this.insertAsk(order);
    }
    return { id: order.id, remaining: order.remaining.toString() };
  }

  cancelOrder(id: number) {
    const idxB = this.bids.findIndex((o) => o.id === id);
    if (idxB >= 0) {
      const [removed] = this.bids.splice(idxB, 1);
      return { cancelled: removed.id };
    }
    const idxA = this.asks.findIndex((o) => o.id === id);
    if (idxA >= 0) {
      const [removed] = this.asks.splice(idxA, 1);
      return { cancelled: removed.id };
    }
    return { cancelled: null };
  }

  snapshot() {
    return {
      bids: this.bids.map((o) => ({ id: o.id, price: o.price.toString(), remaining: o.remaining.toString() })),
      asks: this.asks.map((o) => ({ id: o.id, price: o.price.toString(), remaining: o.remaining.toString() })),
    };
  }

  private matchBid(bid: Order) {
    // Match against best asks (lowest price first)
    this.asks.sort((a, b) => Number(a.price - b.price));
    let i = 0;
    while (i < this.asks.length && bid.remaining > 0n) {
      const ask = this.asks[i];
      if (ask.price > bid.price) break;
      const traded = bid.remaining < ask.remaining ? bid.remaining : ask.remaining;
      bid.remaining -= traded;
      ask.remaining -= traded;
      this.emitTrade({
        buyOrderId: bid.id,
        sellOrderId: ask.id,
        price: ask.price,
        size: traded,
        maker: ask.owner,
        taker: bid.owner,
        takerIsBid: true,
      });
      if (ask.remaining === 0n) this.asks.splice(i, 1); else i++;
    }
  }

  private matchAsk(ask: Order) {
    // Match against best bids (highest price first)
    this.bids.sort((a, b) => Number(b.price - a.price));
    let i = 0;
    while (i < this.bids.length && ask.remaining > 0n) {
      const bid = this.bids[i];
      if (bid.price < ask.price) break;
      const traded = ask.remaining < bid.remaining ? ask.remaining : bid.remaining;
      ask.remaining -= traded;
      bid.remaining -= traded;
      this.emitTrade({
        buyOrderId: bid.id,
        sellOrderId: ask.id,
        price: bid.price,
        size: traded,
        maker: bid.owner,
        taker: ask.owner,
        takerIsBid: false,
      });
      if (bid.remaining === 0n) this.bids.splice(i, 1); else i++;
    }
  }

  private insertBid(order: Order) {
    this.bids.push(order);
  }

  private insertAsk(order: Order) {
    this.asks.push(order);
  }
}


