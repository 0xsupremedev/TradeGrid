$ErrorActionPreference = "Stop"

param(
  [int]$Price = 10,
  [int]$Size = 2
)

# Paths
$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path | Split-Path -Parent
$ContractsDir = Join-Path $RepoRoot "contracts"
$Aptos = Join-Path $RepoRoot "aptos-cli-7.7.0\aptos.exe"

# Profiles
$LocalProfile = "local"
$MakerProfile = "maker"

Push-Location $ContractsDir

function Get-Address($profile) {
  $result = & $Aptos account list --profile $profile 2>$null
  if ($result) {
    $result | Select-String "0x" | ForEach-Object { $_.Line.Trim() }
  }
}

$Deployer = Get-Address $LocalProfile
$Maker = Get-Address $MakerProfile

if (-not $Deployer) { throw "Local profile not initialized. Run pnpm aptos:local first." }
if (-not $Maker) { throw "Maker profile not initialized. Run pnpm aptos:local first." }

Write-Host "Using Deployer: $Deployer"
Write-Host "Using Maker:    $Maker"

# Ensure settlement resources exist
& $Aptos move run --profile $LocalProfile --function-id "$Deployer::settlement::init" | Out-Null
& $Aptos move run --profile $MakerProfile --function-id "$Deployer::settlement::init" | Out-Null

# Deposit AptosCoin into taker (local profile) Balance to cover trade
$DepositNeeded = [int]($Price * $Size)
if ($DepositNeeded -lt 0) { $DepositNeeded = 0 }

if ($DepositNeeded -gt 0) {
  Write-Host "Depositing $DepositNeeded into taker Balance..."
  & $Aptos move run --profile $LocalProfile --function-id "$Deployer::settlement::deposit" --args "u64:$DepositNeeded" | Out-Null
}

Write-Host "Settling trade: price=$Price, size=$Size"
& $Aptos move run --profile $LocalProfile --function-id "$Deployer::settlement::settle_trade" --args "address:$Maker" "u64:$Price" "u64:$Size" bool:true | Write-Host

Pop-Location


