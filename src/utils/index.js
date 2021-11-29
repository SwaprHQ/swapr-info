import React from "react";
import { BigNumber } from "bignumber.js";
import dayjs from "dayjs";
import { getAddress } from "@ethersproject/address";
import utc from "dayjs/plugin/utc";
import { GET_BLOCK, GET_BLOCKS, SHARE_VALUE } from "../apollo/queries";
import { Text } from "rebass";
import _Decimal from "decimal.js-light";
import toFormat from "toformat";
import {
  SupportedNetwork,
  timeframeOptions,
  ETHERSCAN_PREFIXES,
  ChainId,
} from "../constants";
import Numeral from "numeral";
import {
  CurrencyAmount,
  LiquidityMiningCampaign,
  Price,
  PricedToken,
  PricedTokenAmount,
  Token,
  TokenAmount,
  USD,
} from "@swapr/sdk";
import { parseUnits } from "@ethersproject/units";

// format libraries
const Decimal = toFormat(_Decimal);
BigNumber.set({ EXPONENTIAL_AT: 50 });
dayjs.extend(utc);

export function getTimeframe(timeWindow) {
  const utcEndTime = dayjs.utc();
  // based on window, get starttime
  let utcStartTime;
  switch (timeWindow) {
    case timeframeOptions.WEEK:
      utcStartTime = utcEndTime.subtract(1, "week").endOf("day").unix() - 1;
      break;
    case timeframeOptions.MONTH:
      utcStartTime = utcEndTime.subtract(1, "month").endOf("day").unix() - 1;
      break;
    case timeframeOptions.ALL_TIME:
      utcStartTime = utcEndTime.subtract(1, "year").endOf("day").unix() - 1;
      break;
    default:
      utcStartTime = utcEndTime.subtract(1, "year").startOf("year").unix() - 1;
      break;
  }
  return utcStartTime;
}

export function getPoolLink(
  selectedNetwork,
  nativeCurrency,
  nativeCurrencyWrapper,
  token0Address,
  token1Address = null,
  remove = false
) {
  if (!token1Address) {
    return (
      `https://swapr.eth.link/#/` +
      (remove ? `remove` : `add`) +
      `/${
        token0Address === nativeCurrencyWrapper.symbol
          ? nativeCurrency
          : token0Address
      }/${nativeCurrency}?chainId=${ChainId[selectedNetwork]}`
    );
  } else {
    return (
      `https://swapr.eth.link/#/` +
      (remove ? `remove` : `add`) +
      `/${
        token0Address === nativeCurrencyWrapper.symbol
          ? nativeCurrency
          : token0Address
      }/${
        token1Address === nativeCurrencyWrapper.symbol
          ? nativeCurrency
          : token1Address
      }?chainId=${ChainId[selectedNetwork]}`
    );
  }
}

export function getSwapLink(
  selectedNetwork,
  nativeCurrency,
  nativeCurrencyWrapper,
  token0Address,
  token1Address = null
) {
  if (!token1Address) {
    return `https://swapr.eth.link/#/swap?inputCurrency=${token0Address}&chainId=${ChainId[selectedNetwork]}`;
  } else {
    return `https://swapr.eth.link/#/swap?inputCurrency=${
      token0Address === nativeCurrencyWrapper.symbol
        ? nativeCurrency
        : token0Address
    }&outputCurrency=${
      token1Address === nativeCurrencyWrapper.symbol
        ? nativeCurrency
        : token1Address
    }&chainId=${ChainId[selectedNetwork]}`;
  }
}

const getExplorerPrefix = (selectedNetwork) => {
  switch (selectedNetwork) {
    case SupportedNetwork.XDAI:
      return "https://blockscout.com/poa/xdai";
    case SupportedNetwork.ARBITRUM_ONE:
      return "https://arbiscan.io/";
    default:
      return `https://${
        ETHERSCAN_PREFIXES[selectedNetwork] ||
        ETHERSCAN_PREFIXES[SupportedNetwork.MAINNET]
      }etherscan.io`;
  }
};

export function getExplorerLink(selectedNetwork, data, type) {
  const prefix = getExplorerPrefix(selectedNetwork);

  // exception. blockscout doesn't have a token-specific address
  if (selectedNetwork === SupportedNetwork.XDAI && type === "token") {
    return `${prefix}/address/${data}`;
  }

  switch (type) {
    case "transaction": {
      return `${prefix}/tx/${data}`;
    }
    case "token": {
      return `${prefix}/token/${data}`;
    }
    case "block": {
      return `${prefix}/block/${data}`;
    }
    case "address":
    default: {
      return `${prefix}/address/${data}`;
    }
  }
}

