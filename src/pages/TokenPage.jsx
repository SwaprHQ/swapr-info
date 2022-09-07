import { useState, useEffect, memo } from 'react';
import 'feather-icons';
import isEqual from 'react-fast-compare';
import Skeleton from 'react-loading-skeleton';
import { useMedia } from 'react-use';
import { Flex } from 'rebass';
import styled from 'styled-components';

import { Typography } from '../Theme';
import { PageWrapper, ContentWrapper } from '../components';
import { ButtonLight, ButtonDark } from '../components/ButtonStyled';
import CopyHelper from '../components/Copy';
import DailyChangeLabel from '../components/DailyValueChangeLabel';
import LabeledValue from '../components/LabeledValue';
import Link, { BasicLink, ExternalListLink } from '../components/Link';
import Loader from '../components/LocalLoader';
import PairList from '../components/PairList';
import Panel from '../components/Panel';
import { AutoRow, RowFixed } from '../components/Row';
import Search from '../components/Search';
import TokenChart from '../components/TokenChart';
import TokenLogo from '../components/TokenLogo';
import TxnList from '../components/TxnList';
import { useNativeCurrencySymbol, useNativeCurrencyWrapper, useSelectedNetwork } from '../contexts/Network';
import { useDataForList } from '../contexts/PairData';
import { useTokenData, useTokenTransactions, useTokenPairs } from '../contexts/TokenData';
import { formattedNum, formattedPercent, getExplorerLink, getPoolLink, getSwapLink, localNumber } from '../utils';

const DashboardWrapper = styled.div`
  width: 100%;
`;

