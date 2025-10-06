module tradegrid::sample_settlement {
    use tradegrid::settlement;

    public fun run(taker: &signer, maker: address) {
        settlement::init(taker);
        settlement::settle_trade(taker, maker, 1, 1, true);
    }
}