export function getSwaprAppLink(nativeCurrency, linkVariable, selectedNetwork) {
  let baseSwaprUrl = "https://swapr.eth.link/#/";
  if (!linkVariable) {
    return baseSwaprUrl;
  }

  return `${baseSwaprUrl}/${nativeCurrency}/${linkVariable}?chainId=${selectedNetwork}`;
}

export function localNumber(val) {
  return Numeral(val).format("0,0");
}

export const toNiceDate = (date) => {
  let x = dayjs.utc(dayjs.unix(date)).format("MMM DD");
  return x;
};

export const toWeeklyDate = (date) => {
  const formatted = dayjs.utc(dayjs.unix(date));
  date = new Date(formatted);
  const day = new Date(formatted).getDay();
  var lessDays = day === 6 ? 0 : day + 1;
  var wkStart = new Date(new Date(date).setDate(date.getDate() - lessDays));
  var wkEnd = new Date(new Date(wkStart).setDate(wkStart.getDate() + 6));
  return (
    dayjs.utc(wkStart).format("MMM DD") +
    " - " +
    dayjs.utc(wkEnd).format("MMM DD")
  );
};

export function getTimestampsForChanges() {
  const utcCurrentTime = dayjs();
  const t1 = utcCurrentTime.subtract(1, "day").startOf("minute").unix();
  const t2 = utcCurrentTime.subtract(2, "day").startOf("minute").unix();
  const tWeek = utcCurrentTime.subtract(1, "week").startOf("minute").unix();
  return [t1, t2, tWeek];
}

export async function splitQuery(
  query,
  localClient,
  vars,
  list,
  skipCount = 100
) {
  let fetchedData = {};
  let allFound = false;
  let skip = 0;

  while (!allFound) {
    let end = list.length;
    if (skip + skipCount < list.length) {
      end = skip + skipCount;
    }
    let sliced = list.slice(skip, end);
    let result = await localClient.query({
      query: query(...vars, sliced),
    });
    fetchedData = {
      ...fetchedData,
      ...result.data,
    };
    if (
      Object.keys(result.data).length < skipCount ||
      skip + skipCount > list.length
    ) {
      allFound = true;
    } else {
      skip += skipCount;
    }
  }

  return fetchedData;
}

/**
 * @notice Fetches first block after a given timestamp
 * @dev Query speed is optimized by limiting to a 600-second period
 * @param {Int} timestamp in seconds
 */
export async function getBlockFromTimestamp(blockClient, timestamp) {
  let result = await blockClient.query({
    query: GET_BLOCK,
    variables: {
      timestampFrom: timestamp,
      timestampTo: timestamp + 600,
    },
  });
  return result?.data?.blocks?.[0]?.number;
}

/**
 * @notice Fetches block objects for an array of timestamps.
 * @dev blocks are returned in chronological order (ASC) regardless of input.
 * @dev blocks are returned at string representations of Int
 * @dev timestamps are returns as they were provided; not the block time.
 * @param {Array} timestamps
 */
export async function getBlocksFromTimestamps(
  blockClient,
  timestamps,
  skipCount = 500
) {
  if (timestamps?.length === 0) {
    return [];
  }

  let fetchedData = await splitQuery(
    GET_BLOCKS,
    blockClient,
    [],
    timestamps,
    skipCount
  );

  let blocks = [];
  if (fetchedData) {
    for (var t in fetchedData) {
      if (fetchedData[t].length > 0) {
        blocks.push({
          timestamp: t.split("t")[1],
          number: fetchedData[t][0]["number"],
        });
      }
    }
  }
  return blocks;
}

export async function getLiquidityTokenBalanceOvertime(
  client,
  blockClient,
  account,
  timestamps
) {
  // get blocks based on timestamps
  const blocks = await getBlocksFromTimestamps(blockClient, timestamps);

  // get historical share values with time travel queries
  let result = await client.query({
    query: SHARE_VALUE(account, blocks),
  });

  let values = [];
  for (var row in result?.data) {
    let timestamp = row.split("t")[1];
    if (timestamp) {
      values.push({
        timestamp,
        balance: 0,
      });
    }
  }
}

