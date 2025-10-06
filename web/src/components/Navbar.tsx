import { useWallet } from '../hooks/useWallet';
import { WalletSelector } from '@aptos-labs/wallet-adapter-ant-design';
import { useWallet as useAptosWallet } from '@aptos-labs/wallet-adapter-react';
import { Bolt, CircleCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navbar() {
  const { address } = useWallet();
  const { wallets, connect, disconnect, connected } = useAptosWallet();
  return (
    <div className="sticky top-0 z-30 glass px-4 sm:px-6 py-3 flex items-center justify-between backdrop-saturate-150">
      <div className="flex items-center gap-2">
        <motion.div animate={{ filter: ['drop-shadow(0 0 0px #00FFFF)','drop-shadow(0 0 10px #00FFFF)','drop-shadow(0 0 0px #00FFFF)'] }} transition={{ repeat: Infinity, duration: 2 }}>
          <Bolt className="text-neon" size={22} />
        </motion.div>
        <span className="font-semibold tracking-wide">TradeGrid</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 text-emerald-400 text-sm">
          <img src="https://cryptologos.cc/logos/aptos-apt-logo.svg?v=040" alt="Aptos" className="h-4 w-4 opacity-80" />
          <CircleCheck size={16} />
          <span>Aptos Testnet</span>
        </div>
        {address && <div className="hidden md:block text-xs text-slate-400">{address.slice(0,6)}...{address.slice(-4)}</div>}
        <div className="hidden sm:flex items-center gap-2">
          {!connected && wallets.map((w) => (
            <button key={w.name} onClick={() => connect(w.name)} className="px-2 py-1 text-xs border border-white/10 rounded hover:shadow-glow">{w.name}</button>
          ))}
          {connected && (
            <button onClick={() => disconnect()} className="px-2 py-1 text-xs border border-white/10 rounded hover:shadow-glow">Disconnect</button>
          )}
        </div>
      </div>
    </div>
  );
}


