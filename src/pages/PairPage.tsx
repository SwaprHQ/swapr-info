import 'feather-icons';
import { transparentize } from 'polished';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useMedia } from 'react-use';
import styled from 'styled-components';

import { ThemedBackground, TYPE } from '../Theme';
import { Hover, ContentWrapperLarge, PageWrapper } from '../components';
import { ButtonDark, ButtonLight } from '../components/ButtonStyled';
import Column, { AutoColumn } from '../components/Column';
import CopyHelper from '../components/Copy';
import DoubleTokenLogo from '../components/DoubleLogo';
import FormattedName from '../components/FormattedName';
import Link, { BasicLink } from '../components/Link';
import Loader from '../components/LocalLoader';
import PairChart from '../components/PairChart';
import Panel from '../components/Panel';
import { AutoRow, RowBetween, RowFixed } from '../components/Row';
import Search from '../components/Search';
import TokenLogo from '../components/TokenLogo';
import TxnList from '../components/TxnList';
import { useNativeCurrencyPrice } from '../contexts/GlobalData';
import { useNativeCurrencySymbol, useNativeCurrencyWrapper, useSelectedNetwork } from '../contexts/Network';
import { usePairChartData, usePairData, usePairTransactions } from '../contexts/PairData';
import { useColor } from '../hooks';
import { formattedNum, formattedPercent, getExplorerLink, getPoolLink, getSwapLink } from '../utils';

const DashboardWrapper = styled.div`
  width: 100%;
`;

const PanelWrapper = styled.div`
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: max-content;
  gap: 6px;
  display: inline-grid;
  width: 100%;
  align-items: start;
  @media screen and (max-width: 1024px) {
    grid-template-columns: 1fr;
    align-items: stretch;
    > * {
      grid-column: 1 / 4;
    }

    > * {
      &:first-child {
        width: 100%;
      }
    }
  }
`;

const TokenDetailsLayout = styled.div`
  display: inline-grid;
  width: 100%;
  grid-template-columns: auto auto auto auto auto 1fr;
  column-gap: 60px;
  align-items: start;

  &:last-child {
    align-items: center;
    justify-items: end;
  }
  @media screen and (max-width: 1024px) {
    grid-template-columns: 1fr;
    align-items: stretch;
    > * {
      grid-column: 1 / 5;
      margin-bottom: 1rem;
    }

    &:last-child {
      align-items: start;
      justify-items: start;
    }
  }
`;

const FixedPanel = styled(Panel)`
  width: fit-content;
  padding: 8px 12px;
  border-radius: 10px;

  :hover {
    cursor: pointer;
    background-color: ${({ theme }) => theme.bg2};
  }
`;

const HoverSpan = styled.span`
  :hover {
    cursor: pointer;
    opacity: 0.7;
  }
`;

interface PairPageProps {
  pairAddress: string;
}

