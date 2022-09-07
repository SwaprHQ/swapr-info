import { JsonRpcProvider } from '@ethersproject/providers';

export enum Networks {
  MAINNET = 'Mainnet',
  XDAI = 'Gnosis Chain',
  ARBITRUM_ONE = 'Arbitrum',
}

export const SupportedNetwork = Object.freeze({
  MAINNET: 'Mainnet',
  XDAI: 'Gnosis Chain',
  ARBITRUM_ONE: 'Arbitrum',
});

export const ChainId = Object.freeze({
  [SupportedNetwork.MAINNET]: 1,
  [SupportedNetwork.XDAI]: 100,
  [SupportedNetwork.ARBITRUM_ONE]: 42161,
});

export const SupportedNetworkForChainId = Object.freeze({
  [ChainId[SupportedNetwork.MAINNET]]: SupportedNetwork.MAINNET,
  [ChainId[SupportedNetwork.XDAI]]: SupportedNetwork.XDAI,
  [ChainId[SupportedNetwork.ARBITRUM_ONE]]: SupportedNetwork.ARBITRUM_ONE,
});

export const ChainIdForSupportedNetwork = Object.freeze({
  [SupportedNetwork.MAINNET]: ChainId[SupportedNetwork.MAINNET],
  [SupportedNetwork.XDAI]: ChainId[SupportedNetwork.XDAI],
  [SupportedNetwork.ARBITRUM_ONE]: ChainId[SupportedNetwork.ARBITRUM_ONE],
});

export const NETWORK_SUBGRAPH_URLS = Object.freeze({
  [SupportedNetwork.MAINNET]: 'dxgraphs/swapr-mainnet-v2',
  [SupportedNetwork.XDAI]: 'dxgraphs/swapr-xdai-v2',
  [SupportedNetwork.ARBITRUM_ONE]: 'dxgraphs/swapr-arbitrum-one-v3',
});

export const FACTORY_ADDRESS = {
  [SupportedNetwork.MAINNET]: '0xd34971BaB6E5E356fd250715F5dE0492BB070452',
  [SupportedNetwork.XDAI]: '0x5d48c95adffd4b40c1aaadc4e08fc44117e02179',
  [SupportedNetwork.ARBITRUM_ONE]: '0x359f20ad0f42d75a5077e65f30274cabe6f4f01a',
};

export const NATIVE_CURRENCY_SYMBOL = {
  [SupportedNetwork.MAINNET]: 'ETH',
  [SupportedNetwork.XDAI]: 'xDAI',
  [SupportedNetwork.ARBITRUM_ONE]: 'ETH',
};

export const NATIVE_CURRENCY_WRAPPER = {
  [SupportedNetwork.MAINNET]: {
    symbol: 'WETH',
    address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  },
  [SupportedNetwork.XDAI]: {
    symbol: 'WXDAI',
    address: '0xe91d153e0b41518a2ce8dd3d7944fa863463a97d',
  },
  [SupportedNetwork.ARBITRUM_ONE]: {
    symbol: 'WETH',
    address: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
  },
};

export const DXD_ADDRESS = {
  [SupportedNetwork.MAINNET]: '0xa1d65E8fB6e87b60FECCBc582F7f97804B725521',
  [SupportedNetwork.XDAI]: '0xb90d6bec20993be5d72a5ab353343f7a0281f158',
  [SupportedNetwork.ARBITRUM_ONE]: '0xc3ae0333f0f34aa734d5493276223d95b8f9cb37',
};

export const SWPR_ADDRESS = {
  [SupportedNetwork.MAINNET]: '0x6cacdb97e3fc8136805a9e7c342d866ab77d0957',
  [SupportedNetwork.ARBITRUM_ONE]: '0xde903e2712288a1da82942dddf2c20529565ac30',
};

export const ETHERSCAN_PREFIXES = {
  [SupportedNetwork.MAINNET]: '',
};

export const BUNDLE_ID = '1';

export const timeframeOptions = {
  WEEK: '1 week',
  MONTH: '1 month',
  // THREE_MONTHS: '3 months',
  YEAR: '1 year',
  ALL_TIME: 'All time',
};

export const TIME_FILTER_OPTIONS = {
  WEEK: '1W',
  MONTH_1: '1M',
  YEAR: '1Y',
};

export const STACKED_CHART_TIME_FILTER_OPTIONS = {
  MONTH_1: '1M',
  MONTH_3: '3M',
  YEAR: '1Y',
};

