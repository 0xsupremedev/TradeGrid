export function useApi() {
  const baseUrl = process.env.NEXT_PUBLIC_ENGINE_URL || '';
  return {
    async placeOrder(body: { side: 'bid' | 'ask'; price: string; size: string; owner: string }) {
      const res = await fetch(baseUrl + '/place_order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error('place failed');
      return res.json();
    },
    wsUrl() { return baseUrl ? baseUrl.replace('http', 'ws') : ''; }
  };
}


