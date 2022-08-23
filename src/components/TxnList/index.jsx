import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useState, useEffect } from 'react';
import { useMedia } from 'react-use';
import { Box, Flex, Text } from 'rebass';
import styled from 'styled-components';

import { Divider, EmptyCard } from '..';
import { Typography } from '../../Theme';
import { useSelectedNetwork } from '../../contexts/Network';
import { formatTime, formattedNum, urls, getExplorerLink } from '../../utils';
import { updateNameData } from '../../utils/data';
import FormattedName from '../FormattedName';
import { ExternalListLink } from '../Link';
import LocalLoader from '../LocalLoader';
import PageButtons from '../PageButtons';
import Panel from '../Panel';

dayjs.extend(utc);

const List = styled(Box)`
  -webkit-overflow-scrolling: touch;
`;

const DashGrid = styled.div`
  display: grid;
  grid-gap: 1em;
  grid-template-columns: 100px 1fr 1fr;
  grid-template-areas: 'txn value time';
  padding: 0 20px;

  > * {
    justify-content: flex-end;
    width: 100%;

    &:first-child {
      justify-content: flex-start;
      text-align: left;
      width: 100px;
    }
  }

  @media screen and (min-width: 680px) {
    padding: 0 36px;

    > * {
      &:first-child {
        width: 180px;
      }
    }
  }

  @media screen and (min-width: 780px) {
    padding: 0 36px;
    grid-template-columns: 1.2fr 1fr 1fr 1fr 1fr;
    grid-template-areas: 'txn value amountToken amountOther time';

    > * {
      &:first-child {
        width: 180px;
      }
    }
  }

  @media screen and (min-width: 1080px) {
    padding: 0 36px;
    grid-template-columns: 1.2fr 1fr 1fr 1fr 1fr 1fr;
    grid-template-areas: 'txn value amountToken amountOther account time';
  }
`;

const ClickableText = styled(Text)`
  color: ${({ theme }) => theme.text1};
  user-select: none;
  text-align: end;

  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }

  @media screen and (max-width: 640px) {
    font-size: 14px;
  }
`;

const SortText = styled.button`
  padding: 4px 5px;
  border: 1px solid;
  border-color: ${({ theme }) => theme.bd1};
  border-radius: 6px;
  background-color: ${({ isActive, theme }) => (isActive ? theme.bg2 : 'transparent')};
  color: ${({ isActive, theme }) => (isActive ? theme.text12 : theme.text7)};
  text-transform: uppercase;

  :hover {
    cursor: pointer;
  }

  :hover > * {
    color: ${({ theme }) => theme.text12};
  }

  & > div {
    color: ${({ isActive, theme }) => (isActive ? theme.text12 : theme.text7)};
  }

  transition: background 200ms;
`;

const FlexText = ({ area, color, children }) => (
  <Typography.LargeText color={color || 'text1'} sx={{ gridArea: area, display: 'flex', alignItems: 'center' }}>
    {children}
  </Typography.LargeText>
);

const SORT_FIELD = {
  VALUE: 'amountUSD',
  AMOUNT0: 'token0Amount',
  AMOUNT1: 'token1Amount',
  TIMESTAMP: 'timestamp',
};

const TXN_TYPE = {
  ALL: 'All',
  SWAP: 'Swaps',
  ADD: 'Adds',
  REMOVE: 'Removes',
};

const ITEMS_PER_PAGE = 10;

function getTransactionType(event, symbol0, symbol1) {
  const formattedS0 = symbol0?.length > 8 ? symbol0.slice(0, 7) + '...' : symbol0;
  const formattedS1 = symbol1?.length > 8 ? symbol1.slice(0, 7) + '...' : symbol1;
  switch (event) {
    case TXN_TYPE.ADD:
      return 'Add ' + formattedS0 + ' and ' + formattedS1;
    case TXN_TYPE.REMOVE:
      return 'Remove ' + formattedS0 + ' and ' + formattedS1;
    case TXN_TYPE.SWAP:
      return 'Swap ' + formattedS0 + ' for ' + formattedS1;
    default:
      return '';
  }
}

