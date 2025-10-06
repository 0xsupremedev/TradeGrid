# TradeGrid API Reference

## Smart Contract Functions

### OrderBook Module

#### `init_user(admin: &signer)`
Initializes the order book state for a user.

**Parameters:**
- `admin: &signer` - The user's signer

**Events Emitted:**
- None

**Example:**
```move
order_book::init_user(user);
```

#### `place_limit_order(user: &signer, side: u8, price: u64, size: u64)`
Places a limit order in the order book.

**Parameters:**
- `user: &signer` - The user's signer
- `side: u8` - Order side (0 = bid, 1 = ask)
- `price: u64` - Order price
- `size: u64` - Order size

**Events Emitted:**
- `OrderPlaced` - Contains order details

**Example:**
```move
order_book::place_limit_order(user, 0, 100, 1);
```

#### `cancel_order(user: &signer, id: u64)`
Cancels an existing order.

**Parameters:**
- `user: &signer` - The user's signer
- `id: u64` - Order ID to cancel

**Events Emitted:**
- `OrderCancelled` - Contains cancelled order details

**Example:**
```move
order_book::cancel_order(user, 1);
```

#### `get_next_order_id(addr: address): u64`
Gets the next available order ID for an address.

**Parameters:**
- `addr: address` - User address

**Returns:**
- `u64` - Next order ID

**Example:**
```move
let next_id = order_book::get_next_order_id(user_addr);
```

### Settlement Module

#### `init(user: &signer)`
Initializes the settlement account for a user.

**Parameters:**
- `user: &signer` - The user's signer

**Events Emitted:**
- None

**Example:**
```move
settlement::init(user);
```

#### `deposit(user: &signer, amount: u64)`
Deposits AptosCoin into the user's settlement balance.

**Parameters:**
- `user: &signer` - The user's signer
- `amount: u64` - Amount to deposit

**Events Emitted:**
- `Deposit` - Contains deposit amount

**Example:**
```move
settlement::deposit(user, 1000);
```

#### `withdraw(user: &signer, amount: u64)`
Withdraws AptosCoin from the user's settlement balance.

**Parameters:**
- `user: &signer` - The user's signer
- `amount: u64` - Amount to withdraw

**Events Emitted:**
- `Withdraw` - Contains withdrawal amount

**Example:**
```move
settlement::withdraw(user, 500);
```

#### `settle_trade(taker: &signer, maker_addr: address, price: u64, size: u64, is_bid: bool)`
Executes a trade settlement between taker and maker.

**Parameters:**
- `taker: &signer` - Taker's signer
- `maker_addr: address` - Maker's address
- `price: u64` - Trade price
- `size: u64` - Trade size
- `is_bid: bool` - Whether taker is bidding

**Events Emitted:**
- `TradeExecuted` - Contains trade details

**Example:**
```move
settlement::settle_trade(taker, maker_addr, 100, 1, true);
```

### CopyVault Module

#### `init(admin: &signer)`
Initializes the copy vault for a user.

**Parameters:**
- `admin: &signer` - The user's signer

**Events Emitted:**
- None

**Example:**
```move
copy_vault::init(user);
```

#### `subscribe(user: &signer, leader: address, share_bps: u64)`
Subscribes to copy trading for a leader.

**Parameters:**
- `user: &signer` - The user's signer
- `leader: address` - Leader's address
- `share_bps: u64` - Share percentage in basis points

**Events Emitted:**
- `Subscribed` - Contains subscription details

**Example:**
```move
copy_vault::subscribe(user, leader_addr, 1000); // 10%
```

#### `unsubscribe(user: &signer, leader: address)`
Unsubscribes from copy trading for a leader.

**Parameters:**
- `user: &signer` - The user's signer
- `leader: address` - Leader's address

**Events Emitted:**
- `Unsubscribed` - Contains unsubscription details

**Example:**
```move
copy_vault::unsubscribe(user, leader_addr);
```

## Events

### OrderBook Events

#### `OrderPlaced`
```move
struct OrderPlaced has drop, store {
    id: u64,
    owner: address,
    side: u8,
    price: u64,
    size: u64,
}
```

#### `OrderCancelled`
```move
struct OrderCancelled has drop, store {
    id: u64,
    owner: address,
    side: u8,
    price: u64,
    size: u64,
}
```

### Settlement Events

#### `Deposit`
```move
struct Deposit has drop, store {
    amount: u64,
}
```

#### `Withdraw`
```move
struct Withdraw has drop, store {
    amount: u64,
}
```

#### `TradeExecuted`
```move
struct TradeExecuted has drop, store {
    taker: address,
    maker: address,
    price: u64,
    size: u64,
    is_bid: bool,
}
```

### CopyVault Events

#### `Subscribed`
```move
struct Subscribed has drop, store {
    leader: address,
    follower: address,
    share_bps: u64,
}
```

#### `Unsubscribed`
```move
struct Unsubscribed has drop, store {
    leader: address,
    follower: address,
    share_bps: u64,
}
```

## Error Codes

### OrderBook Errors
- `E_NOT_INITIALIZED: u64 = 1` - Order book not initialized
- `E_NOT_OWNER: u64 = 2` - Not the owner of the order

### Settlement Errors
- `E_NOT_INITIALIZED: u64 = 1` - Settlement not initialized
- `E_INSUFFICIENT_BALANCE: u64 = 2` - Insufficient balance for operation

### CopyVault Errors
- `E_NOT_INITIALIZED: u64 = 1` - Copy vault not initialized

## Usage Examples

### Complete Trading Flow

```move
// 1. Initialize both users
order_book::init_user(user1);
settlement::init(user1);
settlement::init(user2);

// 2. Deposit funds
settlement::deposit(user1, 10000);

// 3. Place orders
order_book::place_limit_order(user1, 0, 100, 10); // Bid
order_book::place_limit_order(user2, 1, 100, 5);  // Ask

// 4. Execute trade
settlement::settle_trade(user1, signer::address_of(user2), 100, 5, true);
```

### Copy Trading Setup

```move
// 1. Initialize copy vault
copy_vault::init(follower);

// 2. Subscribe to leader
copy_vault::subscribe(follower, leader_addr, 2000); // 20% share

// 3. Unsubscribe when done
copy_vault::unsubscribe(follower, leader_addr);
```
