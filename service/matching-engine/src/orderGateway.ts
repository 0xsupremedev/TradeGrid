import { z } from 'zod';
import { Matcher } from './matcher';

const PlaceSchema = z.object({
  side: z.enum(['bid', 'ask']),
  price: z.string(),
  size: z.string(),
  owner: z.string().min(2),
});

export type PlaceBody = z.infer<typeof PlaceSchema>;

export function makeOrderGateway(matcher: Matcher) {
  return {
    place: (body: unknown) => {
      const data = PlaceSchema.parse(body);
      return matcher.place({
        side: data.side,
        price: BigInt(data.price),
        size: BigInt(data.size),
        owner: data.owner,
      });
    },
  };
}