// @TODO rework into virtualized list
function TxnList({ transactions, symbol0Override, symbol1Override }) {
  const below1080 = useMedia('(max-width: 1080px)');
  const below780 = useMedia('(max-width: 780px)');
  const below680 = useMedia('(max-width: 680px)');

  const selectedNetwork = useSelectedNetwork();

  // page state
  const [page, setPage] = useState(1);
  const [maxPage, setMaxPage] = useState(1);

  // sorting
  const [sortDirection, setSortDirection] = useState(true);
  const [sortedColumn, setSortedColumn] = useState(SORT_FIELD.TIMESTAMP);
  const [filteredItems, setFilteredItems] = useState();
  const [txFilter, setTxFilter] = useState(TXN_TYPE.ALL);

  useEffect(() => {
    setMaxPage(1); // edit this to do modular
    setPage(1);
  }, [transactions]);

  // parse the txns and format for UI
  useEffect(() => {
    if (transactions && transactions.mints && transactions.burns && transactions.swaps) {
      let newTxns = [];
      if (transactions.mints.length > 0) {
        transactions.mints.map((mint) => {
          let newTxn = {};
          newTxn.hash = mint.transaction.id;
          newTxn.timestamp = mint.transaction.timestamp;
          newTxn.type = TXN_TYPE.ADD;
          newTxn.token0Amount = mint.amount0;
          newTxn.token1Amount = mint.amount1;
          newTxn.account = mint.to;
          newTxn.token0Symbol = updateNameData(mint.pair).token0.symbol;
          newTxn.token1Symbol = updateNameData(mint.pair).token1.symbol;
          newTxn.amountUSD = mint.amountUSD;
          return newTxns.push(newTxn);
        });
      }
      if (transactions.burns.length > 0) {
        transactions.burns.map((burn) => {
          let newTxn = {};
          newTxn.hash = burn.transaction.id;
          newTxn.timestamp = burn.transaction.timestamp;
          newTxn.type = TXN_TYPE.REMOVE;
          newTxn.token0Amount = burn.amount0;
          newTxn.token1Amount = burn.amount1;
          newTxn.account = burn.sender;
          newTxn.token0Symbol = updateNameData(burn.pair).token0.symbol;
          newTxn.token1Symbol = updateNameData(burn.pair).token1.symbol;
          newTxn.amountUSD = burn.amountUSD;
          return newTxns.push(newTxn);
        });
      }
      if (transactions.swaps.length > 0) {
        transactions.swaps.map((swap) => {
          const netToken0 = swap.amount0In - swap.amount0Out;
          const netToken1 = swap.amount1In - swap.amount1Out;

          let newTxn = {};

          if (netToken0 < 0) {
            newTxn.token0Symbol = updateNameData(swap.pair).token0.symbol;
            newTxn.token1Symbol = updateNameData(swap.pair).token1.symbol;
            newTxn.token0Amount = Math.abs(netToken0);
            newTxn.token1Amount = Math.abs(netToken1);
          } else if (netToken1 < 0) {
            newTxn.token0Symbol = updateNameData(swap.pair).token1.symbol;
            newTxn.token1Symbol = updateNameData(swap.pair).token0.symbol;
            newTxn.token0Amount = Math.abs(netToken1);
            newTxn.token1Amount = Math.abs(netToken0);
          }

          newTxn.hash = swap.transaction.id;
          newTxn.timestamp = swap.transaction.timestamp;
          newTxn.type = TXN_TYPE.SWAP;

          newTxn.amountUSD = swap.amountUSD;
          newTxn.account = swap.from;
          return newTxns.push(newTxn);
        });
      }

      const filtered = newTxns.filter((item) => {
        if (txFilter !== TXN_TYPE.ALL) {
          return item.type === txFilter;
        }
        return true;
      });
      setFilteredItems(filtered);
      let extraPages = 1;
      if (filtered.length % ITEMS_PER_PAGE === 0) {
        extraPages = 0;
      }
      if (filtered.length === 0) {
        setMaxPage(1);
      } else {
        setMaxPage(Math.floor(filtered.length / ITEMS_PER_PAGE) + extraPages);
      }
    }
  }, [transactions, txFilter]);

  useEffect(() => {
    setPage(1);
  }, [txFilter]);

  useEffect(() => {
    setTxFilter(TXN_TYPE.ALL);
  }, [below680]);

  const filteredList =
    filteredItems &&
    filteredItems
      .sort((a, b) => {
        return parseFloat(a[sortedColumn]) > parseFloat(b[sortedColumn])
          ? (sortDirection ? -1 : 1) * 1
          : (sortDirection ? -1 : 1) * -1;
      })
      .slice(ITEMS_PER_PAGE * (page - 1), page * ITEMS_PER_PAGE);

  const ListItem = ({ item }) => {
    return (
      <DashGrid style={{ height: '48px' }}>
        <FlexText area={'txn'}>
          <ExternalListLink external href={urls.showTransaction(item.hash, selectedNetwork)}>
            {getTransactionType(item.type, item.token1Symbol, item.token0Symbol)}
          </ExternalListLink>
        </FlexText>
        <FlexText area={'value'}>{formattedNum(item.amountUSD, true)}</FlexText>
        {!below780 && (
          <>
            <FlexText area={'amountOther'}>
              {formattedNum(item.token1Amount) + ' '}{' '}
              <FormattedName text={item.token1Symbol} maxCharacters={5} margin={true} />
            </FlexText>
            <FlexText area={'amountToken'}>
              {formattedNum(item.token0Amount) + ' '}{' '}
              <FormattedName text={item.token0Symbol} maxCharacters={5} margin={true} />
            </FlexText>
          </>
        )}
        {!below1080 && (
          <FlexText area={'account'}>
            <ExternalListLink external href={getExplorerLink(selectedNetwork, item.account, 'address')}>
              {item.account && item.account.slice(0, 6) + '...' + item.account.slice(38, 42)}
            </ExternalListLink>
          </FlexText>
        )}
        <FlexText area={'time'}>{formatTime(item.timestamp)}</FlexText>
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
          <Flex area={'txn'} sx={{ gap: '6px' }}>
            {below680 ? (
              <SortText
                onClick={() => {
                  setTxFilter(TXN_TYPE.ALL);
                }}
                isActive={txFilter === TXN_TYPE.ALL}
              >
                <Typography.SmallText sx={{ letterSpacing: '0.08em' }}>All</Typography.SmallText>
              </SortText>
            ) : (
              <>
                <SortText
                  onClick={() => {
                    setTxFilter(TXN_TYPE.ALL);
                  }}
                  isActive={txFilter === TXN_TYPE.ALL}
                >
                  <Typography.SmallText sx={{ letterSpacing: '0.08em' }}>All</Typography.SmallText>
                </SortText>
                <SortText
                  onClick={() => {
                    setTxFilter(TXN_TYPE.SWAP);
                  }}
                  isActive={txFilter === TXN_TYPE.SWAP}
                >
                  <Typography.SmallText sx={{ letterSpacing: '0.08em' }}>Swaps</Typography.SmallText>
                </SortText>
                <SortText
                  onClick={() => {
                    setTxFilter(TXN_TYPE.ADD);
                  }}
                  isActive={txFilter === TXN_TYPE.ADD}
                >
                  <Typography.SmallText sx={{ letterSpacing: '0.08em' }}>Adds</Typography.SmallText>
                </SortText>
                <SortText
                  onClick={() => {
                    setTxFilter(TXN_TYPE.REMOVE);
                  }}
                  isActive={txFilter === TXN_TYPE.REMOVE}
                >
                  <Typography.SmallText sx={{ letterSpacing: '0.08em' }}>Removes</Typography.SmallText>
                </SortText>
              </>
            )}
          </Flex>
          <Flex alignItems="center" justifyContent="flexStart">
            <ClickableText
              color="textDim"
              area="value"
              onClick={() => {
                setSortedColumn(SORT_FIELD.VALUE);
                setSortDirection(sortedColumn !== SORT_FIELD.VALUE ? true : !sortDirection);
              }}
            >
              <Typography.SmallBoldText color={'text8'} sx={{ textTransform: 'uppercase' }}>
                {below680 ? 'Value' : 'Total Value'}{' '}
                {sortedColumn === SORT_FIELD.VALUE ? (!sortDirection ? '↑' : '↓') : ''}
              </Typography.SmallBoldText>
            </ClickableText>
          </Flex>
          {!below780 && (
            <Flex alignItems="center">
              <ClickableText
                area="amountToken"
                color="textDim"
                onClick={() => {
                  setSortedColumn(SORT_FIELD.AMOUNT0);
                  setSortDirection(sortedColumn !== SORT_FIELD.AMOUNT0 ? true : !sortDirection);
                }}
              >
                <Typography.SmallBoldText color={'text8'} sx={{ textTransform: 'uppercase' }}>
                  {symbol0Override ? symbol0Override + ' Amount' : 'Token Amount'}{' '}
                  {sortedColumn === SORT_FIELD.AMOUNT0 ? (sortDirection ? '↑' : '↓') : ''}
                </Typography.SmallBoldText>
              </ClickableText>
            </Flex>
          )}
          <>
            {!below780 && (
              <Flex alignItems="center">
                <ClickableText
                  area="amountOther"
                  color="textDim"
                  onClick={() => {
                    setSortedColumn(SORT_FIELD.AMOUNT1);
                    setSortDirection(sortedColumn !== SORT_FIELD.AMOUNT1 ? true : !sortDirection);
                  }}
                >
                  <Typography.SmallBoldText color={'text8'} sx={{ textTransform: 'uppercase' }}>
                    {symbol1Override ? symbol1Override + ' Amount' : 'Token Amount'}{' '}
                    {sortedColumn === SORT_FIELD.AMOUNT1 ? (sortDirection ? '↑' : '↓') : ''}
                  </Typography.SmallBoldText>
                </ClickableText>
              </Flex>
            )}
            {!below1080 && (
              <Flex alignItems="center">
                <Typography.SmallBoldText color={'text8'} sx={{ textTransform: 'uppercase' }}>
                  Account
                </Typography.SmallBoldText>
              </Flex>
            )}
            <Flex alignItems="center">
              <ClickableText
                area="time"
                color="textDim"
                onClick={() => {
                  setSortedColumn(SORT_FIELD.TIMESTAMP);
                  setSortDirection(sortedColumn !== SORT_FIELD.TIMESTAMP ? true : !sortDirection);
                }}
              >
                <Typography.SmallBoldText color={'text8'} sx={{ textTransform: 'uppercase' }}>
                  Time {sortedColumn === SORT_FIELD.TIMESTAMP ? (!sortDirection ? '↑' : '↓') : ''}
                </Typography.SmallBoldText>
              </ClickableText>
            </Flex>
          </>
        </DashGrid>
        <Divider />
        <List p={0}>
          {!filteredList ? (
            <LocalLoader />
          ) : filteredList.length === 0 ? (
            <EmptyCard>No recent transactions found.</EmptyCard>
          ) : (
            filteredList.map((item, index) => {
              return (
                <div key={index}>
                  <ListItem key={index} index={index + 1} item={item} />
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

export default TxnList;
