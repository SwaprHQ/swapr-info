import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import React, { useState, useEffect } from 'react';
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
  const [sortDirection, setSortDirection] = useState(true);
  const [sortedColumn, setSortedColumn] = useState(SORT_FIELD.STAKE);

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

  let campaignsList =
    campaigns &&
    Object.keys(campaigns)
      .sort((campaignA, campaignB) => {
        const pairA = campaigns[campaignA];
        const pairB = campaigns[campaignB];

        let data1;
        let data2;
        if (sortedColumn === SORT_FIELD.APY || sortedColumn === SORT_FIELD.DAY_YIELD) {
          data1 = pairA.miningCampaignObject.apy.toFixed(18);
          data2 = pairB.miningCampaignObject.apy.toFixed(18);
        } else if (sortedColumn === SORT_FIELD.STAKE || sortedColumn === SORT_FIELD.STAKE_DOLLARS) {
          data1 = pairA[FIELD_TO_VALUE[sortedColumn]];
          data2 = pairB[FIELD_TO_VALUE[sortedColumn]];
        } else {
          data1 = pairA.stakablePair[FIELD_TO_VALUE[sortedColumn]];
          data2 = pairB.stakablePair[FIELD_TO_VALUE[sortedColumn]];
        }

        return parseFloat(data1) > parseFloat(data2) ? (sortDirection ? -1 : 1) * 1 : (sortDirection ? -1 : 1) * -1;
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
        <Flex alignItems="center" justifyContent="flexStart">
          <TYPE.main area="name">Pair</TYPE.main>
        </Flex>
        <Flex alignItems="center" justifyContent="flexEnd">
          <ClickableText
            area="stake"
            onClick={() => {
              setSortedColumn(SORT_FIELD.STAKE);
              setSortDirection(sortedColumn !== SORT_FIELD.STAKE ? true : !sortDirection);
            }}
          >
            Staked (LP) {sortedColumn === SORT_FIELD.STAKE ? (!sortDirection ? '↑' : '↓') : ''}
          </ClickableText>
        </Flex>

        {!below1080 && (
          <Flex alignItems="center" justifyContent="flexEnd">
            <ClickableText
              area="other"
              onClick={() => {
                setSortedColumn(SORT_FIELD.STAKE_DOLLARS);
                setSortDirection(sortedColumn !== SORT_FIELD.STAKE_DOLLARS ? true : !sortDirection);
              }}
            >
              Staked in USD {sortedColumn === SORT_FIELD.STAKE_DOLLARS ? (!sortDirection ? '↑' : '↓') : ''}
            </ClickableText>
          </Flex>
        )}
        {!below1080 && (
          <Flex alignItems="center" justifyContent="flexEnd">
            <ClickableText
              area="yield1k"
              onClick={() => {
                setSortedColumn(SORT_FIELD.DAY_YIELD);
                setSortDirection(sortedColumn !== SORT_FIELD.DAY_YIELD ? true : !sortDirection);
              }}
            >
              Yield per $1000 {sortedColumn === SORT_FIELD.DAY_YIELD ? (!sortDirection ? '↑' : '↓') : ''}
            </ClickableText>
          </Flex>
        )}
        <Flex alignItems="center" justifyContent="flexEnd">
          <ClickableText
            area="apy"
            onClick={() => {
              setSortedColumn(SORT_FIELD.APY);
              setSortDirection(sortedColumn !== SORT_FIELD.APY ? true : !sortDirection);
            }}
          >
            APY {sortedColumn === SORT_FIELD.APY ? (!sortDirection ? '↑' : '↓') : ''}
          </ClickableText>
        </Flex>
        <Flex alignItems="center" justifyContent="flex-end">
          <ClickableText
            area="rewardTokens"
            onClick={() => {
              setSortedColumn(SORT_FIELD.REWARD_TOKENS);
              setSortDirection(sortedColumn !== SORT_FIELD.REWARD_TOKENS ? true : !sortDirection);
            }}
          >
            Reward Tokens
            {sortedColumn === SORT_FIELD.REWARD_TOKENS ? (!sortDirection ? '↑' : '↓') : ''}
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
