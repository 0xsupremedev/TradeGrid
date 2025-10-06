import { useCallback, useEffect, useState } from 'react';

export function useOrderbook() {
  const [book, setBook] = useState<any>(null);
  const baseUrl = process.env.NEXT_PUBLIC_ENGINE_URL;

  const refresh = useCallback(async () => {
    if (!baseUrl) return;
    const res = await fetch(baseUrl + '/orderbook');
    setBook(await res.json());
  }, [baseUrl]);

  useEffect(() => { refresh(); }, [refresh]);
  return { book, refresh };
}


