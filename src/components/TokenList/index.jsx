import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useState, useEffect, useMemo, memo } from 'react';
import isEqual from 'react-fast-compare';
import { useMedia } from 'react-use';
import { Box, Flex, Text } from 'rebass';
import styled from 'styled-components';

import { Divider } from '..';
import { Typography } from '../../Theme';
import { OVERVIEW_TOKEN_BLACKLIST } from '../../constants';
import { formattedNum, formattedPercent } from '../../utils';
import FormattedName from '../FormattedName';
import { InternalListLink } from '../Link';
import LocalLoader from '../LocalLoader';
import PageButtons from '../PageButtons';
import Panel from '../Panel';
import Row from '../Row';
import TokenLogo from '../TokenLogo';

dayjs.extend(utc);

const List = styled(Box)`
  -webkit-overflow-scrolling: touch;
`;

const DashGrid = styled.div`
  display: grid;
  grid-gap: 1em;
  grid-template-columns: 100px 1fr;
  grid-template-areas: 'name vol';
  padding: 0 20px;

  > * {
    justify-content: flex-end;

    &:first-child {
      justify-content: flex-start;
      text-align: left;
    }
  }

  @media screen and (min-width: 680px) {
    padding: 0 36px;
    display: grid;
    grid-gap: 1em;
    grid-template-columns: 180px 1fr 1fr 1fr 1fr;
    grid-template-areas: 'name symbol price liq vol';

    > * {
      justify-content: flex-end;
      width: 100%;

      &:first-child {
        justify-content: flex-start;
      }
    }
  }

  @media screen and (min-width: 1080px) {
    padding: 0 36px;
    display: grid;
    grid-gap: 0.5em;
    grid-template-columns: 0.1fr 1.5fr 0.6fr 1fr 1fr 1fr 1fr;
    grid-template-areas: 'index name symbol price change liq vol';
  }
`;

const ClickableText = styled(Text)`
  text-align: end;
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
  user-select: none;
  color: ${({ theme }) => theme.text1};

  @media screen and (max-width: 640px) {
    font-size: 0.85rem;
  }
`;

const FlexText = ({ area, color, children }) => (
  <Typography.LargeText color={color || 'text1'} sx={{ gridArea: area, display: 'flex', alignItems: 'center' }}>
    {children}
  </Typography.LargeText>
);

const SORT_FIELD = {
  LIQ: 'totalLiquidityUSD',
  VOL: 'oneDayVolumeUSD',
  SYMBOL: 'symbol',
  NAME: 'name',
  PRICE: 'priceUSD',
  CHANGE: 'priceChangeUSD',
};

