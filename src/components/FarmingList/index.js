import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import React, { useState, useEffect, useCallback } from 'react';
import { useMedia } from 'react-use';
import { Box, Flex, Text } from 'rebass';
import styled from 'styled-components';

import { TYPE } from '../../Theme';
import { Divider } from '../../components';
import LocalLoader from '../LocalLoader';
import ListItem, { DashGrid } from './ListItem';

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

const SORT_FIELD = {
  STAKE: 0,
  REWARD_TOKENS: 1,
  DAY_YIELD: 4,
  APY: 5,
  STAKE_DOLLARS: 6,
};

const SortIndicator = ({ sortColumn, column, direction }) => (
  <Box sx={{ position: 'absolute', ml: 1 }} as="span">
    {column === sortColumn ? (direction === 'desc' ? '↑' : '↓') : ' '}
  </Box>
);

const FIELD_TO_VALUE = {
  [SORT_FIELD.STAKE]: 'stakedAmount',
  [SORT_FIELD.REWARD_TOKENS]: 'totalSupply',
  [SORT_FIELD.STAKE_DOLLARS]: 'stakedPriceInUsd',
};

function FarmingList({ campaigns, disbaleLinks, maxItems = 10 }) {
  const below1080 = useMedia('(max-width: 1080px)');
  // pagination
  const [page, setPage] = useState(1);
  const [maxPage, setMaxPage] = useState(1);
  const ITEMS_PER_PAGE = maxItems;

  // sorting
  const [sortConfig, setSortConfig] = useState({
    direction: 'asc',
    column: SORT_FIELD.STAKE_DOLLARS,
  });

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
      setMaxPage(Math.max(1, Math.floor(Object.keys(campaigns).length / ITEMS_PER_PAGE) + extraPages));
    }
  }, [ITEMS_PER_PAGE, campaigns]);

  const sortHandler = useCallback(
    (column) => {
      return () => {
        const direction = sortConfig.column === column && sortConfig.direction === 'asc' ? 'desc' : 'asc';
        setSortConfig({ column, direction });
      };
    },
    [sortConfig.column, sortConfig.direction],
  );

  const campaignsList =
    campaigns &&
    Object.keys(campaigns)
      .sort((campaignA, campaignB) => {
        const pairA = campaigns[campaignA];
        const pairB = campaigns[campaignB];

        let data1;
        let data2;
        if (sortConfig.column === SORT_FIELD.APY || sortConfig.column === SORT_FIELD.DAY_YIELD) {
          data1 = pairA.miningCampaignObject.apy.toFixed(18);
          data2 = pairB.miningCampaignObject.apy.toFixed(18);
        } else if (sortConfig.column === SORT_FIELD.STAKE || sortConfig.column === SORT_FIELD.STAKE_DOLLARS) {
          data1 = pairA[FIELD_TO_VALUE[sortConfig.column]];
          data2 = pairB[FIELD_TO_VALUE[sortConfig.column]];
        } else {
          data1 = pairA.stakablePair[FIELD_TO_VALUE[sortConfig.column]];
          data2 = pairB.stakablePair[FIELD_TO_VALUE[sortConfig.column]];
        }

        return parseFloat(data1) > parseFloat(data2)
          ? (sortConfig.direction === 'asc' ? -1 : 1) * 1
          : (sortConfig.direction === 'desc' ? 1 : -1) * -1;
      })
      .slice(ITEMS_PER_PAGE * (page - 1), page * ITEMS_PER_PAGE)
      .map((pairIndex, index) => {
        return (
          pairIndex && (
            <div key={index}>
              <ListItem key={index} index={(page - 1) * ITEMS_PER_PAGE + index + 1} pairData={campaigns[pairIndex]} />
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
        style={{ height: 'fit-content', padding: '0 1.125rem 1rem 1.125rem' }}
      >
        <Flex alignItems="center" sx={{ justifyContent: 'center !important' }}>
          <TYPE.main area="name">Pair</TYPE.main>
        </Flex>
        <Flex alignItems="center" justifyContent="flexEnd">
          <ClickableText area="stake" onClick={sortHandler(SORT_FIELD.STAKE)}>
            Staked (LP) <SortIndicator sortColumn={SORT_FIELD.STAKE} {...sortConfig} />
          </ClickableText>
        </Flex>

        {!below1080 && (
          <Flex alignItems="center" justifyContent="flexEnd">
            <ClickableText area="staked" onClick={sortHandler(SORT_FIELD.STAKE_DOLLARS)}>
              Staked in USD <SortIndicator sortColumn={SORT_FIELD.STAKE_DOLLARS} {...sortConfig} />
            </ClickableText>
          </Flex>
        )}
        {!below1080 && (
          <Flex alignItems="center" justifyContent="flexEnd">
            <ClickableText area="yield1k" onClick={sortHandler(SORT_FIELD.DAY_YIELD)}>
              Yield per $1000 <SortIndicator sortColumn={SORT_FIELD.DAY_YIELD} {...sortConfig} />
            </ClickableText>
          </Flex>
        )}
        <Flex alignItems="center" justifyContent="flexEnd">
          <ClickableText area="apy" onClick={sortHandler(SORT_FIELD.APY)}>
            APY <SortIndicator sortColumn={SORT_FIELD.APY} {...sortConfig} />
          </ClickableText>
        </Flex>
        <Flex alignItems="center" justifyContent="flex-end">
          <ClickableText area="rewardTokens" onClick={sortHandler(SORT_FIELD.REWARD_TOKENS)}>
            Reward Tokens <SortIndicator sortColumn={SORT_FIELD.REWARD_TOKENS} {...sortConfig} />
          </ClickableText>
        </Flex>
        <Flex alignItems="center" justifyContent="flex-end" area="swaprLink">
          <TYPE.main>Link</TYPE.main>
        </Flex>
      </DashGrid>
      <Divider />
      <List p={0}>{!campaignsList ? <LocalLoader /> : campaignsList}</List>
      {campaignsList && (
        <PageButtons>
          <div
            onClick={() => {
              setPage(page === 1 ? page : page - 1);
            }}
          >
            <Arrow faded={page === 1 ? true : false}>←</Arrow>
          </div>
          <TYPE.body>{'Page ' + page + ' of ' + maxPage}</TYPE.body>
          <div
            onClick={() => {
              setPage(page === maxPage ? page : page + 1);
            }}
          >
            <Arrow faded={page === maxPage ? true : false}>→</Arrow>
          </div>
        </PageButtons>
      )}
    </ListWrapper>
  );
}

export default FarmingList;
