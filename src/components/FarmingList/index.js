import React, { useState, useEffect } from "react";
import { useMedia } from "react-use";
import dayjs from "dayjs";
import LocalLoader from "../LocalLoader";
import utc from "dayjs/plugin/utc";
import { Box, Flex, Text } from "rebass";
import styled from "styled-components";

import { CustomLink } from "../Link";
import { Divider } from "../../components";
import { withRouter } from "react-router-dom";
import { formattedNum } from "../../utils";
import DoubleTokenLogo from "../DoubleLogo";
import FormattedName from "../FormattedName";
import { TYPE } from "../../Theme";
import {
  useNativeCurrencySymbol,
  useNativeCurrencyWrapper,
} from "../../contexts/Network";
import { AutoRow } from "../Row";
import TokenLogo from "../TokenLogo";

dayjs.extend(utc);

const PageButtons = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 2em;
  margin-bottom: 0.5em;
`;

const Arrow = styled.div`
  color: ${({ theme }) => theme.primary1};
  opacity: ${(props) => (props.faded ? 0.3 : 1)};
  padding: 0 20px;
  user-select: none;
  :hover {
    cursor: pointer;
  }
`;

const List = styled(Box)`
  -webkit-overflow-scrolling: touch;
`;

const DashGrid = styled.div`
  display: grid;
  grid-gap: 1em;
  grid-template-columns: 100px 1fr 1fr;
  grid-template-areas: "name stake underlyingTokens";
  padding: 0 1.125rem;

  > * {
    justify-content: flex-end;

    :first-child {
      justify-content: flex-start;
      text-align: left;
    }
  }

  @media screen and (min-width: 680px) {
    display: grid;
    grid-gap: 1em;
    grid-template-columns: 180px 1fr 1fr 1fr;
    grid-template-areas: "name symbol stake underlyingTokens ";

    > * {
      justify-content: flex-end;
      width: 100%;

      &:first-child {
        justify-content: flex-start;
      }
    }
  }

  @media screen and (min-width: 1080px) {
    display: grid;
    grid-gap: 0.5em;
    grid-template-columns: 1fr 0.6fr 1.2fr 0.6fr 1fr 1fr 0.6fr;
    grid-template-areas: "name symbol stake underlyingTokens price change other";
  }
`;

const ListWrapper = styled.div``;

const ClickableText = styled(Text)`
  color: ${({ theme }) => theme.text1};
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
  text-align: end;
  user-select: none;
`;

const DataText = styled(Flex)`
  align-items: center;
  text-align: center;
  color: ${({ theme }) => theme.text1};

  & > * {
    font-size: 14px;
  }

  @media screen and (max-width: 600px) {
    font-size: 12px;
  }