// @TODO rework into virtualized list
function TopTokenList({ tokens, itemMax = 10 }) {
  // page state
  const [page, setPage] = useState(1);
  const [maxPage, setMaxPage] = useState(1);

  // sorting
  const [sortDirection, setSortDirection] = useState(true);
  const [sortedColumn, setSortedColumn] = useState(SORT_FIELD.LIQ);

  const below1080 = useMedia('(max-width: 1080px)');
  const below680 = useMedia('(max-width: 680px)');

  const showLoader = !tokens || Object.keys(tokens).length === 0;

  useEffect(() => {
    setMaxPage(1); // edit this to do modular
    setPage(1);
  }, [tokens]);

  const formattedTokens = useMemo(() => {
    return (
      tokens &&
      Object.keys(tokens)
        .filter((key) => {
          return !OVERVIEW_TOKEN_BLACKLIST.includes(key);
        })
        .map((key) => tokens[key])
    );
  }, [tokens]);

  useEffect(() => {
    if (tokens && formattedTokens) {
      let extraPages = 1;
      if (formattedTokens.length % itemMax === 0) {
        extraPages = 0;
      }
      setMaxPage(Math.max(1, Math.floor(formattedTokens.length / itemMax) + extraPages));
    }
  }, [tokens, formattedTokens, itemMax]);

  const filteredList = useMemo(() => {
    return (
      formattedTokens &&
      formattedTokens
        .sort((a, b) => {
          if (sortedColumn === SORT_FIELD.SYMBOL || sortedColumn === SORT_FIELD.NAME) {
            return a[sortedColumn] > b[sortedColumn] ? (sortDirection ? -1 : 1) * 1 : (sortDirection ? -1 : 1) * -1;
          }
          return parseFloat(a[sortedColumn]) > parseFloat(b[sortedColumn])
            ? (sortDirection ? -1 : 1) * 1
            : (sortDirection ? -1 : 1) * -1;
        })
        .slice(itemMax * (page - 1), page * itemMax)
    );
  }, [formattedTokens, itemMax, page, sortDirection, sortedColumn]);

  const ListItem = ({ item, index }) => {
    return (
      <DashGrid style={{ height: '48px' }} focus={true}>
        {!below1080 && (
          <FlexText area={'index'} sx={{ marginRight: '1rem', minWidth: '16px' }}>
            {index}
          </FlexText>
        )}
        <FlexText area={'name'}>
          <Row>
            <TokenLogo address={item.id} defaultText={item.symbol} />
            <InternalListLink style={{ marginLeft: '16px', whiteSpace: 'nowrap' }} to={'/token/' + item.id}>
              <FormattedName text={item.name} maxCharacters={below680 ? 16 : 20} adjustSize={true} link={true} />
            </InternalListLink>
          </Row>
        </FlexText>
        {!below680 && (
          <FlexText area={'symbol'}>
            <FormattedName text={item.symbol} maxCharacters={5} />
          </FlexText>
        )}
        <FlexText area={'price'}>{formattedNum(item.priceUSD, true)}</FlexText>
        {!below1080 && <FlexText area={'change'}>{formattedPercent(item.priceChangeUSD)}</FlexText>}
        {!below680 && (
          <FlexText color={'text1'} area={'liq'}>
            {formattedNum(item.totalLiquidityUSD, true)}
          </FlexText>
        )}
        <FlexText color={'text1'} area={'vol'}>
          {formattedNum(item.oneDayVolumeUSD, true)}
        </FlexText>
      </DashGrid>
    );
  };

  return (
    <>
      <Panel style={{ marginTop: '6px', padding: below680 ? '20px 0' : '32px 0' }}>
        <DashGrid
          center={true}
          style={{ height: 'fit-content', padding: below680 ? '0 20px 24px 20px' : '0 36px 24px 36px' }}
        >
          {!below1080 && (
            <Typography.SmallBoldText color={'text8'} sx={{ display: 'flex', alignItems: 'center' }}>
              #
            </Typography.SmallBoldText>
          )}
          <Flex alignItems="center" width={'fit-content'}>
            <ClickableText
              color="text"
              area="name"
              fontWeight="500"
              onClick={() => {
                setSortedColumn(SORT_FIELD.NAME);
                setSortDirection(sortedColumn !== SORT_FIELD.NAME ? true : !sortDirection);
              }}
            >
              <Typography.SmallBoldText color={'text8'} sx={{ textTransform: 'uppercase' }}>
                Name {sortedColumn === SORT_FIELD.NAME ? (!sortDirection ? '↑' : '↓') : ''}
              </Typography.SmallBoldText>
            </ClickableText>
          </Flex>
          {!below680 && (
            <Flex alignItems="center">
              <ClickableText
                area="symbol"
                onClick={() => {
                  setSortedColumn(SORT_FIELD.SYMBOL);
                  setSortDirection(sortedColumn !== SORT_FIELD.SYMBOL ? true : !sortDirection);
                }}
              >
                <Typography.SmallBoldText color={'text8'} sx={{ textTransform: 'uppercase' }}>
                  Symbol {sortedColumn === SORT_FIELD.SYMBOL ? (!sortDirection ? '↑' : '↓') : ''}
                </Typography.SmallBoldText>
              </ClickableText>
            </Flex>
          )}
          <Flex alignItems="center">
            <ClickableText
              area="price"
              onClick={() => {
                setSortedColumn(SORT_FIELD.PRICE);
                setSortDirection(sortedColumn !== SORT_FIELD.PRICE ? true : !sortDirection);
              }}
            >
              <Typography.SmallBoldText color={'text8'} sx={{ textTransform: 'uppercase' }}>
                Price {sortedColumn === SORT_FIELD.PRICE ? (!sortDirection ? '↑' : '↓') : ''}
              </Typography.SmallBoldText>
            </ClickableText>
          </Flex>
          {!below1080 && (
            <Flex alignItems="center">
              <ClickableText
                area="change"
                onClick={() => {
                  setSortedColumn(SORT_FIELD.CHANGE);
                  setSortDirection(sortedColumn !== SORT_FIELD.CHANGE ? true : !sortDirection);
                }}
              >
                <Typography.SmallBoldText color={'text8'} sx={{ textTransform: 'uppercase' }}>
                  Price Change
                  {sortedColumn === SORT_FIELD.CHANGE ? (!sortDirection ? '↑' : '↓') : ''}
                </Typography.SmallBoldText>
              </ClickableText>
            </Flex>
          )}
          {!below680 && (
            <Flex alignItems="center">
              <ClickableText
                area="liq"
                onClick={() => {
                  setSortedColumn(SORT_FIELD.LIQ);
                  setSortDirection(sortedColumn !== SORT_FIELD.LIQ ? true : !sortDirection);
                }}
              >
                <Typography.SmallBoldText color={'text8'} sx={{ textTransform: 'uppercase' }}>
                  Liquidity {sortedColumn === SORT_FIELD.LIQ ? (!sortDirection ? '↑' : '↓') : ''}
                </Typography.SmallBoldText>
              </ClickableText>
            </Flex>
          )}
          <Flex alignItems="center">
            <ClickableText
              area="vol"
              onClick={() => {
                setSortedColumn(SORT_FIELD.VOL);
                setSortDirection(sortedColumn !== SORT_FIELD.VOL ? true : !sortDirection);
              }}
            >
              <Typography.SmallBoldText color={'text8'} sx={{ textTransform: 'uppercase' }}>
                24h Volume
                {sortedColumn === SORT_FIELD.VOL ? (!sortDirection ? '↑' : '↓') : ''}
              </Typography.SmallBoldText>
            </ClickableText>
          </Flex>
        </DashGrid>
        <Divider />
        <List p={0}>
          {showLoader ? (
            <LocalLoader />
          ) : (
            filteredList &&
            filteredList.map((item, index) => {
              return (
                <div key={index}>
                  <ListItem key={index} index={(page - 1) * itemMax + index + 1} item={item} />
                  <Divider />
                </div>
              );
            })
          )}
        </List>
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

export default memo(TopTokenList, isEqual);
