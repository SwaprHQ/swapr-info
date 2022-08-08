import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useState, useEffect } from 'react';
import { useMedia } from 'react-use';
import { Box, Flex, Text } from 'rebass';
import styled from 'styled-components';

import { Typography } from '../../Theme';
import { Divider } from '../../components';
import { useNativeCurrencySymbol, useNativeCurrencyWrapper } from '../../contexts/Network';
import { formattedNum, formattedPercent } from '../../utils';
import DoubleTokenLogo from '../DoubleLogo';
import FormattedName from '../FormattedName';
import { InternalListLink } from '../Link';
import LocalLoader from '../LocalLoader';
import PageButtons from '../PageButtons';
import Panel from '../Panel';
import QuestionHelper from '../QuestionHelper';

dayjs.extend(utc);

const List = styled(Box)`
  -webkit-overflow-scrolling: touch;
`;

const DashGrid = styled.div`
  display: grid;
  grid-gap: 1em;
  grid-template-columns: 100px 1fr 1fr;
  grid-template-areas: 'name vol liq';
  padding: 0 36px;

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
    grid-template-areas: 'name symbol liq vol ';

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
    grid-template-columns: 0.1fr 1.5fr 0.6fr 1fr 1fr 1fr 1fr;
    grid-template-areas: 'index name symbol liq vol price change';
  }
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

const FeeText = styled.div`
  background-color: ${({ theme }) => theme.bg8};
  border-radius: 6px;
  margin-left: 6px;
  padding: 4px 6px;
