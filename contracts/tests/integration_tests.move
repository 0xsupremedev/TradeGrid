module tradegrid::integration_tests {
    use std::signer;
    use aptos_framework::account;
    use tradegrid::order_book;
    use tradegrid::settlement;

    #[test(user = @0x1, maker = @0x2)]
    public fun end_to_end(user: &signer, maker: &signer) {
        account::create_account_for_test(signer::address_of(user));
        account::create_account_for_test(signer::address_of(maker));
        order_book::init_user(user);
        settlement::init(user);
        settlement::init(maker);
        order_book::place_limit_order(user, 0, 100, 1);
        settlement::settle_trade(user, signer::address_of(maker), 0, 1, true);
    }
}


