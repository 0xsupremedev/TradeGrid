export class TradeGridClient {
  constructor(private baseUrl: string) {
    this.baseUrl = this.baseUrl.replace(/\/$/, '');
  }

  async placeOrder(p: { side: 'bid'|'ask'; price: string|number|bigint; size: string|number|bigint; owner: string }) {
    const res = await fetch(this.baseUrl + '/place_order', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...p, price: p.price.toString(), size: p.size.toString() })
    });
    if (!res.ok) throw new Error('placeOrder failed');
    return res.json();
  }

  async cancelOrder(id: number) {
    const res = await fetch(this.baseUrl + '/cancel_order', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id })
    });
    if (!res.ok) throw new Error('cancelOrder failed');
    return res.json();
  }

  async orderbook() {
    const res = await fetch(this.baseUrl + '/orderbook');
    if (!res.ok) throw new Error('orderbook failed');
    return res.json();
  }
}


