export function toStringBig(v: string | number | bigint) {
  return typeof v === 'bigint' ? v.toString() : String(v);
}


