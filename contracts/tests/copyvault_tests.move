module tradegrid::copyvault_tests {
    use std::signer;
    use aptos_framework::account;
    use tradegrid::copy_vault;

    #[test(user = @0x1, leader = @0x2)]
    public fun can_subscribe(user: &signer, leader: &signer) {
        account::create_account_for_test(signer::address_of(user));
        account::create_account_for_test(signer::address_of(leader));
        copy_vault::init(user);
        copy_vault::subscribe(user, signer::address_of(leader), 100);
        copy_vault::unsubscribe(user, signer::address_of(leader));
    }
}


