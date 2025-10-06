$ErrorActionPreference = "Stop"

# Paths
$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path | Split-Path -Parent
$ContractsDir = Join-Path $RepoRoot "contracts"
$Aptos = Join-Path $RepoRoot "aptos-cli-7.7.0\aptos.exe"

# Profiles
$LocalProfile = "local"
$MakerProfile = "maker"

Push-Location $ContractsDir

Write-Host "Restarting local testnet..."
& $Aptos node run-local-testnet --force-restart --with-faucet | Write-Host

Write-Host "Re-initializing and funding profiles..."
& $Aptos init --assume-yes --profile $LocalProfile --network local | Out-Null
& $Aptos account fund-with-faucet --profile $LocalProfile --amount 100000000 | Out-Null
& $Aptos init --assume-yes --profile $MakerProfile --network local | Out-Null
& $Aptos account fund-with-faucet --profile $MakerProfile --amount 100000000 | Out-Null

function Get-Address($profile) {
  $result = & $Aptos account list --profile $profile 2>$null
  if ($result) {
    $result | Select-String "0x" | ForEach-Object { $_.Line.Trim() }
  }
}

$Deployer = Get-Address $LocalProfile
$Maker = Get-Address $MakerProfile

Write-Host "Deployer: $Deployer"
Write-Host "Maker:    $Maker"

Write-Host "Publishing Move package..."
& $Aptos move publish --profile $LocalProfile --named-addresses "tradegrid=$Deployer" --assume-yes | Write-Host

Pop-Location
