import { createServer } from './server';

async function main() {
  const port = Number(process.env.PORT ?? 8080);
  const server = await createServer();
  await server.listen({ port, host: '0.0.0.0' });
  // eslint-disable-next-line no-console
  console.log(`matching-engine listening on :${port}`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});


