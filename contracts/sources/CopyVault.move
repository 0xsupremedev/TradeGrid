module tradegrid::copy_vault {
    use std::signer;
    use aptos_framework::event;
    use aptos_framework::account;

    const E_NOT_INITIALIZED: u64 = 1;

    struct Subscription has copy, drop, store {
        leader: address,
        follower: address,
        share_bps: u64,
    }

    struct Events has key, store {
        subscribed: event::EventHandle<Subscription>,
        unsubscribed: event::EventHandle<Subscription>,
    }

    struct State has key {
        events: Events,
    }

    public entry fun init(admin: &signer) {
        move_to(admin, State { events: Events {
            subscribed: account::new_event_handle<Subscription>(admin),
            unsubscribed: account::new_event_handle<Subscription>(admin),
        }});
    }

    public entry fun subscribe(user: &signer, leader: address, share_bps: u64) acquires State {
        let addr = signer::address_of(user);
        if (!exists<State>(addr)) abort E_NOT_INITIALIZED;
        let s = borrow_global_mut<State>(addr);
        event::emit_event<Subscription>(&mut s.events.subscribed, Subscription { leader, follower: signer::address_of(user), share_bps });
    }

    public entry fun unsubscribe(user: &signer, leader: address) acquires State {
        let addr = signer::address_of(user);
        if (!exists<State>(addr)) abort E_NOT_INITIALIZED;
        let s = borrow_global_mut<State>(addr);
        event::emit_event<Subscription>(&mut s.events.unsubscribed, Subscription { leader, follower: signer::address_of(user), share_bps: 0 });
    }
}