export default function PairPage({ pairAddress }: PairPageProps) {
  const {
    token0,
    token1,
    reserve0,
    reserve1,
    reserveUSD,
    trackedReserveUSD,
    oneDayVolumeUSD,
    volumeChangeUSD,
    oneDayVolumeUntracked,
    volumeChangeUntracked,
    liquidityChangeUSD,
    swapFee: pairSwapFeeBips,
  } = usePairData(pairAddress);

  const history = useHistory();

  useEffect(() => {
    document.querySelector('body').scrollTo(0, 0);
  }, []);

  const transactions = usePairTransactions(pairAddress);

  const backgroundColor = useColor(pairAddress);

  // liquidity
  const liquidity = trackedReserveUSD
    ? formattedNum(trackedReserveUSD, true)
    : reserveUSD
    ? formattedNum(reserveUSD, true)
    : '-';
  const liquidityChange = formattedPercent(liquidityChangeUSD);

  // mark if using untracked liquidity
  const [usingTracked, setUsingTracked] = useState(true);
  useEffect(() => {
    setUsingTracked(!trackedReserveUSD ? false : true);
  }, [trackedReserveUSD]);

  // volume	  // volume
  const volume =
    oneDayVolumeUSD || oneDayVolumeUSD === 0
      ? formattedNum(oneDayVolumeUSD === 0 ? oneDayVolumeUntracked : oneDayVolumeUSD, true)
      : oneDayVolumeUSD === 0
      ? '$0'
      : '-';

  // mark if using untracked volume
  const [usingUtVolume, setUsingUtVolume] = useState(false);
  useEffect(() => {
    setUsingUtVolume(oneDayVolumeUSD === 0 ? true : false);
  }, [oneDayVolumeUSD]);

  const volumeChange = formattedPercent(!usingUtVolume ? volumeChangeUSD : volumeChangeUntracked);

  // utilization
  const chartData = usePairChartData(pairAddress);
  const interval = 7; // so 1 week; set to 1 for one day
  let utilization = 0;
  let prevUtilization = 0;
  if (chartData && chartData.length >= interval) {
    utilization =
      chartData
        .slice(chartData.length - interval)
        .map((e) => e?.utilization)
        .reduce((cum, cur) => cum + cur, 0) / interval;
    if (chartData.length >= 2 * interval) {
      prevUtilization =
        chartData
          .slice(chartData.length - 2 * interval, chartData.length - interval)
          .map((e) => e?.utilization)
          .reduce((cum, cur) => cum + cur, 0) / interval;
    }
  }
  const utilizationChange = formattedPercent(
    prevUtilization === 0 ? 0 : ((utilization - prevUtilization) / prevUtilization) * 100,
  );

  // get fees	  // get fees
  const fees =
    oneDayVolumeUSD || oneDayVolumeUSD === 0
      ? usingUtVolume
        ? formattedNum(oneDayVolumeUntracked * (pairSwapFeeBips / 10000), true)
        : formattedNum(oneDayVolumeUSD * (pairSwapFeeBips / 10000), true)
      : '-';

  // token data for usd
  const [nativeCurrencyPrice] = useNativeCurrencyPrice();
  const token0USD =
    token0?.derivedNativeCurrency && nativeCurrencyPrice
      ? formattedNum(parseFloat(token0.derivedNativeCurrency) * parseFloat(nativeCurrencyPrice), true)
      : '';

  const token1USD =
    token1?.derivedNativeCurrency && nativeCurrencyPrice
      ? formattedNum(parseFloat(token1.derivedNativeCurrency) * parseFloat(nativeCurrencyPrice), true)
      : '';

  const selectedNetwork = useSelectedNetwork();
  const nativeCurrency = useNativeCurrencySymbol();
  const nativeCurrencyWrapper = useNativeCurrencyWrapper();

  // rates
  const token0Rate = reserve0 && reserve1 ? formattedNum(reserve1 / reserve0) : '-';
  const token1Rate = reserve0 && reserve1 ? formattedNum(reserve0 / reserve1) : '-';

  // formatted symbols for overflow
  const formattedSymbol0 = token0?.symbol.length > 6 ? token0?.symbol.slice(0, 5) + '...' : token0?.symbol;
  const formattedSymbol1 = token1?.symbol.length > 6 ? token1?.symbol.slice(0, 5) + '...' : token1?.symbol;

  const below1080 = useMedia('(max-width: 1080px)');
  const below900 = useMedia('(max-width: 900px)');
  const below600 = useMedia('(max-width: 600px)');

  useEffect(() => {
    window.scrollTo({
      behavior: 'smooth',
      top: 0,
    });
  }, []);

  // const [savedPairs, addPair] = useSavedPairs();

  return (
    <PageWrapper>
      <ThemedBackground backgroundColor={transparentize(0.6, backgroundColor)} />
      <span />
      <ContentWrapperLarge>
        <RowBetween>
          <TYPE.body>
            <BasicLink to="/pairs">{'Pairs '}</BasicLink>→ {token0?.symbol}-{token1?.symbol}
          </TYPE.body>
          {!below600 && <Search small={true} />}
        </RowBetween>
        <DashboardWrapper>
          <AutoColumn gap="40px" style={{ marginBottom: '1.5rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                width: '100%',
              }}
            >
              <RowFixed style={{ flexWrap: 'wrap', minWidth: '100px' }}>
                <RowFixed>
                  {token0 && token1 && (
                    <DoubleTokenLogo
                      a0={token0?.id || ''}
                      a1={token1?.id || ''}
                      defaultText0={token0?.symbol}
                      defaultText1={token1?.symbol}
                      size={32}
                      margin={true}
                    />
                  )}{' '}
                  <TYPE.main fontSize={below1080 ? '1.5rem' : '2rem'} style={{ margin: '0 1rem' }}>
                    {token0 && token1 ? (
                      <>
                        <HoverSpan onClick={() => history.push(`/token/${token0?.id}`)}>
                          {token0.symbol === nativeCurrencyWrapper.symbol ? nativeCurrency : token0.symbol}
                        </HoverSpan>
                        <span>-</span>
                        <HoverSpan onClick={() => history.push(`/token/${token1?.id}`)}>
                          {token1.symbol === nativeCurrencyWrapper.symbol ? nativeCurrency : token1.symbol}
                        </HoverSpan>{' '}
                        Pair
                      </>
                    ) : (
                      ''
                    )}
                  </TYPE.main>
                </RowFixed>
              </RowFixed>
              <RowFixed
                ml={below900 ? '0' : '2.5rem'}
                mt={below1080 && '1rem'}
                style={{
                  flexDirection: below1080 ? 'row-reverse' : 'initial',
                }}
              >
                {/* {!!!savedPairs[pairAddress] && !below1080 ? (
                  <Hover
                    onClick={() =>
                      addPair(
                        pairAddress,
                        token0.id,
                        token1.id,
                        token0.symbol,
                        token1.symbol
                      )
                    }
                  >
                    <StyledIcon>
                      <PlusCircle style={{ marginRight: "0.5rem" }} />
                    </StyledIcon>
                  </Hover>
                ) : !below1080 ? (
                  <StyledIcon>
                    <Bookmark style={{ marginRight: "0.5rem", opacity: 0.4 }} />
                  </StyledIcon>
                ) : (
                  <></>
                )} */}

                {/* TODO: reenable button when cross-chain links are a thing */}
                <Link
                  external
                  href={getPoolLink(selectedNetwork, nativeCurrency, nativeCurrencyWrapper, token0?.id, token1?.id)}
                >
                  <ButtonLight color={backgroundColor}>+ Add Liquidity</ButtonLight>
                </Link>
                <Link
                  external
                  href={getSwapLink(selectedNetwork, nativeCurrency, nativeCurrencyWrapper, token0?.id, token1?.id)}
                >
                  <ButtonDark ml={!below1080 && '.5rem'} mr={below1080 && '.5rem'} color={backgroundColor}>
                    Trade
                  </ButtonDark>
                </Link>
              </RowFixed>
            </div>
          </AutoColumn>
          <AutoRow
            gap="6px"
            style={{
              width: 'fit-content',
              marginTop: below900 ? '1rem' : '0',
              marginBottom: below900 ? '0' : '2rem',
              flexWrap: 'wrap',
            }}
          >
            <FixedPanel onClick={() => history.push(`/token/${token0?.id}`)}>
              <RowFixed>
                <TokenLogo address={token0?.id} defaultText={token0?.symbol} size={'16px'} />
                <TYPE.main fontSize={'16px'} lineHeight={1} fontWeight={500} ml={'4px'}>
                  {token0 && token1
                    ? `1 ${formattedSymbol0} = ${token0Rate} ${formattedSymbol1} ${
                        parseFloat(token0?.derivedNativeCurrency) ? '(' + token0USD + ')' : ''
                      }`
                    : '-'}
                </TYPE.main>
              </RowFixed>
            </FixedPanel>
            <FixedPanel onClick={() => history.push(`/token/${token1?.id}`)}>
              <RowFixed>
                <TokenLogo address={token1?.id} defaultText={token1?.symbol} size={'16px'} />
                <TYPE.main fontSize={'16px'} lineHeight={1} fontWeight={500} ml={'4px'}>
                  {token0 && token1
                    ? `1 ${formattedSymbol1} = ${token1Rate} ${formattedSymbol0}  ${
                        parseFloat(token1?.derivedNativeCurrency) ? '(' + token1USD + ')' : ''
                      }`
                    : '-'}
                </TYPE.main>
              </RowFixed>
            </FixedPanel>
          </AutoRow>
          <>
            {!below1080 && <TYPE.main fontSize={'1.125rem'}>Pair Stats</TYPE.main>}
            <PanelWrapper style={{ marginTop: '1.5rem' }}>
              <Panel style={{ height: '100%' }}>
                <AutoColumn gap="20px">
                  <RowBetween>
                    <TYPE.main>Total Liquidity {!usingTracked ? '(Untracked)' : ''}</TYPE.main>
                    <div />
                  </RowBetween>
                  <RowBetween align="flex-end">
                    <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={500}>
                      {liquidity}
                    </TYPE.main>
                    <TYPE.main>{liquidityChange}</TYPE.main>
                  </RowBetween>
                </AutoColumn>
              </Panel>
              <Panel style={{ height: '100%' }}>
                <AutoColumn gap="20px">
                  <RowBetween>
                    <TYPE.main>Volume (24hrs) {usingUtVolume && '(Untracked)'}</TYPE.main>
                    <div />
                  </RowBetween>
                  <RowBetween align="flex-end">
                    <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={500}>
                      {volume}
                    </TYPE.main>
                    <TYPE.main>{volumeChange}</TYPE.main>
                  </RowBetween>
                </AutoColumn>
              </Panel>
              <Panel style={{ height: '100%' }}>
                <AutoColumn gap="20px">
                  <RowBetween>
                    <TYPE.main>Average Utilization (7d)</TYPE.main>
                    <div />
                  </RowBetween>
                  <RowBetween align="flex-end">
                    <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={500}>
                      {formattedNum(utilization) + '%'}
                    </TYPE.main>
                    <TYPE.main>{utilizationChange}</TYPE.main>
                  </RowBetween>
                </AutoColumn>
              </Panel>
              <Panel style={{ height: '100%' }}>
                <AutoColumn gap="20px">
                  <RowBetween>
                    <TYPE.main>Fees (24hrs)</TYPE.main>
                    <div />
                  </RowBetween>
                  <RowBetween align="flex-end">
                    <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={500}>
                      {fees}
                    </TYPE.main>
                    <TYPE.main>{volumeChange}</TYPE.main>
                  </RowBetween>
                </AutoColumn>
              </Panel>

              <Panel style={{ height: '100%' }}>
                <AutoColumn gap="20px">
                  <RowBetween>
                    <TYPE.main>Pooled Tokens</TYPE.main>
                    <div />
                  </RowBetween>
                  <Hover onClick={() => history.push(`/token/${token0?.id}`)} fade={true}>
                    <AutoRow gap="4px">
                      <TokenLogo defaultText={token0?.symbol} address={token0?.id} />
                      <TYPE.main fontSize={20} lineHeight={1} fontWeight={500}>
                        <RowFixed>
                          {reserve0 ? formattedNum(reserve0) : ''}{' '}
                          <FormattedName text={token0?.symbol ?? ''} maxCharacters={8} margin={true} />
                        </RowFixed>
                      </TYPE.main>
                    </AutoRow>
                  </Hover>
                  <Hover onClick={() => history.push(`/token/${token1?.id}`)} fade={true}>
                    <AutoRow gap="4px">
                      <TokenLogo defaultText={token1?.symbol} address={token1?.id} />
                      <TYPE.main fontSize={20} lineHeight={1} fontWeight={500}>
                        <RowFixed>
                          {reserve1 ? formattedNum(reserve1) : ''}{' '}
                          <FormattedName text={token1?.symbol ?? ''} maxCharacters={8} margin={true} />
                        </RowFixed>
                      </TYPE.main>
                    </AutoRow>
                  </Hover>
                </AutoColumn>
              </Panel>
              <Panel
                style={{
                  gridColumn: below1080 ? undefined : '2/4',
                  gridRow: below1080 ? undefined : '1/5',
                }}
              >
                <PairChart
                  address={pairAddress}
                  color={backgroundColor}
                  base0={reserve1 / reserve0}
                  base1={reserve0 / reserve1}
                />
              </Panel>
            </PanelWrapper>
            <TYPE.main fontSize={'1.125rem'} style={{ marginTop: '3rem' }}>
              Transactions
            </TYPE.main>{' '}
            <Panel
              style={{
                marginTop: '1.5rem',
              }}
            >
              {transactions ? <TxnList transactions={transactions} /> : <Loader />}
            </Panel>
            <RowBetween style={{ marginTop: '3rem' }}>
              <TYPE.main fontSize={'1.125rem'}>Pair Information</TYPE.main>{' '}
            </RowBetween>
            <Panel
              rounded
              style={{
                marginTop: '1.5rem',
              }}
              p={20}
            >
              <TokenDetailsLayout>
                <Column style={{ height: '100%', justifyContent: 'space-between' }}>
                  <TYPE.main>Pair Name</TYPE.main>
                  <AutoRow align="flex-end">
                    <TYPE.main style={{ marginTop: '.5rem' }}>
                      <AutoRow>
                        <FormattedName text={token0?.symbol ?? ''} maxCharacters={8} />
                        -
                        <FormattedName text={token1?.symbol ?? ''} maxCharacters={8} />
                      </AutoRow>
                    </TYPE.main>
                  </AutoRow>
                </Column>
                <Column style={{ height: '100%', justifyContent: 'space-between' }}>
                  <TYPE.main>Swap fee</TYPE.main>
                  <AutoRow align="flex-end">
                    <TYPE.main style={{ marginTop: '.5rem' }}>
                      <AutoRow>{pairSwapFeeBips / 100}%</AutoRow>
                    </TYPE.main>
                  </AutoRow>
                </Column>
                <Column>
                  <TYPE.main>Pair Address</TYPE.main>
                  <AutoRow align="flex-end">
                    <TYPE.main style={{ marginTop: '.5rem' }}>
                      {pairAddress.slice(0, 6) + '...' + pairAddress.slice(38, 42)}
                    </TYPE.main>
                    <CopyHelper toCopy={pairAddress} />
                  </AutoRow>
                </Column>
                <Column>
                  <TYPE.main>
                    <RowFixed>
                      <FormattedName text={token0?.symbol ?? ''} maxCharacters={8} />{' '}
                      <span style={{ marginLeft: '4px' }}>Address</span>
                    </RowFixed>
                  </TYPE.main>
                  <AutoRow align="flex-end">
                    <TYPE.main style={{ marginTop: '.5rem' }}>
                      {token0 && token0.id.slice(0, 6) + '...' + token0.id.slice(38, 42)}
                    </TYPE.main>
                    <CopyHelper toCopy={token0?.id} />
                  </AutoRow>
                </Column>
                <Column>
                  <TYPE.main>
                    <RowFixed>
                      <FormattedName text={token1?.symbol ?? ''} maxCharacters={8} />{' '}
                      <span style={{ marginLeft: '4px' }}>Address</span>
                    </RowFixed>
                  </TYPE.main>
                  <AutoRow align="flex-end">
                    <TYPE.main style={{ marginTop: '.5rem' }} fontSize={16}>
                      {token1 && token1.id.slice(0, 6) + '...' + token1.id.slice(38, 42)}
                    </TYPE.main>
                    <CopyHelper toCopy={token1?.id} />
                  </AutoRow>
                </Column>
                <ButtonLight color={backgroundColor}>
                  <Link color={backgroundColor} external href={getExplorerLink(selectedNetwork, pairAddress, 'token')}>
                    View on block explorer ↗
                  </Link>
                </ButtonLight>
              </TokenDetailsLayout>
            </Panel>
          </>
        </DashboardWrapper>
      </ContentWrapperLarge>
    </PageWrapper>
  );
}
