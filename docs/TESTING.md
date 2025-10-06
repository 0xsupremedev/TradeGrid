# TradeGrid Testing Guide

## Running Tests

### Move Unit Tests

```bash
cd contracts
aptos move test --package-dir .
```

### Test Structure

```
contracts/tests/
├── orderbook_tests.move      # Order book functionality
├── settlement_tests.move     # Settlement and trading
├── copyvault_tests.move      # Copy trading features
└── integration_tests.move    # End-to-end flows
```

## Test Categories

### 1. Unit Tests

#### OrderBook Tests
- Order placement and cancellation
- Order ID generation
- State initialization

#### Settlement Tests
- Balance management
- Trade execution
- Deposit/withdrawal flows

#### CopyVault Tests
- Subscription management
- Event emission
- State transitions

### 2. Integration Tests

#### End-to-End Trading Flow
```move
#[test(user = @0x1, maker = @0x2)]
public fun end_to_end(user: &signer, maker: &signer) {
    // Initialize both users
    order_book::init_user(user);
    settlement::init(user);
    settlement::init(maker);
    
    // Place orders and execute trades
    order_book::place_limit_order(user, 0, 100, 1);
    settlement::settle_trade(user, signer::address_of(maker), 0, 1, true);
}
```

## Test Data Setup

### Account Creation
```move
// Create test accounts
account::create_account_for_test(signer::address_of(user));
account::create_account_for_test(signer::address_of(maker));
```

### Profile Configuration
```move
#[test(user = @0x1, maker = @0x2)]
public fun test_function(user: &signer, maker: &signer) {
    // Test implementation
}
```

## Local Testing Workflow

### 1. Start Local Environment
```bash
pnpm aptos:local
```

### 2. Run Specific Tests
```bash
# Run all tests
aptos move test --package-dir .

# Run specific test file
aptos move test --package-dir . --filter orderbook_tests

# Run with verbose output
aptos move test --package-dir . --verbose
```

### 3. Debug Test Failures
```bash
# Run with detailed error output
aptos move test --package-dir . --verbose --debug
```

## Test Scenarios

### Order Book Scenarios

1. **Valid Order Placement**
   - Place bid and ask orders
   - Verify order ID generation
   - Check event emission

2. **Order Cancellation**
   - Place order and cancel it
   - Verify order removal
   - Check cancellation event

3. **Invalid Operations**
   - Cancel non-existent order
   - Place order without initialization
   - Access unauthorized order

### Settlement Scenarios

1. **Deposit/Withdrawal**
   - Deposit funds
   - Withdraw funds
   - Check balance updates

2. **Trade Execution**
   - Execute valid trades
   - Handle insufficient balance
   - Verify fund transfers

3. **Edge Cases**
   - Zero amount trades
   - Maximum value trades
   - Invalid addresses

### Copy Trading Scenarios

1. **Subscription Management**
   - Subscribe to leader
   - Unsubscribe from leader
   - Verify state changes

2. **Share Management**
   - Set valid share percentages
   - Handle invalid percentages
   - Update existing subscriptions

## Performance Testing

### Gas Usage
```move
// Measure gas usage for operations
let gas_before = aptos_framework::gas_meter::get_gas_used();
order_book::place_limit_order(user, 0, 100, 1);
let gas_after = aptos_framework::gas_meter::get_gas_used();
let gas_used = gas_after - gas_before;
```

### Load Testing
- Place multiple orders rapidly
- Execute concurrent trades
- Test with large order books

## Test Coverage

### Current Coverage
- ✅ Order placement and cancellation
- ✅ Settlement initialization
- ✅ Basic trade execution
- ✅ Copy trading subscription
- ✅ Event emission
- ✅ Error handling

### Areas for Improvement
- 🔄 Complex trading scenarios
- 🔄 Stress testing
- 🔄 Edge case validation
- 🔄 Integration with external services

## Continuous Integration

### GitHub Actions
```yaml
name: Move Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install Aptos CLI
        run: |
          wget https://github.com/aptos-labs/aptos-core/releases/download/aptos-cli-v1.0.0/aptos-cli-1.0.0-ubuntu-x86_64.zip
          unzip aptos-cli-1.0.0-ubuntu-x86_64.zip
      - name: Run Tests
        run: |
          cd contracts
          ./aptos move test --package-dir .
```

## Debugging Tips

### Common Issues

1. **Account Not Found**
   - Ensure `create_account_for_test` is called
   - Check profile initialization

2. **Insufficient Balance**
   - Use zero-price trades for testing
   - Mock balance requirements

3. **Event Emission Issues**
   - Verify event handle creation
   - Check event data structure

### Debug Commands
```bash
# Compile with debug info
aptos move compile --package-dir . --debug

# Run with stack traces
aptos move test --package-dir . --verbose

# Check account state
aptos account list --profile local
```

## Best Practices

1. **Test Isolation**
   - Each test should be independent
   - Clean up state between tests

2. **Comprehensive Coverage**
   - Test happy paths and error cases
   - Include edge cases and boundary conditions

3. **Clear Test Names**
   - Use descriptive test function names
   - Document test purpose and expected behavior

4. **Mock External Dependencies**
   - Use test accounts instead of real ones
   - Mock complex external calls

5. **Performance Considerations**
   - Keep tests fast and efficient
   - Avoid unnecessary operations