`;

const SORT_FIELD = {
  STAKE: 0,
  UNDERLYING_TOKENS: 1,
  TVL: 3,
  DAY_YIELD: 4,
  APY: 5,
  STAKE_DOLLARS: 6,
};

const FIELD_TO_VALUE = {
  [SORT_FIELD.STAKE]: "stakedAmount",
  [SORT_FIELD.UNDERLYING_TOKENS]: "totalSupply",
  [SORT_FIELD.TVL]: "reserveUSD",
  [SORT_FIELD.STAKE_DOLLARS]: "stakedPriceInUsd",
};

function FarmingList({ campaigns, color, disbaleLinks, maxItems = 10 }) {
  const below600 = useMedia("(max-width: 600px)");
  const below680 = useMedia("(max-width: 680px)");
  const below740 = useMedia("(max-width: 740px)");
  const below1080 = useMedia("(max-width: 1080px)");
  // pagination
  const [page, setPage] = useState(1);
  const [maxPage, setMaxPage] = useState(1);
  const ITEMS_PER_PAGE = maxItems;

  // sorting
  const [sortDirection, setSortDirection] = useState(true);
  const [sortedColumn, setSortedColumn] = useState(SORT_FIELD.STAKE);

  const nativeCurrency = useNativeCurrencySymbol();
  const nativeCurrencyWrapper = useNativeCurrencyWrapper();


  useEffect(() => {
    setMaxPage(1); // edit this to do modular
    setPage(1);
  }, [campaigns]);

  useEffect(() => {
    if (campaigns) {
      let extraPages = 1;
      if (Object.keys(campaigns).length % ITEMS_PER_PAGE === 0) {
        extraPages = 0;
      }
      setMaxPage(
        Math.max(
          1,
          Math.floor(Object.keys(campaigns).length / ITEMS_PER_PAGE) + extraPages
        )
      );
    }
  }, [ITEMS_PER_PAGE, campaigns]);

  const ListItem = ({ pairAddress, index }) => {
    const pairData = campaigns[pairAddress];
    if (campaigns && campaigns.length !== 0) {

      const apy = pairData.miningCampaignObject.apy.toFixed(2);
      const yieldPer1k = (parseFloat(apy) / 365) * 10;
      return (
        <DashGrid
          style={{ height: "48px" }}
          disbaleLinks={disbaleLinks}
          focus={true}
        >
          <DataText area="name" fontWeight="500">
            {!below680 && (
              <div style={{ marginRight: "20px", width: "10px" }}>{index}</div>
            )}
            <DoubleTokenLogo
              size={below600 ? 16 : 20}
              a0={pairData.stakablePair.token0.id}
              a1={pairData.stakablePair.token1.id}
              defaultText0={pairData.stakablePair.token0.symbol}
              defaultText1={pairData.stakablePair.token1.symbol}
              margin={!below740}
            />
            <CustomLink
              style={{ marginLeft: "20px", whiteSpace: "nowrap" }}
              to={"/pair/" + pairAddress}
              color={color}
            >
              <FormattedName
                text={
                  (nativeCurrencyWrapper.symbol ===
                    pairData.stakablePair.token0.symbol
                    ? nativeCurrency
                    : pairData.stakablePair.token0.symbol) +
                  "-" +
                  (nativeCurrencyWrapper.symbol ===
                    pairData.stakablePair.token1.symbol
                    ? nativeCurrency
                    : pairData.stakablePair.token1.symbol)
                }
                maxCharacters={below600 ? 8 : 16}
                adjustSize={true}
                link={true}
              />
            </CustomLink>
          </DataText>
          <DataText area="stake">
            {formattedNum(pairData.stakedAmount)} LP
          </DataText>
          <DataText
            alignItems={"flex-end"}
            flexDirection={"column"}
            area="underlyingTokens"
          >
            <AutoRow
              justifyContent={"space-between"}
              marginBottom={"2px"}
              flexDirection={"row"}
              style={{ margin: "auto" }}
            >
              <TokenLogo
                address={pairData.stakablePair.token0.id}
                size={"13px"}
                defaultText={pairData.stakablePair.token0.symbol}
                flexBasis={"30%"}
                justifyContent="flex-end"
              />
              <DataText flexBasis={"30%"} textAlign="right" justifyContent="flex-end">
                {formattedNum(pairData.stakablePair.reserve0)}
              </DataText>
              <FormattedName
                text={
                  nativeCurrencyWrapper.symbol ===
                    pairData.stakablePair.token0.symbol
                    ? nativeCurrency
                    : pairData.stakablePair.token0.symbol
                }
                maxCharacters={below600 ? 8 : 16}
                adjustSize={true}
                link={true}
                flexBasis={"30%"}
                textAlign={"left"}
              />
            </AutoRow>
            <AutoRow justifyContent={"space-between"} flexDirection={"row"} style={{ margin: "auto" }}>
              <TokenLogo
                address={pairData.stakablePair.token1.id}
                size={"13px"}
                defaultText={pairData.stakablePair.token1.symbol}
                flexBasis={"30%"}
                justifyContent="flex-end"
              />
              <DataText flexBasis={"30%"} textAlign="right" justifyContent="flex-end">
                {formattedNum(pairData.stakablePair.reserve1)}
              </DataText>
              <FormattedName
                text={
                  nativeCurrencyWrapper.symbol ===
                    pairData.stakablePair.token1.symbol
                    ? nativeCurrency
                    : pairData.stakablePair.token1.symbol
                }
                maxCharacters={below600 ? 8 : 16}
                adjustSize={true}
                link={true}
                flexBasis={"30%"}
                textAlign={"left"}
              />
            </AutoRow>
          </DataText>
          {!below680 && (
            <DataText area="tvl">
              {formattedNum(pairData.stakablePair.reserveUSD, true)}
            </DataText>
          )}
          {!below1080 && (
            <DataText area="someOther">
              {formattedNum(pairData.stakedPriceInUsd)} $
            </DataText>
          )}
          {!below1080 && (
            <DataText area="yield1k">
              {formattedNum(yieldPer1k.toFixed(2))}$ /day
            </DataText>
          )}
          {!below1080 && (
            <DataText area="apy">
              {pairData.miningCampaignObject.apy.toFixed(2)} %
            </DataText>
          )}
        </DashGrid>
      );
    } else {
      return "";
    }
  };

  let campaignsList =
    campaigns &&
    Object.keys(campaigns).sort((campaignA, campaignB) => {
      const pairA = campaigns[campaignA];
      const pairB = campaigns[campaignB];

      let data1;
      let data2;
      if (
        sortedColumn === SORT_FIELD.APY ||
        sortedColumn === SORT_FIELD.DAY_YIELD
      ) {
        data1 = pairA.miningCampaignObject.apy.toFixed(18);
        data2 = pairB.miningCampaignObject.apy.toFixed(18);
      } else if (sortedColumn === SORT_FIELD.STAKE || sortedColumn === SORT_FIELD.STAKE_DOLLARS) {
        data1 = pairA[FIELD_TO_VALUE[sortedColumn]];
        data2 = pairB[FIELD_TO_VALUE[sortedColumn]];
      } else {
        data1 = pairA.stakablePair[FIELD_TO_VALUE[sortedColumn]];
        data2 = pairB.stakablePair[FIELD_TO_VALUE[sortedColumn]];
      }

      return parseFloat(data1) > parseFloat(data2)
        ? (sortDirection ? -1 : 1) * 1
        : (sortDirection ? -1 : 1) * -1;
    })
      .slice(ITEMS_PER_PAGE * (page - 1), page * ITEMS_PER_PAGE)
      .map((pairIndex, index) => {
        return (
          pairIndex && (
            <div key={index}>
              <ListItem
                key={index}
                index={(page - 1) * ITEMS_PER_PAGE + index + 1}
                pairAddress={pairIndex}
              />
              <Divider />
            </div>
          )
        );
      });

  return (
    <ListWrapper>
      <DashGrid
        center={true}
        disbaleLinks={disbaleLinks}
        style={{ height: "fit-content", padding: "0 1.125rem 1rem 1.125rem" }}
      >
        <Flex alignItems="center" justifyContent="flexStart">
          <TYPE.main area="name">Name</TYPE.main>
        </Flex>
        <Flex alignItems="center" justifyContent="flexEnd">
          <ClickableText
            area="stake"
            onClick={(e) => {
              setSortedColumn(SORT_FIELD.STAKE);
              setSortDirection(
                sortedColumn !== SORT_FIELD.STAKE ? true : !sortDirection
              );
            }}
          >
            Staked{" "}
            {sortedColumn === SORT_FIELD.STAKE
              ? !sortDirection
                ? "↑"
                : "↓"
              : ""}
          </ClickableText>
        </Flex>
        <Flex alignItems="center">
          <ClickableText
            area="underlyingTokens"
            onClick={(e) => {
              setSortedColumn(SORT_FIELD.UNDERLYING_TOKENS);
              setSortDirection(
                sortedColumn !== SORT_FIELD.UNDERLYING_TOKENS
                  ? true
                  : !sortDirection
              );
            }}
          >
            Underlying Tokens
            {sortedColumn === SORT_FIELD.UNDERLYING_TOKENS
              ? !sortDirection
                ? "↑"
                : "↓"
              : ""}
          </ClickableText>
        </Flex>
        {!below680 && (
          <Flex alignItems="center" justifyContent="flexEnd">
            <ClickableText
              area="tvl"
              onClick={(e) => {
                setSortedColumn(SORT_FIELD.TVL);
                setSortDirection(
                  sortedColumn !== SORT_FIELD.TVL ? true : !sortDirection
                );
              }}
            >
              TVL{" "}
              {sortedColumn === SORT_FIELD.TVL
                ? !sortDirection
                  ? "↑"
                  : "↓"
                : ""}
            </ClickableText>
          </Flex>
        )}
        {!below1080 && (
          <Flex alignItems="center" justifyContent="flexEnd">
            <ClickableText
              area="other"
              onClick={(e) => {
                setSortedColumn(SORT_FIELD.STAKE_DOLLARS);
                setSortDirection(
                  sortedColumn !== SORT_FIELD.STAKE_DOLLARS
                    ? true
                    : !sortDirection
                );
              }}
            >
              STAKED IN ${" "}
              {sortedColumn === SORT_FIELD.STAKE_DOLLARS
                ? !sortDirection
                  ? "↑"
                  : "↓"
                : ""}
            </ClickableText>
          </Flex>
        )}
        {!below1080 && (
          <Flex alignItems="center" justifyContent="flexEnd">
            <ClickableText
              area="yield1k"
              onClick={(e) => {
                setSortedColumn(SORT_FIELD.DAY_YIELD);
                setSortDirection(
                  sortedColumn !== SORT_FIELD.DAY_YIELD ? true : !sortDirection
                );
              }}
            >
              YIELD PER $1000{" "}
              {sortedColumn === SORT_FIELD.DAY_YIELD
                ? !sortDirection
                  ? "↑"
                  : "↓"
                : ""}
            </ClickableText>
          </Flex>
        )}
        {!below1080 && (
          <Flex alignItems="center" justifyContent="flexEnd">
            <ClickableText
              area="apy"
              onClick={(e) => {
                setSortedColumn(SORT_FIELD.APY);
                setSortDirection(
                  sortedColumn !== SORT_FIELD.APY ? true : !sortDirection
                );
              }}
            >
              APY{" "}
              {sortedColumn === SORT_FIELD.APY
                ? !sortDirection
                  ? "↑"
                  : "↓"
                : ""}
            </ClickableText>
          </Flex>
        )}
      </DashGrid>
      <Divider />
      <List p={0}>{!campaignsList ? <LocalLoader /> : campaignsList}</List>
      <PageButtons>
        <div
          onClick={(e) => {
            setPage(page === 1 ? page : page - 1);
          }}
        >
          <Arrow faded={page === 1 ? true : false}>←</Arrow>
        </div>
        <TYPE.body>{"Page " + page + " of " + maxPage}</TYPE.body>
        <div
          onClick={(e) => {
            setPage(page === maxPage ? page : page + 1);
          }}
        >
          <Arrow faded={page === maxPage ? true : false}>→</Arrow>
        </div>
      </PageButtons>
    </ListWrapper>
  );
}

export default withRouter(FarmingList);