`;

const FlexText = ({ area, justifyContent, color, children }) => (
  <Flex area={area} justifyContent={justifyContent}>
    <Typography.LargeText color={color || 'text1'} sx={{ display: 'flex', alignItems: 'center' }}>
      {children}
    </Typography.LargeText>
  </Flex>
);

const SORT_FIELD = {
  LIQ: 0,
  VOL: 1,
  VOL_7DAYS: 3,
  FEES: 4,
  APY: 5,
};

const FIELD_TO_VALUE = {
  [SORT_FIELD.LIQ]: 'trackedReserveUSD', // sort with tracked volume only
  [SORT_FIELD.VOL]: 'oneDayVolumeUSD',
  [SORT_FIELD.VOL_7DAYS]: 'oneWeekVolumeUSD',
  [SORT_FIELD.FEES]: 'oneDayVolumeUSD',
};

export default function PairList({ pairs, disbaleLinks, maxItems = 10 }) {
  const below600 = useMedia('(max-width: 600px)');
  const below680 = useMedia('(max-width: 680px)');
  const below1080 = useMedia('(max-width: 1080px)');

  // pagination
  const [page, setPage] = useState(1);
  const [maxPage, setMaxPage] = useState(1);
  const ITEMS_PER_PAGE = maxItems;

  // sorting
  const [sortDirection, setSortDirection] = useState(true);
  const [sortedColumn, setSortedColumn] = useState(SORT_FIELD.LIQ);

  const nativeCurrency = useNativeCurrencySymbol();
  const nativeCurrencyWrapper = useNativeCurrencyWrapper();

  useEffect(() => {
    setMaxPage(1); // edit this to do modular
    setPage(1);
  }, [pairs]);

  useEffect(() => {
    if (pairs) {
      let extraPages = 1;
      if (Object.keys(pairs).length % ITEMS_PER_PAGE === 0) {
        extraPages = 0;
      }
      setMaxPage(Math.max(1, Math.floor(Object.keys(pairs).length / ITEMS_PER_PAGE) + extraPages));
    }
  }, [ITEMS_PER_PAGE, pairs]);

  const ListItem = ({ pairAddress, index }) => {
    const pairData = pairs[pairAddress];
    const pairSwapFeePercentage = pairData.swapFee / 10000;

    if (pairData && pairData.token0 && pairData.token1) {
      const liquidity = formattedNum(pairData.reserveUSD, true);
      const volume = formattedNum(pairData.oneDayVolumeUSD, true);
      const apy = formattedPercent(
        (pairData.oneDayVolumeUSD * pairSwapFeePercentage * 365 * 100) / pairData.reserveUSD,
      );
      return (
        <DashGrid style={{ height: '48px' }} disbaleLinks={disbaleLinks} focus={true}>
          {!below1080 && (
            <FlexText area={'index'} sx={{ marginRight: '1rem', minWidth: '16px' }}>
              {index}
            </FlexText>
          )}
          <FlexText area={'name'} justifyContent={'flex-start'}>
            <DoubleTokenLogo
              size={below600 ? 16 : 20}
              a0={pairData.token0.id}
              a1={pairData.token1.id}
              defaultText0={pairData.token0.symbol}
              defaultText1={pairData.token1.symbol}
            />
            <InternalListLink style={{ marginLeft: '16px', whiteSpace: 'nowrap' }} to={'/pair/' + pairAddress}>
              <FormattedName
                text={
                  (nativeCurrencyWrapper.symbol === pairData.token0.symbol ? nativeCurrency : pairData.token0.symbol) +
                  '-' +
                  (nativeCurrencyWrapper.symbol === pairData.token1.symbol ? nativeCurrency : pairData.token1.symbol)
                }
                maxCharacters={below600 ? 8 : 16}
                adjustSize={true}
                link={true}
              />
            </InternalListLink>
            {!below680 && (
              <FeeText>
                <Typography.SmallText color={'text6'}>{pairSwapFeePercentage * 100}%</Typography.SmallText>
              </FeeText>
            )}
          </FlexText>
          <FlexText area={'liq'}>{liquidity}</FlexText>
          <FlexText area={'vol'}>{volume}</FlexText>
          {!below680 && <FlexText area={'volWeek'}>{formattedNum(pairData.oneWeekVolumeUSD, true)}</FlexText>}
          {!below1080 && (
            <FlexText area={'fees'}>{formattedNum(pairData.oneDayVolumeUSD * pairSwapFeePercentage, true)}</FlexText>
          )}
          {!below1080 && <FlexText area={'apy'}>{apy}</FlexText>}
        </DashGrid>
      );
    } else {
      return null;
    }
  };

  const pairList =
    pairs &&
    Object.keys(pairs)
      .sort((addressA, addressB) => {
        const pairA = pairs[addressA];
        const pairB = pairs[addressB];
        if (sortedColumn === SORT_FIELD.APY) {
          const apy0 =
            parseFloat(pairA.oneDayVolumeUSD * (pairA.swapFee / 10000) * 356 * 100) / parseFloat(pairA.reserveUSD);
          const apy1 =
            parseFloat(pairB.oneDayVolumeUSD * (pairB.swapFee / 10000) * 356 * 100) / parseFloat(pairB.reserveUSD);
          return apy0 > apy1 ? (sortDirection ? -1 : 1) * 1 : (sortDirection ? -1 : 1) * -1;
        }
        return parseFloat(pairA[FIELD_TO_VALUE[sortedColumn]]) > parseFloat(pairB[FIELD_TO_VALUE[sortedColumn]])
          ? (sortDirection ? -1 : 1) * 1
          : (sortDirection ? -1 : 1) * -1;
      })
      .slice(ITEMS_PER_PAGE * (page - 1), page * ITEMS_PER_PAGE)
      .map((pairAddress, index) => {
        return (
          pairAddress && (
            <div key={index}>
              <ListItem key={index} index={(page - 1) * ITEMS_PER_PAGE + index + 1} pairAddress={pairAddress} />
              <Divider />
            </div>
          )
        );
      });

  return (
    <>
      <Panel style={{ marginTop: '6px', padding: '32px 0' }}>
        <DashGrid
          center={true}
          disbaleLinks={disbaleLinks}
          style={{ height: 'fit-content', padding: '0 36px 24px 36px' }}
        >
          {!below1080 && (
            <Typography.SmallBoldText color={'text8'} sx={{ display: 'flex', alignItems: 'center' }}>
              #
            </Typography.SmallBoldText>
          )}
          <Flex alignItems="center" sx={{ justifyContent: 'flex-start' }}>
            <Typography.SmallBoldText color={'text8'} sx={{ textTransform: 'uppercase' }}>
              Pair / Swap Fee
            </Typography.SmallBoldText>
          </Flex>
          <Flex alignItems="center" justifyContent="flexEnd">
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
          <Flex alignItems="center">
            <ClickableText
              area="vol"
              onClick={() => {
                setSortedColumn(SORT_FIELD.VOL);
                setSortDirection(sortedColumn !== SORT_FIELD.VOL ? true : !sortDirection);
              }}
            >
              <Typography.SmallBoldText color={'text8'} sx={{ textTransform: 'uppercase' }}>
                {!below680 ? 'Volume (24hrs)' : 'Volume'}
                {sortedColumn === SORT_FIELD.VOL ? (!sortDirection ? '↑' : '↓') : ''}
              </Typography.SmallBoldText>
            </ClickableText>
          </Flex>
          {!below680 && (
            <Flex alignItems="center" justifyContent="flexEnd">
              <ClickableText
                area="volWeek"
                onClick={() => {
                  setSortedColumn(SORT_FIELD.VOL_7DAYS);
                  setSortDirection(sortedColumn !== SORT_FIELD.VOL_7DAYS ? true : !sortDirection);
                }}
              >
                <Typography.SmallBoldText color={'text8'} sx={{ textTransform: 'uppercase' }}>
                  Volume (7d) {sortedColumn === SORT_FIELD.VOL_7DAYS ? (!sortDirection ? '↑' : '↓') : ''}
                </Typography.SmallBoldText>
              </ClickableText>
            </Flex>
          )}
          {!below1080 && (
            <Flex alignItems="center" justifyContent="flexEnd">
              <ClickableText
                area="fees"
                onClick={() => {
                  setSortedColumn(SORT_FIELD.FEES);
                  setSortDirection(sortedColumn !== SORT_FIELD.FEES ? true : !sortDirection);
                }}
              >
                <Typography.SmallBoldText color={'text8'} sx={{ textTransform: 'uppercase' }}>
                  Fees (24hr) {sortedColumn === SORT_FIELD.FEES ? (!sortDirection ? '↑' : '↓') : ''}
                </Typography.SmallBoldText>
              </ClickableText>
            </Flex>
          )}
          {!below1080 && (
            <Flex alignItems="center" justifyContent="flexEnd">
              <ClickableText
                area="apy"
                onClick={() => {
                  setSortedColumn(SORT_FIELD.APY);
                  setSortDirection(sortedColumn !== SORT_FIELD.APY ? true : !sortDirection);
                }}
              >
                <Typography.SmallBoldText color={'text8'} sx={{ textTransform: 'uppercase' }}>
                  1y Fees / Liquidity {sortedColumn === SORT_FIELD.APY ? (!sortDirection ? '↑' : '↓') : ''}
                </Typography.SmallBoldText>
              </ClickableText>
              <QuestionHelper text={'Based on 24hr volume annualized'} />
            </Flex>
          )}
        </DashGrid>
        <Divider />
        <List p={0}>
          {!pairList || pairList.length === 0 || Object.keys(pairs).length <= 2 ? <LocalLoader /> : pairList}
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
