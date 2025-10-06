import { useRouter } from 'next/router';
import OrderForm from '../../components/OrderForm';
import OrderBook from '../../components/OrderBook';
import TradeFeed from '../../components/TradeFeed';

export default function MarketPage() {
  const router = useRouter();
  const { symbol } = router.query as { symbol?: string };
  return (
    <div style={{ maxWidth: 960, margin: '24px auto' }}>
      <h2>Market {symbol}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <OrderBook />
        <div>
          <OrderForm />
          <TradeFeed />
        </div>
      </div>
    </div>
  );
}


