module 0x1::settlement {
    use std::vector;
    use std::signer;
    use std::event;

    struct Trade has copy, drop, store {
        trade_id: vector<u8>,
        buy_order_id: u64,
        sell_order_id: u64,
        price: u128,
        size: u128,
        maker: address,
        taker: address,
        timestamp: u64,
    }

    struct TradeSettledBatch has copy, drop, store { batch_id: vector<u8>, count: u64, gas_used: u64 }

    resource struct SettlementEvents { trade_settled_batch: event::EventHandle<TradeSettledBatch> }

    public entry fun init(account: &signer) {
        let addr = signer::address_of(account);
        if (!exists<SettlementEvents>(addr)) {
            move_to(account, SettlementEvents { trade_settled_batch: event::new_event_handle<TradeSettledBatch>(account) });
        }
    }

    public entry fun settle_batch(caller: &signer, _trades: vector<Trade>, batch_id: vector<u8>) {
        let count = vector::length(&_trades);
        assert!(count > 0, 1);
        let addr = signer::address_of(caller);
        if (exists<SettlementEvents>(addr)) {
            let ev = borrow_global_mut<SettlementEvents>(addr);
            let evt = TradeSettledBatch { batch_id, count, gas_used: 0u64 };
            event::emit_event(&mut ev.trade_settled_batch, evt);
        }
    }
}

module tradegrid::settlement {
    use std::signer;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::event;
    use aptos_framework::account;

    const E_NOT_INITIALIZED: u64 = 1;
    const E_INSUFFICIENT_BALANCE: u64 = 2;

    struct Balance has key {
        deposits: coin::Coin<AptosCoin>,
        events: Events,
    }

    struct TradeExecuted has copy, drop, store {
        taker: address,
        maker: address,
        price: u64,
        size: u64,
        is_bid: bool,
    }

    struct Events has key, store {
        deposit: event::EventHandle<u64>,
        withdraw: event::EventHandle<u64>,
        trade: event::EventHandle<TradeExecuted>,
    }

    public entry fun init(user: &signer) {
        let zero = coin::zero<AptosCoin>();
        move_to(user, Balance {
            deposits: zero,
            events: Events {
                deposit: account::new_event_handle<u64>(user),
                withdraw: account::new_event_handle<u64>(user),
                trade: account::new_event_handle<TradeExecuted>(user),
            }
        });
    }

    public entry fun deposit(user: &signer, amount: u64) acquires Balance {
        let addr = signer::address_of(user);
        if (!exists<Balance>(addr)) abort E_NOT_INITIALIZED;
        let bal = borrow_global_mut<Balance>(addr);
        let coins = coin::withdraw<AptosCoin>(user, amount);
        coin::merge<AptosCoin>(&mut bal.deposits, coins);
        event::emit_event<u64>(&mut bal.events.deposit, amount);
    }

    public entry fun withdraw(user: &signer, amount: u64) acquires Balance {
        let addr = signer::address_of(user);
        if (!exists<Balance>(addr)) abort E_NOT_INITIALIZED;
        let bal = borrow_global_mut<Balance>(addr);
        let have = coin::value<AptosCoin>(&bal.deposits);
        assert!(have >= amount, E_INSUFFICIENT_BALANCE);
        let coins = coin::extract<AptosCoin>(&mut bal.deposits, amount);
        coin::deposit<AptosCoin>(signer::address_of(user), coins);
        event::emit_event<u64>(&mut bal.events.withdraw, amount);
    }

    public entry fun settle_trade(
        taker: &signer,
        maker_addr: address,
        price: u64,
        size: u64,
        is_bid: bool
    ) acquires Balance {
        let taker_addr = signer::address_of(taker);
        if (!exists<Balance>(taker_addr)) abort E_NOT_INITIALIZED;
        if (!exists<Balance>(maker_addr)) abort E_NOT_INITIALIZED;
        // Borrow taker first, compute and extract funds, emit event, then drop borrow
        let out = {
            let taker_bal = borrow_global_mut<Balance>(taker_addr);
            let quote: u128 = (price as u128) * (size as u128);
            let taker_have = coin::value<AptosCoin>(&taker_bal.deposits) as u128;
            assert!(taker_have >= quote, E_INSUFFICIENT_BALANCE);
            let quote_u64 = quote as u64; // assume fits for MVP
            let out_local = coin::extract<AptosCoin>(&mut taker_bal.deposits, quote_u64);
            // Emit event once from taker storage for simplicity
            event::emit_event<TradeExecuted>(&mut taker_bal.events.trade, TradeExecuted {
                taker: taker_addr,
                maker: maker_addr,
                price,
                size,
                is_bid,
            });
            out_local
        };

        // Now borrow maker and merge the extracted coins
        let maker_bal = borrow_global_mut<Balance>(maker_addr);
        coin::merge<AptosCoin>(&mut maker_bal.deposits, out);
    }

    /// Batch version of settle_trade to amortize gas and demonstrate parallel-friendly flows.
    /// Trust model: any caller may submit batches provided balances exist; same as settle_trade.
    /// All input vectors must have the same length.
    public entry fun settle_batch(
        _relayer: &signer,
        takers: vector<address>,
        makers: vector<address>,
        prices: vector<u64>,
        sizes: vector<u64>,
        is_bids: vector<bool>
    ) acquires Balance {
        let n = vector::length(&takers);
        assert!(
            n == vector::length(&makers) &&
            n == vector::length(&prices) &&
            n == vector::length(&sizes) &&
            n == vector::length(&is_bids),
            9001
        );

        let i = 0;
        while (i < n) {
            let taker_addr = *vector::borrow(&takers, i);
            let maker_addr = *vector::borrow(&makers, i);
            let price = *vector::borrow(&prices, i);
            let size = *vector::borrow(&sizes, i);
            let is_bid = *vector::borrow(&is_bids, i);

            if (!exists<Balance>(taker_addr)) abort E_NOT_INITIALIZED;
            if (!exists<Balance>(maker_addr)) abort E_NOT_INITIALIZED;

            // Extract from taker
            let out = {
                let taker_bal = borrow_global_mut<Balance>(taker_addr);
                let quote: u128 = (price as u128) * (size as u128);
                let taker_have = coin::value<AptosCoin>(&taker_bal.deposits) as u128;
                assert!(taker_have >= quote, E_INSUFFICIENT_BALANCE);
                let quote_u64 = quote as u64;
                let out_local = coin::extract<AptosCoin>(&mut taker_bal.deposits, quote_u64);
                event::emit_event<TradeExecuted>(&mut taker_bal.events.trade, TradeExecuted {
                    taker: taker_addr,
                    maker: maker_addr,
                    price,
                    size,
                    is_bid,
                });
                out_local
            };

            // Merge to maker
            let maker_bal = borrow_global_mut<Balance>(maker_addr);
            coin::merge<AptosCoin>(&mut maker_bal.deposits, out);

            i = i + 1;
        }
    }
}