// hide from overview list
export const OVERVIEW_TOKEN_BLACKLIST = [
  '0x495c7f3a713870f68f8b418b355c085dfdc412c3',
  '0xc3761eb917cd790b30dad99f6cc5b4ff93c4f9ea',
  '0xe31debd7abff90b06bca21010dd860d8701fd901',
  '0xfc989fbb6b3024de5ca0144dc23c18a063942ac1',
];

// pair blacklist
export const PAIR_BLACKLIST = ['0xb6a741f37d6e455ebcc9f17e2c16d0586c3f57a5'];

/**
 * For tokens that cause erros on fee calculations
 */
export const FEE_WARNING_TOKENS = ['0xd46ba6d942050d489dbd938a2c909a5d5039a161'];
export const TOKEN_LISTS = [
  'https://ipfs.io/ipfs/QmUWnK6AFHZ3S1hR7Up1h3Ntax3fP1ZyiTptDNG2cWLTeK',
  'https://raw.githubusercontent.com/compound-finance/token-list/master/compound.tokenlist.json',
  'https://umaproject.org/uma.tokenlist.json',
  'https://raw.githubusercontent.com/SetProtocol/uniswap-tokenlist/main/set.tokenlist.json',
  'https://app.tryroll.com/tokens.json',
  'https://tokens.coingecko.com/uniswap/all.json',
  'https://www.gemini.com/uniswap/manifest.json',
  'https://raw.githubusercontent.com/The-Blockchain-Association/sec-notice-list/master/ba-sec-list.json',
  'https://tokens.honeyswap.org',
  'https://ipfs.io/ipfs/QmUWxthidUYXUJ2kiZLLPxkMKYDAinnpA591R3SRN6wufs?filename=levinswap-default.tokenlist.json',
  'https://raw.githubusercontent.com/baofinance/tokenlists/main/xdai.json',
];

export const CHAIN_READONLY_PROVIDERS = {
  [SupportedNetwork.MAINNET]: new JsonRpcProvider('https://mainnet.infura.io/v3/0ebf4dd05d6740f482938b8a80860d13'),
  [SupportedNetwork.XDAI]: new JsonRpcProvider('https://rpc.gnosischain.com/'),
  [SupportedNetwork.ARBITRUM_ONE]: new JsonRpcProvider('https://arb1.arbitrum.io/rpc'),
};

export const MULTICALL_ADDRESS = {
  [SupportedNetwork.MAINNET]: '0xeefba1e63905ef1d7acba5a8513c70307c1ce441',
  [SupportedNetwork.XDAI]: '0xb5b692a88bdfc81ca69dcb1d924f59f0413a602a',
  [SupportedNetwork.ARBITRUM_ONE]: '0xF718F2bd590E5621e53f7b89398e52f7Acced8ca',
};

export const NETOWRK_FEE_RECEIVER_ADDRESSES = {
  [Networks.XDAI]: '0x65f29020d07a6cfa3b0bf63d749934d5a6e6ea18',
  [Networks.MAINNET]: '0xc6130400c1e3cd7b352db75055db9dd554e00ef0',
  [Networks.ARBITRUM_ONE]: '0x1d7c7cb66fb2d75123351fd0d6779e8d7724a1ae',
};

export const DEFAULT_BLOCK_DIFFERENCE_THRESHOLD = 30;

export const BLOCK_DIFFERENCE_THRESHOLD = {
  [SupportedNetwork.MAINNET]: DEFAULT_BLOCK_DIFFERENCE_THRESHOLD,
  [SupportedNetwork.XDAI]: DEFAULT_BLOCK_DIFFERENCE_THRESHOLD,
  [SupportedNetwork.ARBITRUM_ONE]: 200, // Arbitrum one has multiple blocks in the same second
};

export const FACTORY_STARTING_BLOCK = {
  [FACTORY_ADDRESS[SupportedNetwork.MAINNET]]: 10000000,
  [FACTORY_ADDRESS[SupportedNetwork.XDAI]]: 14557349,
  [FACTORY_ADDRESS[SupportedNetwork.ARBITRUM_ONE]]: 277186,
};

export const NETWORK_COLORS = {
  [SupportedNetwork.MAINNET]: '#2E17F2',
  [SupportedNetwork.XDAI]: '#F2994A',
  [SupportedNetwork.ARBITRUM_ONE]: '#685EC6',
};

export const SWAPR_LINK = 'https://swapr.eth.limo/#';

export const SWAPR_COINGECKO_ENDPOINT = 'https://9gpgpb0ig0.execute-api.us-east-1.amazonaws.com/prod';

export const CARROT_REWARD_TOKEN_REGEX = new RegExp(/g([a-zA-z]*)-\d{4}$/);
