# TradeGrid Move Contracts

How to build and test locally with Aptos CLI:

1. Install Aptos CLI: https://aptos.dev/tools/aptos-cli/install-cli
2. From this `contracts` directory:
   - Build: `aptos move compile --package-dir .`
   - Unit tests: `aptos move test --package-dir .`
   - Publish (testnet): configure your profile, then `aptos move publish --profile default`

Modules:
- `src/OrderBook.move`: Minimal order book state, events, and entry functions.