const PanelWrapper = styled.div`
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: max-content;
  gap: 20px;
  display: inline-grid;
  width: 100%;
  align-items: start;

  @media screen and (max-width: 1080px) {
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

function TokenPage({ address }) {
  const {
    name,
    symbol,
    priceUSD,
    oneDayVolumeUSD,
    totalLiquidityUSD,
    volumeChangeUSD,
    oneDayVolumeUT,
    volumeChangeUT,
    priceChangeUSD,
    liquidityChangeUSD,
    oneDayTxns,
    txnChange,
  } = useTokenData(address);

  useEffect(() => {
    document.querySelector('body').scrollTo(0, 0);
  }, []);

  const allPairs = useTokenPairs(address);

  // pairs to show in pair list
  const fetchedPairsList = useDataForList(allPairs);

  // all transactions with this token
  const transactions = useTokenTransactions(address);

  // price
  const price = priceUSD || priceUSD === 0 ? formattedNum(priceUSD, true) : '';
  const priceChange = priceChangeUSD || priceChangeUSD === 0 ? formattedPercent(priceChangeUSD) : '';

  // volume
  const volume =
    (oneDayVolumeUSD || oneDayVolumeUSD === 0) &&
    formattedNum(oneDayVolumeUSD === 0 ? oneDayVolumeUT : oneDayVolumeUSD, true);

  // mark if using untracked volume
  const [usingUtVolume, setUsingUtVolume] = useState(false);
  useEffect(() => {
    setUsingUtVolume(oneDayVolumeUSD === 0 ? true : false);
  }, [oneDayVolumeUSD]);

  const volumeChange = formattedPercent(!usingUtVolume ? volumeChangeUSD : volumeChangeUT);

  // liquidity
  const liquidity = (totalLiquidityUSD || totalLiquidityUSD === 0) && formattedNum(totalLiquidityUSD, true);
  const liquidityChange = formattedPercent(liquidityChangeUSD);

  // transactions
  const txnChangeFormatted = formattedPercent(txnChange);

  const below1080 = useMedia('(max-width: 1080px)');
  const below700 = useMedia('(max-width: 710px)');

  // format for long symbol
  const LENGTH = below1080 ? 10 : 16;
  const formattedSymbol = symbol?.length > LENGTH ? symbol.slice(0, LENGTH) + '...' : symbol;

  const swaprButtonsWidth = below700 ? '100%' : 'initial';

  const selectedNetwork = useSelectedNetwork();
  const nativeCurrency = useNativeCurrencySymbol();
  const nativeCurrencyWrapper = useNativeCurrencyWrapper();

  useEffect(() => {
    window.scrollTo({
      behavior: 'smooth',
      top: 0,
    });
  }, []);

  return (
    <PageWrapper>
      <ContentWrapper>
        <Flex justifyContent={'space-between'}>
          <AutoRow align="flex-end" style={{ width: 'fit-content' }}>
            <Typography.LargeText color={'text10'} sx={{ marginRight: '4px' }}>
              <BasicLink to="/tokens">{'Tokens '}</BasicLink>
            </Typography.LargeText>
            {symbol ? (
              <ExternalListLink external={true} href={getExplorerLink(selectedNetwork, address, 'address')}>
                {'→ ' + symbol}
              </ExternalListLink>
            ) : (
              <Skeleton style={{ width: '60px' }} />
            )}
          </AutoRow>
          {!below700 && <Search small={true} />}
        </Flex>
        <DashboardWrapper>
          <Flex marginBottom={'20px'} justifyContent={below700 ? 'center' : 'space-between'}>
            <RowFixed style={{ flexWrap: 'wrap' }}>
              {!below700 && (
                <>
                  <Flex alignItems={'center'} style={{ gap: '10px', height: '34px' }}>
                    {symbol ? (
                      <>
                        <TokenLogo address={address} defaultText={symbol} size="32px" />
                        <Typography.LargeHeader color={'text10'}>{name}</Typography.LargeHeader>
                        <Typography.LargeHeader color={'text10'}>
                          {formattedSymbol ? `(${formattedSymbol})` : ''}
                        </Typography.LargeHeader>
                      </>
                    ) : (
                      <Skeleton style={{ width: '150px' }} />
                    )}
                    {price ? (
                      !below1080 && <Typography.LargeBoldText color={'text9'}>{price}</Typography.LargeBoldText>
                    ) : (
                      <Skeleton style={{ width: '120px' }} />
                    )}
                  </Flex>
                </>
              )}
            </RowFixed>
            <Flex style={{ gap: '16px', width: swaprButtonsWidth }}>
              <Link
                href={getPoolLink(selectedNetwork, nativeCurrency, nativeCurrencyWrapper, address)}
                external
                style={{ width: swaprButtonsWidth }}
              >
                <ButtonLight style={{ width: swaprButtonsWidth }}>
                  <Typography.SmallBoldText color={'bd1'} sx={{ letterSpacing: '0.08em' }}>
                    + ADD LIQUIDITY
                  </Typography.SmallBoldText>
                </ButtonLight>
              </Link>
              <Link
                href={getSwapLink(selectedNetwork, nativeCurrency, nativeCurrencyWrapper, address)}
                external
                style={{ width: swaprButtonsWidth }}
              >
                <ButtonDark style={{ width: swaprButtonsWidth }}>
                  <Typography.SmallBoldText color={'text8'} sx={{ letterSpacing: '0.08em' }}>
                    TRADE
                  </Typography.SmallBoldText>
                </ButtonDark>
              </Link>
            </Flex>
          </Flex>
          <PanelWrapper>
            {below700 && (
              <>
                <Panel>
                  <Flex style={{ gap: '10px' }}>
                    {symbol ? (
                      <TokenLogo address={address} defaultText={symbol} size="32px" />
                    ) : (
                      <Skeleton circle={true} height={'33px'} width={'33px'} />
                    )}
                    <DailyChangeLabel label={'PRICE'} value={price} dailyChange={priceChange} />
                  </Flex>
                </Panel>
              </>
            )}
            <Panel style={{ maxHeight: '205px' }}>
              <Flex flexDirection={'column'} style={{ gap: '20px' }}>
                <DailyChangeLabel
                  label={'TVL'}
                  value={liquidity}
                  dailyChange={(liquidityChangeUSD || liquidityChangeUSD === 0) && liquidityChange}
                />
                <DailyChangeLabel
                  label={'VOLUME'}
                  value={volume}
                  dailyChange={(volumeChangeUSD || volumeChangeUSD === 0) && volumeChange}
                />
                <DailyChangeLabel
                  label={'TRANSACTIONS'}
                  value={(oneDayTxns || oneDayTxns === 0) && localNumber(oneDayTxns)}
                  dailyChange={(txnChange || txnChange === 0) && txnChangeFormatted}
                />
              </Flex>
            </Panel>
            <Panel style={{ maxHeight: '205px' }}>
              <Flex flexDirection={'column'} style={{ gap: '20px' }}>
                <Flex justifyContent={'space-between'}>
                  <LabeledValue label={'SYMBOL'} value={symbol} />
                  <Link external href={getExplorerLink(selectedNetwork, address, 'token')}>
                    <ButtonDark>
                      <Typography.SmallBoldText color={'text8'} sx={{ letterSpacing: '0.08em' }}>
                        VIEW ON EXPLORER ↗
                      </Typography.SmallBoldText>
                    </ButtonDark>
                  </Link>
                </Flex>
                <LabeledValue label={'TOKEN NAME'} value={name} />
                <Flex flexDirection={'column'} style={{ gap: '8px' }}>
                  <Typography.Custom
                    color={'text7'}
                    sx={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.15em' }}
                  >
                    {'ADRESS'}
                  </Typography.Custom>
                  <Flex>
                    <Typography.LargeBoldText color={'text6'} sx={{ letterSpacing: '0.02em' }}>
                      {address.slice(0, 8) + '...' + address.slice(36, 42).toUpperCase()}
                    </Typography.LargeBoldText>
                    <CopyHelper toCopy={address} />
                  </Flex>
                </Flex>
              </Flex>
            </Panel>
            <Panel
              style={{
                gridColumn: below1080 ? '' : '2/4',
                gridRow: below1080 ? '' : '1/3',
              }}
            >
              <TokenChart address={address} base={priceUSD} />
            </Panel>
          </PanelWrapper>
          <Typography.Custom
            color={'text10'}
            sx={{
              fontSize: '20px',
              lineHeight: '24px',
              fontWeight: 400,
              marginTop: '40px',
              marginBottom: '20px',
              textAlign: below700 ? 'center' : 'left',
            }}
          >
            Top Pairs
          </Typography.Custom>
          {!!(address && fetchedPairsList) ? (
            <PairList address={address} pairs={fetchedPairsList} />
          ) : (
            <Panel style={{ marginTop: '6px', padding: '32px 0' }}>
              <Loader />
            </Panel>
          )}
          <Typography.Custom
            color={'text10'}
            sx={{
              fontSize: '20px',
              lineHeight: '24px',
              fontWeight: 400,
              marginTop: '40px',
              marginBottom: '20px',
              textAlign: below700 ? 'center' : 'left',
            }}
          >
            Transactions
          </Typography.Custom>
          {transactions ? (
            <TxnList transactions={transactions} />
          ) : (
            <Panel rounded>
              <Loader />
            </Panel>
          )}
        </DashboardWrapper>
      </ContentWrapper>
    </PageWrapper>
  );
}

export default memo(TokenPage, isEqual);
