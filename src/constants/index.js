export const SupportedNetwork = Object.freeze({
  MAINNET: "Mainnet",
  XDAI: "xDAI",
});

export const ChainId = Object.freeze({
  [SupportedNetwork.MAINNET]: 1,
  [SupportedNetwork.XDAI]: 100,
});

export const FACTORY_ADDRESS = {
  [SupportedNetwork.MAINNET]: "0xd34971BaB6E5E356fd250715F5dE0492BB070452",
  [SupportedNetwork.XDAI]: "0x5d48c95adffd4b40c1aaadc4e08fc44117e02179",
};

export const NATIVE_CURRENCY_SYMBOL = {
  [SupportedNetwork.MAINNET]: "ETH",
  [SupportedNetwork.XDAI]: "xDAI",
};

export const NATIVE_CURRENCY_WRAPPER = {
  [SupportedNetwork.MAINNET]: {
    symbol: "WETH",
    address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
  },
  [SupportedNetwork.XDAI]: {
    symbol: "WXDAI",
    address: "0xe91d153e0b41518a2ce8dd3d7944fa863463a97d",
  },
};

export const ETHERSCAN_PREFIXES = {
  [SupportedNetwork.MAINNET]: "",
};

export const BUNDLE_ID = "1";

export const timeframeOptions = {
  WEEK: "1 week",
  MONTH: "1 month",
  // THREE_MONTHS: '3 months',
  // YEAR: '1 year',
  ALL_TIME: "All time",
};

// hide from overview list
export const OVERVIEW_TOKEN_BLACKLIST = [
  "0x495c7f3a713870f68f8b418b355c085dfdc412c3",
  "0xc3761eb917cd790b30dad99f6cc5b4ff93c4f9ea",
  "0xe31debd7abff90b06bca21010dd860d8701fd901",
  "0xfc989fbb6b3024de5ca0144dc23c18a063942ac1",
];

// pair blacklist
export const PAIR_BLACKLIST = ["0xb6a741f37d6e455ebcc9f17e2c16d0586c3f57a5"];

/**
 * For tokens that cause erros on fee calculations
 */
export const FEE_WARNING_TOKENS = [
  "0xd46ba6d942050d489dbd938a2c909a5d5039a161",
];