/**
 * @notice Example query using time travel queries
 * @dev TODO - handle scenario where blocks are not available for a timestamps (e.g. current time)
 * @param {String} pairAddress
 * @param {Array} timestamps
 */
export async function getShareValueOverTime(
  client,
  blockClient,
  pairAddress,
  timestamps
) {
  if (!timestamps) {
    const utcCurrentTime = dayjs();
    const utcSevenDaysBack = utcCurrentTime.subtract(8, "day").unix();
    timestamps = getTimestampRange(utcSevenDaysBack, 86400, 7);
  }

  // get blocks based on timestamps
  const blocks = await getBlocksFromTimestamps(blockClient, timestamps);

  // get historical share values with time travel queries
  let result = await client.query({
    query: SHARE_VALUE(pairAddress, blocks),
  });

  let values = [];
  for (var row in result?.data) {
    let timestamp = row.split("t")[1];
    let sharePriceUsd =
      parseFloat(result.data[row]?.reserveUSD) /
      parseFloat(result.data[row]?.totalSupply);
    if (timestamp) {
      values.push({
        timestamp,
        sharePriceUsd,
        totalSupply: result.data[row].totalSupply,
        reserve0: result.data[row].reserve0,
        reserve1: result.data[row].reserve1,
        reserveUSD: result.data[row].reserveUSD,
        token0DerivedNativeCurrency:
          result.data[row].token0.derivedNativeCurrency,
        token1DerivedNativeCurrency:
          result.data[row].token1.derivedNativeCurrency,
        roiUsd:
          values && values[0] ? sharePriceUsd / values[0]["sharePriceUsd"] : 1,
        nativeCurrencyPrice: 0,
        token0PriceUSD: 0,
        token1PriceUSD: 0,
      });
    }
  }

  // add eth prices
  let index = 0;
  for (var brow in result?.data) {
    let timestamp = brow.split("b")[1];
    if (timestamp) {
      values[index].nativeCurrencyPrice = result.data[brow].nativeCurrencyPrice;
      values[index].token0PriceUSD =
        result.data[brow].nativeCurrencyPrice *
        values[index].token0DerivedNativeCurrency;
      values[index].token1PriceUSD =
        result.data[brow].nativeCurrencyPrice *
        values[index].token1DerivedNativeCurrency;
      index += 1;
    }
  }

  return values;
}

/**
 * @notice Creates an evenly-spaced array of timestamps
 * @dev Periods include a start and end timestamp. For example, n periods are defined by n+1 timestamps.
 * @param {Int} timestamp_from in seconds
 * @param {Int} period_length in seconds
 * @param {Int} periods
 */
export function getTimestampRange(timestamp_from, period_length, periods) {
  let timestamps = [];
  for (let i = 0; i <= periods; i++) {
    timestamps.push(timestamp_from + i * period_length);
  }
  return timestamps;
}

export const toNiceDateYear = (date) =>
  dayjs.utc(dayjs.unix(date)).format("MMMM DD, YYYY");

export const isAddress = (value) => {
  try {
    return getAddress(value.toLowerCase());
  } catch {
    return false;
  }
};

export const toK = (num) => {
  return Numeral(num).format("0.[00]a");
};

export const setThemeColor = (theme) =>
  document.documentElement.style.setProperty("--c-token", theme || "#333333");

export const Big = (number) => new BigNumber(number);

export const urls = {
  showTransaction: (tx, selectedNetwork) =>
    getExplorerLink(selectedNetwork, tx, "transaction"),
  showAddress: (address, selectedNetwork) =>
    getExplorerLink(selectedNetwork, address, "address"),
  showToken: (address, selectedNetwork) =>
    getExplorerLink(selectedNetwork, address, "token"),
  showBlock: (block, selectedNetwork) =>
    getExplorerLink(selectedNetwork, block, "block"),
};

export const formatTime = (unix) => {
  const now = dayjs();
  const timestamp = dayjs.unix(unix);

  const inSeconds = now.diff(timestamp, "second");
  const inMinutes = now.diff(timestamp, "minute");
  const inHours = now.diff(timestamp, "hour");
  const inDays = now.diff(timestamp, "day");

  if (inHours >= 24) {
    return `${inDays} ${inDays === 1 ? "day" : "days"} ago`;
  } else if (inMinutes >= 60) {
    return `${inHours} ${inHours === 1 ? "hour" : "hours"} ago`;
  } else if (inSeconds >= 60) {
    return `${inMinutes} ${inMinutes === 1 ? "minute" : "minutes"} ago`;
  } else {
    return `${inSeconds} ${inSeconds === 1 ? "second" : "seconds"} ago`;
  }
};

