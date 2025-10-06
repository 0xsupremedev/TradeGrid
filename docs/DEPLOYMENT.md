# TradeGrid Deployment Guide

## Local Development Setup

### Prerequisites
- Windows 10/11
- PowerShell 5.1+
- Node.js 18+
- pnpm package manager
- Aptos CLI 7.7.0+

### Quick Start

1. **Install Dependencies**
   ```powershell
   npm install -g pnpm
   pnpm install
   ```

2. **Start Local Environment**
   ```powershell
   pnpm aptos:local
   ```

3. **Run Custom Trades**
   ```powershell
   pnpm aptos:trade
   ```

### Manual Setup

If automated scripts fail, follow these manual steps:

1. **Start Local Testnet**
   ```powershell
   cd contracts
   Start-Process -FilePath "..\aptos-cli-7.7.0\aptos.exe" -ArgumentList "node run-local-testnet --force-restart --with-faucet"
   Start-Sleep -Seconds 3
   ```

2. **Initialize Profiles**
   ```powershell
   "..\aptos-cli-7.7.0\aptos.exe" init --assume-yes --profile local --network local
   "..\aptos-cli-7.7.0\aptos.exe" account fund --profile local --amount 100000000
   ```

3. **Get Address**
   ```powershell
   "..\aptos-cli-7.7.0\aptos.exe" account list --profile local
   ```

4. **Publish Package**
   ```powershell
   "..\aptos-cli-7.7.0\aptos.exe" move publish --profile local --named-addresses "tradegrid=0xYOUR_ADDRESS" --assume-yes
   ```

## Testnet Deployment

1. **Configure Testnet Profile**
   ```powershell
   aptos init --profile testnet --network testnet
   ```

2. **Fund Account**
   ```powershell
   aptos account fund --profile testnet
   ```

3. **Publish Package**
   ```powershell
   aptos move publish --profile testnet --named-addresses "tradegrid=0xYOUR_ADDRESS"
   ```

## Mainnet Deployment

1. **Configure Mainnet Profile**
   ```powershell
   aptos init --profile mainnet --network mainnet
   ```

2. **Publish Package**
   ```powershell
   aptos move publish --profile mainnet --named-addresses "tradegrid=0xYOUR_ADDRESS"
   ```

## Troubleshooting

### Common Issues

1. **pnpm not recognized**
   ```powershell
   npm install -g pnpm
   ```

2. **Aptos CLI version issues**
   - Ensure you're using Aptos CLI 7.7.0+
   - Check command syntax for your version

3. **Profile initialization fails**
   - Ensure local testnet is running
   - Check network connectivity
   - Verify faucet is available

4. **Move compilation errors**
   - Run `aptos move test --package-dir .` first
   - Check for syntax errors in Move files
   - Ensure all dependencies are available

### Scripts Available

- `pnpm aptos:local` - Full local setup
- `pnpm aptos:reset` - Reset and republish
- `pnpm aptos:trade` - Run test trades

### Environment Variables

Set these if needed:
- `APTOS_CLI_PATH` - Path to aptos.exe
- `CONTRACTS_DIR` - Path to contracts directory
