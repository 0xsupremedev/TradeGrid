import Navbar from '../components/Navbar';
import OrderBook from '../components/OrderBook';
import Chart from '../components/Chart';
import OrdersTable from '../components/OrdersTable';
import OrderForm from '../components/OrderForm';
import TradeFeed from '../components/TradeFeed';
import Analytics from '../components/Analytics';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr_1fr] gap-4">
          <div className="space-y-4">
            <OrderBook />
            <Analytics />
          </div>
          <div className="space-y-4">
            <Chart />
            <OrdersTable />
          </div>
          <div className="space-y-4">
            <OrderForm />
            <TradeFeed />
          </div>
        </div>
      </main>
      
      <footer className="mt-8 py-6 text-center text-slate-500 flex items-center justify-center gap-2">
        <img src="https://cryptologos.cc/logos/aptos-apt-logo.svg?v=040" alt="Aptos" className="h-4 w-4 opacity-80" />
        <span>Powered by Aptos | Off-chain matching, On-chain settlement.</span>
      </footer>
    </div>
  );
}


