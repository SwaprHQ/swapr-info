import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useState, useEffect, useCallback } from 'react';
import { Box, Flex, Text } from 'rebass';
import styled from 'styled-components';

import { USD } from '@swapr/sdk';

import { Typography } from '../../Theme';
import { Divider } from '../../components';
import { useNativeCurrencyPrice } from '../../contexts/GlobalData';
import { useIsBelowPx } from '../../hooks/useIsBelowPx';
import LocalLoader from '../LocalLoader';
import PageButtons from '../PageButtons';
import Panel from '../Panel';
import ListItem, { DashGrid } from './ListItem';

dayjs.extend(utc);

const List = styled(Box)`
  -webkit-overflow-scrolling: touch;
`;

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
  DAY_YIELD: 1,
  APY: 2,
};

const SortIndicator = ({ sortColumn, column, direction }) => (
  <Box sx={{ position: 'absolute', ml: 1 }} as="span">
    {column === sortColumn ? (direction === 'desc' ? '↑' : '↓') : ' '}
  </Box>
);

function FarmingList({ campaigns, disbaleLinks, maxItems = 10 }) {
  const [nativeCurrencyPrice] = useNativeCurrencyPrice();

  const below680 = useIsBelowPx(680);
  const below1080 = useIsBelowPx(1080);

  // pagination
  const [page, setPage] = useState(1);
  const [maxPage, setMaxPage] = useState(1);
  const ITEMS_PER_PAGE = maxItems;

  // sorting
  const [sortConfig, setSortConfig] = useState({
    direction: 'asc',
    column: SORT_FIELD.STAKE,
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
    campaigns
      .sort(({ apy: apyA, staked: stakedA }, { apy: apyB, staked: stakedB }) => {
        let data1;
        let data2;

        if (sortConfig.column === SORT_FIELD.APY) {
          data1 = apyA.toFixed(18);
          data2 = apyB.toFixed(18);
        } else if (sortConfig.column === SORT_FIELD.DAY_YIELD) {
          data1 = (parseFloat(apyA.toFixed(18)) / 365) * 10;
          data2 = (parseFloat(apyB.toFixed(18)) / 365) * 10;
        } else {
          data1 = parseFloat(stakedA.nativeCurrencyAmount.toFixed(USD.decimals)) * parseFloat(nativeCurrencyPrice);
          data2 = parseFloat(stakedB.nativeCurrencyAmount.toFixed(USD.decimals)) * parseFloat(nativeCurrencyPrice);
        }

        return parseFloat(data1) > parseFloat(data2)
          ? (sortConfig.direction === 'asc' ? -1 : 1) * 1
          : (sortConfig.direction === 'desc' ? 1 : -1) * -1;
      })
      .slice(ITEMS_PER_PAGE * (page - 1), page * ITEMS_PER_PAGE)
      .map((campaign, index) => {
        return (
          <div key={campaign.address}>
            <ListItem
              key={campaign.address}
              index={(page - 1) * ITEMS_PER_PAGE + index + 1}
              campaign={campaign}
              nativeCurrencyPrice={nativeCurrencyPrice && parseFloat(nativeCurrencyPrice)}
            />
            <Divider />
          </div>
        );
      });

  return (
    <>
      <Panel style={{ padding: below680 ? '20px 0' : '32px 0' }}>
        <DashGrid
          center={true}
          disbaleLinks={disbaleLinks}
          style={{ height: 'fit-content', padding: below680 ? '0 20px 24px 20px' : '0 36px 24px 36px' }}
        >
          {!below1080 && (
            <Typography.SmallBoldText color={'text8'} sx={{ display: 'flex', alignItems: 'center' }}>
              #
            </Typography.SmallBoldText>
          )}
          <Flex alignItems={'center'} sx={{ justifyContent: 'flex-start' }}>
            <Typography.SmallBoldText color={'text8'} sx={{ textTransform: 'uppercase' }}>
              PAIR
            </Typography.SmallBoldText>
          </Flex>
          <Flex alignItems={'center'} justifyContent={'center'}>
            <ClickableText area="tvl" onClick={sortHandler(SORT_FIELD.STAKE)}>
              <Typography.SmallBoldText color={'text8'} sx={{ textTransform: 'uppercase' }}>
                {below680 ? 'TVL' : 'STAKED IN USD'}
                <SortIndicator sortColumn={SORT_FIELD.STAKE} {...sortConfig} />
              </Typography.SmallBoldText>
            </ClickableText>
          </Flex>
          {!below680 && (
            <Flex alignItems={'center'} justifyContent={'center'}>
              <ClickableText area="yield" onClick={sortHandler(SORT_FIELD.DAY_YIELD)}>
                <Typography.SmallBoldText color={'text8'} sx={{ textTransform: 'uppercase' }}>
                  YIELD PER $1000
                  <SortIndicator sortColumn={SORT_FIELD.DAY_YIELD} {...sortConfig} />
                </Typography.SmallBoldText>
              </ClickableText>
            </Flex>
          )}
          <Flex alignItems={'center'} justifyContent={'center'}>
            <ClickableText area="apy" onClick={sortHandler(SORT_FIELD.APY)}>
              <Typography.SmallBoldText color={'text8'} sx={{ textTransform: 'uppercase' }}>
                APY
                <SortIndicator sortColumn={SORT_FIELD.APY} {...sortConfig} />
              </Typography.SmallBoldText>
            </ClickableText>
          </Flex>
          <Flex alignItems={'center'} justifyContent={'center'}>
            <Typography.SmallBoldText color={'text8'} sx={{ textTransform: 'uppercase' }}>
              REWARD
            </Typography.SmallBoldText>
          </Flex>
          {!below1080 && (
            <Flex alignItems={'owner'} justifyContent={'center'}>
              <Typography.SmallBoldText color={'text8'} sx={{ textTransform: 'uppercase' }}>
                OWNER
              </Typography.SmallBoldText>
            </Flex>
          )}
          <Flex alignItems={'center'} justifyContent={'flex-end'}>
            <Typography.SmallBoldText color={'text8'} sx={{ textTransform: 'uppercase' }}>
              LINK
            </Typography.SmallBoldText>
          </Flex>
        </DashGrid>
        <Divider />
        <List p={0}>{!campaignsList ? <LocalLoader /> : campaignsList}</List>
      </Panel>
      <PageButtons
        activePage={page}
        maxPages={maxPage}
        onPreviousClick={() => setPage(page === 1 ? page : page - 1)}
        onNextClick={() => setPage(page === maxPage ? page : page + 1)}
      />
    </>
  );
}

export default FarmingList;
