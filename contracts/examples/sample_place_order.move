module tradegrid::sample_place_order {
    use tradegrid::order_book;

    public fun run(user: &signer) {
        order_book::init_user(user);
        order_book::place_limit_order(user, 0, 100, 1);
    }
}
