import type { AppProps } from 'next/app';
import '../styles/globals.css';
import dynamic from 'next/dynamic';
const AptosWalletAdapterProvider = dynamic(() => import('@aptos-labs/wallet-adapter-react').then(m => m.AptosWalletAdapterProvider), { ssr: false });
import { useMemo } from 'react';
// Some wallets are bundled by the ant design pkg; fall back to empty list if not available in your env
import { EngineProvider } from '../providers/EngineProvider';

export default function App({ Component, pageProps }: AppProps) {
  const wallets = useMemo(() => [], []);
  return (
    <AptosWalletAdapterProvider plugins={wallets} autoConnect>
      <EngineProvider>
        <div className="min-h-full bg-[#0b0f18] bg-gridgrad text-slate-200">
          <Component {...pageProps} />
        </div>
      </EngineProvider>
    </AptosWalletAdapterProvider>
  );
}


