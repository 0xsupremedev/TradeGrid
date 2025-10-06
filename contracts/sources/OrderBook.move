module tradegrid::order_book {
    use std::signer;
    use aptos_framework::event;
    use aptos_framework::account;
    use aptos_std::table;

    const E_NOT_INITIALIZED: u64 = 1;
    const E_NOT_OWNER: u64 = 2;

    struct Order has copy, drop, store {
        id: u64,
        owner: address,
        // 0 = bid, 1 = ask
        side: u8,
        price: u64,
        size: u64,
    }

    struct Events has key, store {
        order_placed: event::EventHandle<Order>,
        order_cancelled: event::EventHandle<Order>,
    }

    struct State has key {
        next_order_id: u64,
        orders: table::Table<u64, Order>,
        events: Events,
    }

    public entry fun init_user(admin: &signer) {
        // Allows the package publisher to set up the resource once.
        move_to(admin, State {
            next_order_id: 1,
            orders: table::new<u64, Order>(),
            events: Events {
                order_placed: account::new_event_handle<Order>(admin),
                order_cancelled: account::new_event_handle<Order>(admin),
            },
        });
    }

    public entry fun place_limit_order(user: &signer, side: u8, price: u64, size: u64) acquires State {
        let addr = signer::address_of(user);
        if (!exists<State>(addr)) abort E_NOT_INITIALIZED;
        let state = borrow_global_mut<State>(addr);

        let id = state.next_order_id;
        state.next_order_id = id + 1;

        let order = Order { id, owner: signer::address_of(user), side, price, size };
        // Emit event first (Order has copy ability), then store
        event::emit_event<Order>(&mut state.events.order_placed, order);
        table::add<u64, Order>(&mut state.orders, id, order);
    }

    public entry fun cancel_order(user: &signer, id: u64) acquires State {
        let addr = signer::address_of(user);
        if (!exists<State>(addr)) abort E_NOT_INITIALIZED;
        let state = borrow_global_mut<State>(addr);

        // Verify ownership before removal
        let existing_ref = table::borrow_mut<u64, Order>(&mut state.orders, id);
        assert!(existing_ref.owner == signer::address_of(user), E_NOT_OWNER);
        let removed = table::remove<u64, Order>(&mut state.orders, id);
        event::emit_event<Order>(&mut state.events.order_cancelled, removed);
    }

    public fun get_next_order_id(addr: address): u64 acquires State {
        if (!exists<State>(addr)) abort E_NOT_INITIALIZED;
        let state = borrow_global<State>(addr);
        state.next_order_id
    }
}


