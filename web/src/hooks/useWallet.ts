import { useWallet as useAptosWallet } from '@aptos-labs/wallet-adapter-react';

export function useWallet() {
  const w = useAptosWallet();
  return {
    address: w.account?.address || null,
    connected: w.connected,
    wallets: w.wallets,
    connect: w.connect,
    disconnect: w.disconnect,
  };
}


