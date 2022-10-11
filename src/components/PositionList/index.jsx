import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useState, useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import { useMedia } from 'react-use';
import { Box, Flex, Text } from 'rebass';
import styled from 'styled-components';

import { Typography } from '../../Theme';
import { Divider } from '../../components';
import { useNativeCurrencyPrice } from '../../contexts/GlobalData';
import { useNativeCurrencySymbol, useNativeCurrencyWrapper, useSelectedNetwork } from '../../contexts/Network';
import { formatDollarAmount, formattedNum, getPoolLink } from '../../utils';
import { ButtonDark } from '../ButtonStyled';
import DoubleTokenLogo from '../DoubleLogo';
import FormattedName from '../FormattedName';
import Link, { InternalListLink } from '../Link';
import LocalLoader from '../LocalLoader';
import PageButtons from '../PageButtons';
import Panel from '../Panel';
import TokenLogo from '../TokenLogo';

dayjs.extend(utc);

const List = styled(Box)`
  -webkit-overflow-scrolling: touch;
`;

const DashGrid = styled.div`
  display: grid;
  grid-gap: 1em;
  grid-template-columns: 2.5fr 1fr;
  grid-template-areas: 'name swapr';
  align-items: center;
  padding: 0 20px;

  @media screen and (min-width: 500px) {
    padding: 0 36px;
    grid-template-columns: 2.5fr 1fr 1fr;
    grid-template-areas: 'name swapr return';
  }

  @media screen and (min-width: 600px) {
    padding: 0 36px;
    grid-template-columns: 35px 1.2fr 1fr 1fr;
    grid-template-areas: 'number name swapr return';
  }

  @media screen and (min-width: 800px) {
    padding: 0 36px;
    grid-template-columns: 35px 2.5fr 1fr 1fr;
    grid-template-areas: 'number name swapr return';
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

const SORT_FIELD = {
  VALUE: 'VALUE',
  SWAPR_RETURN: 'SWAPR_RETURN',
};

function PositionList({ positions }) {
  const isBelow500px = useMedia('(max-width: 500px)');
  const isBelow600px = useMedia('(max-width: 600px)');
  const isBelow800px = useMedia('(max-width: 800px)');

  // pagination
  const [page, setPage] = useState(1);
  const [maxPage, setMaxPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // sorting
  const [sortDirection, setSortDirection] = useState(true);
  const [sortedColumn, setSortedColumn] = useState(SORT_FIELD.VALUE);

  const selectedNetwork = useSelectedNetwork();
  const nativeCurrency = useNativeCurrencySymbol();
  const nativeCurrencyWrapper = useNativeCurrencyWrapper();

  useEffect(() => {
    setMaxPage(1); // edit this to do modular
    setPage(1);
  }, [positions]);

  useEffect(() => {
    if (positions) {
      let extraPages = 1;
      if (positions.length % ITEMS_PER_PAGE === 0) {
        extraPages = 0;
      }
      setMaxPage(Math.floor(positions.length / ITEMS_PER_PAGE) + extraPages || 1);
    }
  }, [positions]);

  const [nativeCurrencyPrice] = useNativeCurrencyPrice();

  const ListItem = ({ position, index }) => {
    const poolOwnership = position.liquidityTokenBalance / position.pair.totalSupply;
    const valueUSD = poolOwnership * position.pair.reserveUSD;

    return (
      <DashGrid style={{ height: '82px' }} focus={true}>
        {!isBelow600px && <Typography.LargeText color={'text1'}>{index}</Typography.LargeText>}
        <Flex alignItems={'center'} style={{ gap: '24px' }}>
          <Flex alignItems={'center'} style={{ gap: '8px' }}>
            <DoubleTokenLogo
              size={20}
              a0={position.pair.token0.id}
              a1={position.pair.token1.id}
              defaultText0={position.pair.token0.symbol}
              defaultText1={position.pair.token1.symbol}
            />
            <InternalListLink to={'/pair/' + position.pair.id}>
              <FormattedName
                text={position.pair.token0.symbol + '-' + position.pair.token1.symbol}
                maxCharacters={isBelow600px ? 10 : 18}
              />
            </InternalListLink>
          </Flex>
          {!isBelow800px && (
            <Flex style={{ gap: '8px' }}>
              <Link
                external
                href={getPoolLink(
                  selectedNetwork,
                  nativeCurrency,
                  nativeCurrencyWrapper,
                  position.pair.token0.id,
                  position.pair.token1.id,
                )}
              >
                <ButtonDark style={{ width: '76px', minWidth: '76px' }}>
                  <Typography.SmallBoldText color={'text8'} sx={{ letterSpacing: '0.08em' }}>
                    ADD
                  </Typography.SmallBoldText>
                </ButtonDark>
              </Link>
              {poolOwnership > 0 && (
                <Link
                  external
                  href={getPoolLink(
                    selectedNetwork,
                    nativeCurrency,
                    nativeCurrencyWrapper,
                    position.pair.token0.id,
                    position.pair.token1.id,
                    true,
                  )}
                >
                  <ButtonDark style={{ width: '76px', minWidth: '76px' }}>
                    <Typography.SmallBoldText color={'text8'} sx={{ letterSpacing: '0.08em' }}>
                      REMOVE
                    </Typography.SmallBoldText>
                  </ButtonDark>
                </Link>
              )}
            </Flex>
          )}
        </Flex>
        <Flex alignItems={'flex-end'} flexDirection={'column'} style={{ gap: '8px' }}>
          <Typography.LargeText color={'text1'} sx={{ display: 'flex' }}>
            {formatDollarAmount(valueUSD, isBelow500px ? 2 : 0, isBelow500px)}
          </Typography.LargeText>
          <Flex flexDirection={'column'} style={{ gap: '6px' }}>
            <Flex justifyContent={'flex-end'} alignItems={'center'} style={{ gap: '4px' }}>
              <Typography.Text color={'text2'}>
                {formattedNum(poolOwnership * parseFloat(position.pair.reserve0))}
              </Typography.Text>
              <TokenLogo address={position.pair.token0.id} size={'14px'} />
            </Flex>
            <Flex justifyContent={'flex-end'} alignItems={'center'} style={{ gap: '4px' }}>
              <Typography.Text color={'text2'}>
                {formattedNum(poolOwnership * parseFloat(position.pair.reserve1))}
              </Typography.Text>
              <TokenLogo address={position.pair.token1.id} size={'14px'} />
            </Flex>
          </Flex>
        </Flex>
        {!isBelow500px && (
          <Flex alignItems={'flex-end'} flexDirection={'column'} style={{ gap: '8px' }}>
            <Typography.LargeText color={position?.fees.sum > 0 ? 'green1' : 'red1'}>
              {formattedNum(position?.fees.sum, true, true)}
            </Typography.LargeText>
            <Flex flexDirection={'column'} style={{ gap: '6px' }}>
              <Flex justifyContent={'flex-end'} alignItems={'center'} style={{ gap: '4px' }}>
                <Typography.Text color={'text2'}>
                  {parseFloat(position.pair.token0.derivedNativeCurrency)
                    ? formattedNum(
                        position?.fees.sum /
                          (parseFloat(position.pair.token0.derivedNativeCurrency) * nativeCurrencyPrice) /
                          2,
                        false,
                        true,
                      )
                    : 0}
                </Typography.Text>
                <TokenLogo address={position.pair.token0.id} size={'14px'} />
              </Flex>
              <Flex justifyContent={'flex-end'} alignItems={'center'} style={{ gap: '4px' }}>
                <Typography.Text color={'text2'}>
                  {parseFloat(position.pair.token1.derivedNativeCurrency)
                    ? formattedNum(
                        position?.fees.sum /
                          (parseFloat(position.pair.token1.derivedNativeCurrency) * nativeCurrencyPrice) /
                          2,
                        false,
                        true,
                      )
                    : 0}
                </Typography.Text>
                <TokenLogo address={position.pair.token1.id} size={'14px'} />
              </Flex>
            </Flex>
          </Flex>
        )}
      </DashGrid>
    );
  };

  const positionsSorted =
    positions &&
    positions
      .sort((p0, p1) => {
        if (sortedColumn === SORT_FIELD.PRINCIPAL) {
          return p0?.principal?.usd > p1?.principal?.usd ? (sortDirection ? -1 : 1) : sortDirection ? 1 : -1;
        }
        if (sortedColumn === SORT_FIELD.HODL) {
          return p0?.hodl?.sum > p1?.hodl?.sum ? (sortDirection ? -1 : 1) : sortDirection ? 1 : -1;
        }
        if (sortedColumn === SORT_FIELD.SWAPR_RETURN) {
          return p0?.swapr?.return > p1?.swapr?.return ? (sortDirection ? -1 : 1) : sortDirection ? 1 : -1;
        }
        if (sortedColumn === SORT_FIELD.VALUE) {
          const bal0 = (p0.liquidityTokenBalance / p0.pair.totalSupply) * p0.pair.reserveUSD;
          const bal1 = (p1.liquidityTokenBalance / p1.pair.totalSupply) * p1.pair.reserveUSD;
          return bal0 > bal1 ? (sortDirection ? -1 : 1) : sortDirection ? 1 : -1;
        }
        return 1;
      })
      .slice(ITEMS_PER_PAGE * (page - 1), page * ITEMS_PER_PAGE)
      .map((position, index) => {
        return (
          <div key={index}>
            <ListItem key={index} index={(page - 1) * 10 + index + 1} position={position} />
            <Divider />
          </div>
        );
      });

  return (
    <>
      <Panel style={{ padding: isBelow600px ? '20px 0' : '32px 0' }}>
        <DashGrid
          center={true}
          style={{ height: 'fit-content', padding: isBelow500px ? '0 20px 24px 20px' : '0 36px 24px 36px' }}
        >
          {!isBelow600px && (
            <Flex alignItems={'flex-start'} justifyContent={'flexStart'}>
              <Typography.SmallBoldText color={'text8'} sx={{ display: 'flex', alignItems: 'center' }}>
                #
              </Typography.SmallBoldText>
            </Flex>
          )}
          <Flex justifyContent={'flex-start'}>
            <Typography.SmallBoldText color={'text8'} sx={{ display: 'flex', alignItems: 'center' }}>
              NAME
            </Typography.SmallBoldText>
          </Flex>
          <Flex alignItems={'center'} justifyContent={'flex-end'}>
            <ClickableText
              area={'swapr'}
              onClick={() => {
                setSortedColumn(SORT_FIELD.VALUE);
                setSortDirection(sortedColumn !== SORT_FIELD.VALUE ? true : !sortDirection);
              }}
            >
              <Typography.SmallBoldText color={'text8'} sx={{ display: 'flex', alignItems: 'center' }}>
                LIQUIDITY {sortedColumn === SORT_FIELD.VALUE ? (!sortDirection ? '↑' : '↓') : ''}
              </Typography.SmallBoldText>
            </ClickableText>
          </Flex>
          {!isBelow500px && (
            <Flex alignItems={'center'} justifyContent={'flex-end'}>
              <ClickableText
                area={'return'}
                onClick={() => {
                  setSortedColumn(SORT_FIELD.SWAPR_RETURN);
                  setSortDirection(sortedColumn !== SORT_FIELD.SWAPR_RETURN ? true : !sortDirection);
                }}
              >
                <Typography.SmallBoldText color={'text8'} sx={{ display: 'flex', alignItems: 'center' }}>
                  {isBelow600px ? 'FEES' : 'TOTAL FEES EARNED'}{' '}
                  {sortedColumn === SORT_FIELD.SWAPR_RETURN ? (!sortDirection ? '↑' : '↓') : ''}
                </Typography.SmallBoldText>
              </ClickableText>
            </Flex>
          )}
        </DashGrid>
        <Divider />
        <List p={0}>{!positionsSorted ? <LocalLoader /> : positionsSorted}</List>
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

export default withRouter(PositionList);