export const formatNumber = (num) => {
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
};

// using a currency library here in case we want to add more in future
export const formatDollarAmount = (num, digits) => {
  const formatter = new Intl.NumberFormat([], {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
  return formatter.format(num);
};

export const toSignificant = (number, significantDigits) => {
  Decimal.set({ precision: significantDigits + 1, rounding: Decimal.ROUND_UP });
  const updated = new Decimal(number).toSignificantDigits(significantDigits);
  return updated.toFormat(updated.decimalPlaces(), { groupSeparator: "" });
};

export const formattedNum = (number, usd = false, acceptNegatives = false) => {
  if (isNaN(number) || number === "" || number === undefined) {
    return usd ? "$0" : 0;
  }

  let num = parseFloat(number);

  if (num > 500000000) {
    return (usd ? "$" : "") + toK(num.toFixed(0), true);
  }

  if (num === 0) {
    if (usd) {
      return "$0";
    }
    return 0;
  }

  if (num < 0.0001 && num > 0) {
    return usd ? "< $0.0001" : "< 0.0001";
  }

  if (num > 1000) {
    return usd
      ? formatDollarAmount(num, 0)
      : Number(parseFloat(num).toFixed(0)).toLocaleString();
  }

  if (usd) {
    if (num < 0.1) {
      return formatDollarAmount(num, 4);
    } else {
      return formatDollarAmount(num, 2);
    }
  }

  return Number(parseFloat(num).toFixed(5)).toLocaleString();
};

export function rawPercent(percentRaw) {
  let percent = parseFloat(percentRaw * 100);
  if (!percent || percent === 0) {
    return "0%";
  }
  if (percent < 1 && percent > 0) {
    return "< 1%";
  }
  return percent.toFixed(0) + "%";
}

export function formattedPercent(percent, useBrackets = false) {
  percent = parseFloat(percent);
  if (!percent || percent === 0) {
    return <Text fontWeight={500}>0%</Text>;
  }

  if (percent < 0.0001 && percent > 0) {
    return (
      <Text fontWeight={500} color="green">
        {"< 0.0001%"}
      </Text>
    );
  }

  if (percent < 0 && percent > -0.0001) {
    return (
      <Text fontWeight={500} color="red">
        {"< 0.0001%"}
      </Text>
    );
  }

  let fixedPercent = percent.toFixed(2);
  if (fixedPercent === "0.00") {
    return "0%";
  }
  if (fixedPercent > 0) {
    if (fixedPercent > 100) {
      return (
        <Text fontWeight={500} color="green">{`+${percent
          ?.toFixed(0)
          .toLocaleString()}%`}</Text>
      );
    } else {
      return <Text fontWeight={500} color="green">{`+${fixedPercent}%`}</Text>;
    }
  } else {
    return <Text fontWeight={500} color="red">{`${fixedPercent}%`}</Text>;
  }
}

/**
 * gets the amoutn difference plus the % change in change itself (second order change)
 * @param {*} valueNow
 * @param {*} value24HoursAgo
 * @param {*} value48HoursAgo
 */
export const get2DayPercentChange = (
  valueNow,
  value24HoursAgo,
  value48HoursAgo
) => {
  // get volume info for both 24 hour periods
  let currentChange = parseFloat(valueNow) - parseFloat(value24HoursAgo);
  let previousChange =
    parseFloat(value24HoursAgo) - parseFloat(value48HoursAgo);

  const adjustedPercentChange =
    (parseFloat(currentChange - previousChange) / parseFloat(previousChange)) *
    100;

  if (isNaN(adjustedPercentChange) || !isFinite(adjustedPercentChange)) {
    return [currentChange, 0];
  }
  return [currentChange, adjustedPercentChange];
};

/**
 * get standard percent change between two values
 * @param {*} valueNow
 * @param {*} value24HoursAgo
 */
export const getPercentChange = (valueNow, value24HoursAgo) => {
  const adjustedPercentChange =
    ((parseFloat(valueNow) - parseFloat(value24HoursAgo)) /
      parseFloat(value24HoursAgo)) *
    100;
  if (isNaN(adjustedPercentChange) || !isFinite(adjustedPercentChange)) {
    return 0;
  }
  return adjustedPercentChange;
};

export function isEquivalent(a, b) {
  var aProps = Object.getOwnPropertyNames(a);
  var bProps = Object.getOwnPropertyNames(b);
  if (aProps.length !== bProps.length) {
    return false;
  }
  for (var i = 0; i < aProps.length; i++) {
    var propName = aProps[i];
    if (a[propName] !== b[propName]) {
      return false;
    }
  }
  return true;
}

export function getLpTokenPrice(
  pair,
  nativeCurrency,
  totalSupply,
  reserveNativeCurrency
) {
  const decimalTotalSupply = new Decimal(totalSupply);
  // the following check avoids division by zero when total supply is zero
  // (case in which a pair has been created but liquidity has never been proviided)
  const priceDenominator = decimalTotalSupply.isZero()
    ? "1"
    : parseUnits(
        new Decimal(totalSupply).toFixed(pair.liquidityToken.decimals),
        pair.liquidityToken.decimals
      ).toString();
  return new Price(
    pair.liquidityToken,
    nativeCurrency,
    priceDenominator,
    parseUnits(
      new Decimal(reserveNativeCurrency).toFixed(nativeCurrency.decimals),
      nativeCurrency.decimals
    ).toString()
  );
}

export function toLiquidityMiningCampaign(
  chainId,
  targetedPair,
  targetedPairLpTokenTotalSupply,
  targetedPairReserveNativeCurrency,
  campaign,
  nativeCurrency
) {
  const rewards = campaign.rewardTokens.map((rewardToken, index) => {
    const properRewardToken = new Token(
      chainId,
      getAddress(rewardToken.address),
      parseInt(rewardToken.decimals),
      rewardToken.symbol,
      rewardToken.name
    );
    const rewardTokenPriceNativeCurrency = new Price(
      properRewardToken,
      nativeCurrency,
      parseUnits("1", nativeCurrency.decimals).toString(),
      parseUnits(
        new Decimal(rewardToken.derivedNativeCurrency).toFixed(
          nativeCurrency.decimals
        ),
        nativeCurrency.decimals
      ).toString()
    );
    const pricedRewardToken = new PricedToken(
      chainId,
      getAddress(rewardToken.address),
      parseInt(rewardToken.decimals),
      rewardTokenPriceNativeCurrency,
      rewardToken.symbol,
      rewardToken.name
    );
    return new PricedTokenAmount(
      pricedRewardToken,
      parseUnits(campaign.rewardAmounts[index], rewardToken.decimals).toString()
    );
  });
  const lpTokenPriceNativeCurrency = getLpTokenPrice(
    targetedPair,
    nativeCurrency,
    targetedPairLpTokenTotalSupply,
    targetedPairReserveNativeCurrency
  );
  const stakedPricedToken = new PricedToken(
    chainId,
    getAddress(targetedPair.liquidityToken.address),
    targetedPair.liquidityToken.decimals,
    lpTokenPriceNativeCurrency,
    targetedPair.liquidityToken.symbol,
    targetedPair.liquidityToken.name
  );
  const staked = new PricedTokenAmount(
    stakedPricedToken,
    parseUnits(campaign.stakedAmount, stakedPricedToken.decimals).toString()
  );
  return new LiquidityMiningCampaign(
    campaign.startsAt,
    campaign.endsAt,
    targetedPair,
    rewards,
    staked,
    campaign.locked,
    new TokenAmount(
      targetedPair.liquidityToken,
      parseUnits(
        campaign.stakingCap,
        targetedPair.liquidityToken.decimals
      ).toString()
    ),
    getAddress(campaign.id)
  );
}

export function getStakedAmountUSD(
  campaign,
  nativeCurrencyUSDPrice,
  nativeCurrency
) {
  const nativeCurrencyPrice = new Price(
    nativeCurrency,
    USD,
    parseUnits("1", USD.decimals).toString(),
    parseUnits(
      new Decimal(nativeCurrencyUSDPrice).toFixed(18),
      USD.decimals
    ).toString()
  );
  return CurrencyAmount.usd(
    parseUnits(
      campaign.staked.nativeCurrencyAmount
        .multiply(nativeCurrencyPrice)
        .toFixed(USD.decimals),
      USD.decimals
    ).toString()
  );
}
