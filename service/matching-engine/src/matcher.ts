import { InMemoryOrderBook, Order, TradeEvent } from './orderbook';

export class Matcher {
  constructor(private book: InMemoryOrderBook) {}

  place(order: Omit<Order, 'id' | 'remaining'> & { id?: number }) {
    return this.book.placeOrder({ side: order.side, price: order.price, size: order.size, owner: order.owner });
  }

  onTrade(cb: (t: TradeEvent) => void) {
    this.book.onTrade(cb);
  }
}


