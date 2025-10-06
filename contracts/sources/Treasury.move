module tradegrid::treasury {
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;

    struct Fees has key {
        accrued: coin::Coin<AptosCoin>,
        fee_bps: u64,
    }

    public entry fun init(admin: &signer, fee_bps: u64) {
        move_to(admin, Fees { accrued: coin::zero<AptosCoin>(), fee_bps });
    }
}


