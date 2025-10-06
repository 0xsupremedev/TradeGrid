$ErrorActionPreference = "Stop"

# Paths
$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path | Split-Path -Parent
$ContractsDir = Join-Path $RepoRoot "contracts"
$Aptos = Join-Path $RepoRoot "aptos-cli-7.7.0\aptos.exe"

# Profiles
$LocalProfile = "local"
$MakerProfile = "maker"

Push-Location $ContractsDir

Write-Host "Starting local testnet (if not already running)..."
Start-Process -FilePath $Aptos -ArgumentList "node run-local-testnet --force-restart --with-faucet" | Out-Null
Start-Sleep -Seconds 2

function Get-Address($profile) {
  try {
    # Try to get address from profile info
    $result = & $Aptos account list --profile $profile 2>$null
    if ($result -and $result -match "0x[a-fA-F0-9]{64}") {
      return $matches[0]
    }
    
    # If that doesn't work, try to get it from the profile config
    $configPath = "$env:USERPROFILE\.aptos\config.yaml"
    if (Test-Path $configPath) {
      $config = Get-Content $configPath -Raw
      if ($config -match "profiles:\s*\n\s*${profile}:\s*\n.*?account:\s*([0-9a-fA-Fx]+)") {
        return $matches[1]
      }
    }
  } catch {
    Write-Host "Error getting address for profile $profile`: $($_.Exception.Message)"
  }
  return $null
}

function Ensure-Profile($profile) {
  $addr = Get-Address $profile
  if (-not $addr) {
    Write-Host "Initializing profile '$profile'..."
    # Use echo to provide empty input for prompts
    $initOutput = echo "" | & $Aptos init --profile $profile --network local 2>&1
    Write-Host $initOutput
    
    # Extract address from init output
    if ($initOutput -match "Account (0x[a-fA-F0-9]{64})") {
      $addr = $matches[1]
      Write-Host "Extracted address: $addr"
    }
  }
  & $Aptos account fund-with-faucet --profile $profile --amount 100000000 | Out-Null
  return $addr
}

$Deployer = Ensure-Profile $LocalProfile
$Maker = Ensure-Profile $MakerProfile

# The addresses should now be captured from the Ensure-Profile calls above

Write-Host "Deployer: $Deployer"
Write-Host "Maker:    $Maker"

if (-not $Deployer -or -not $Maker) {
  Write-Host "Error: Could not get addresses for profiles"
  Write-Host "Deployer: '$Deployer'"
  Write-Host "Maker: '$Maker'"
  exit 1
}

Write-Host "Publishing Move package..."
& $Aptos move publish --profile $LocalProfile --named-addresses "tradegrid=$Deployer" --assume-yes | Write-Host

Write-Host "Initializing user state (order_book, settlement) for deployer..."
& $Aptos move run --profile $LocalProfile --function-id "$Deployer::order_book::init_user" | Out-Null
& $Aptos move run --profile $LocalProfile --function-id "$Deployer::settlement::init" | Out-Null

Write-Host "Placing example limit order (side=0, price=100, size=1)..."
& $Aptos move run --profile $LocalProfile --function-id "$Deployer::order_book::place_limit_order" --args u8:0 u64:100 u64:1 | Out-Null

Write-Host "Initializing settlement for maker..."
& $Aptos move run --profile $MakerProfile --function-id "$Deployer::settlement::init" | Out-Null

Write-Host "Settling trade with zero price (simple local test)..."
& $Aptos move run --profile $LocalProfile --function-id "$Deployer::settlement::settle_trade" --args "address:$Maker" u64:0 u64:1 bool:true | Out-Null

Write-Host "Done."

Pop-Location


