# API Spec

## Gateway / Engine

- POST /place_order { side: 'bid'|'ask', price: string, size: string, owner: string }
- POST /cancel_order { id: number }
- GET /orderbook -> { bids: { id, price, remaining }[], asks: ... }
- WS: { type: 'trade', trade: { buyOrderId, sellOrderId, price, size, maker, taker, takerIsBid } }


