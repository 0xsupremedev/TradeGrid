import { Aptos, AptosConfig, Ed25519PrivateKey, Account, Network } from 'aptos';

export type Trade = {
  buyOrderId: number;
  sellOrderId: number;
  price: string | bigint;
  size: string | bigint;
  maker: string;
  taker: string;
  takerIsBid: boolean;
};

let client: Aptos | null = null;
let account: Account | null = null;

function getClient(): { client: Aptos; account: Account; addr: string } {
  if (!client || !account) {
    const nodeUrl = process.env.APTOS_NODE_URL || undefined;
    const network = (process.env.APTOS_NETWORK as Network) || 'testnet';
    const config = new AptosConfig({ network, fullnode: nodeUrl });
    client = new Aptos(config);
    const pk = process.env.APTOS_PRIVATE_KEY;
    if (!pk) throw new Error('APTOS_PRIVATE_KEY not set');
    const key = new Ed25519PrivateKey(pk);
    account = Account.fromPrivateKey({ privateKey: key });
  }
  const addr = process.env.CONTRACT_ADDRESS || account!.accountAddress.toString();
  return { client: client!, account: account!, addr };
}

export async function settleTrade(trade: Trade): Promise<{ txHash: string }> {
  const { client, account, addr } = getClient();
  const priceStr = BigInt(trade.price).toString();
  const sizeStr = BigInt(trade.size).toString();
  const makerAddr = (process.env.MAKER_OVERRIDE || trade.maker).toString();

  const payload = {
    function: `${addr}::settlement::settle_trade`,
    functionArguments: [
      makerAddr,
      priceStr,
      sizeStr,
      trade.takerIsBid,
    ],
  } as any;

  const tx = await client.transaction.build.simple({ sender: account.accountAddress, data: payload });
  const committed = await client.signAndSubmitTransaction({ signer: account, transaction: tx });
  await client.waitForTransaction({ transactionHash: committed.hash });
  return { txHash: committed.hash };
}

export async function settleBatch(trades: Trade[]): Promise<{ txHash: string }> {
  if (trades.length === 0) throw new Error('empty batch');
  const { client, account, addr } = getClient();
  const takers: string[] = trades.map((t) => t.taker);
  const makers: string[] = trades.map((t) => (process.env.MAKER_OVERRIDE || t.maker).toString());
  const prices: string[] = trades.map((t) => BigInt(t.price).toString());
  const sizes: string[] = trades.map((t) => BigInt(t.size).toString());
  const isBids: boolean[] = trades.map((t) => !!t.takerIsBid);

  const payload = {
    function: `${addr}::settlement::settle_batch`,
    functionArguments: [takers, makers, prices, sizes, isBids],
  } as any;

  const tx = await client.transaction.build.simple({ sender: account.accountAddress, data: payload });
  const committed = await client.signAndSubmitTransaction({ signer: account, transaction: tx });
  await client.waitForTransaction({ transactionHash: committed.hash });
  return { txHash: committed.hash };
}


