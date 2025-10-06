import { useEffect, useRef } from 'react';

export type MessageHandler = (data: any) => void;

export function useWebSocket(url: string | undefined, onMessage: MessageHandler) {
  const handlerRef = useRef(onMessage);
  handlerRef.current = onMessage;

  useEffect(() => {
    if (!url) return;
    const ws = new WebSocket(url);
    ws.onmessage = (e) => {
      try {
        const payload = JSON.parse(String(e.data));
        handlerRef.current(payload);
      } catch {}
    };
    return () => ws.close();
  }, [url]);
}


