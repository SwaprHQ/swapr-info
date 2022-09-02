import dayjs from 'dayjs';
import { useEffect } from 'react';
import Skeleton from 'react-loading-skeleton';
import { withRouter } from 'react-router-dom';
import { useMedia } from 'react-use';
import { Flex } from 'rebass';
import styled from 'styled-components';

import { Typography } from '../Theme';
import { ContentWrapper, PageWrapper } from '../components';
import { ButtonDark, ButtonLight } from '../components/ButtonStyled';
import CopyHelper from '../components/Copy';
import DailyChangeLabel from '../components/DailyValueChangeLabel';
import LabeledValue from '../components/LabeledValue';
import Link, { BasicLink, ExternalListLink } from '../components/Link';
import LiquidityMiningCampaingCardList from '../components/LiquidityMiningCampaingCardList';
import Loader from '../components/LocalLoader';
import PairChart from '../components/PairChart';
import Panel from '../components/Panel';
import Search from '../components/Search';
import TokenLogo from '../components/TokenLogo';
import TxnList from '../components/TxnList';
import { useNativeCurrencyPrice } from '../contexts/GlobalData';
import { useNativeCurrencySymbol, useNativeCurrencyWrapper, useSelectedNetwork } from '../contexts/Network';
import {
  useLiquidityMiningCampaignsForPair,
  usePairChartData,
  usePairData,
  usePairTransactions,
} from '../contexts/PairData';
import { formattedNum, formattedPercent, getExplorerLink, getPoolLink, getSwapLink } from '../utils';

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

const FixedPanel = styled(Panel)`
  width: fit-content;
  padding: 8px 12px;
  border-radius: 10px;

  :hover {
    cursor: pointer;
    opacity: 0.6;
  }
`;

function PairPage({ pairAddress, history }) {
  const selectedNetwork = useSelectedNetwork();
  const nativeCurrency = useNativeCurrencySymbol();
  const nativeCurrencyWrapper = useNativeCurrencyWrapper();
  const [nativeCurrencyPrice] = useNativeCurrencyPrice();
  const transactions = usePairTransactions(pairAddress);
  const chartData = usePairChartData(pairAddress);
  const {
    token0,
    token1,
    reserve0,
    reserve1,
    reserveUSD,
    oneDayVolumeUSD,
    volumeChangeUSD,
    oneDayVolumeUntracked,
    liquidityChangeUSD,
    swapFee: pairSwapFeeBips,
  } = usePairData(pairAddress);

  // get campaings in the last 7 days
  const liquidityMiningCampaings = useLiquidityMiningCampaignsForPair(
    pairAddress,
    dayjs.utc().subtract(1, 'week').unix(),
  );

  useEffect(() => {
    document.querySelector('body').scrollTo(0, 0);
  }, []);

  // liquidity
  const liquidity = (reserveUSD || reserveUSD === 0) && formattedNum(reserveUSD, true);
  const liquidityChange = formattedPercent(liquidityChangeUSD);

  // volume
  const volume =
    oneDayVolumeUSD || oneDayVolumeUSD === 0
      ? formattedNum(oneDayVolumeUSD, true)
      : formattedNum(oneDayVolumeUntracked);
  const volumeChange = formattedPercent(volumeChangeUSD);

  // utilization
  const daysInterval = 1;
  let utilization = null;
  let prevUtilization = null;

  if (chartData && chartData.length >= daysInterval) {
    utilization =
      chartData
        .slice(chartData.length - daysInterval)
        .map((e) => e?.utilization)
        .reduce((cum, cur) => cum + cur, 0) / daysInterval;

    if (chartData.length >= 2 * daysInterval) {
      prevUtilization =
        chartData
          .slice(chartData.length - 2 * daysInterval, chartData.length - daysInterval)
          .map((e) => e?.utilization)
          .reduce((cum, cur) => cum + cur, 0) / daysInterval;
    }
  }

  const formattedUtilization = (utilization || utilization === 0) && formattedNum(utilization) + '%';
  const utilizationChange =
    (utilization || utilization === 0) &&
    formattedPercent(prevUtilization === 0 ? 0 : ((utilization - prevUtilization) / prevUtilization) * 100);

  // fees
  const fees = oneDayVolumeUSD * (pairSwapFeeBips / 10000);

  // token data for usd
  const token0USD =
    token0?.derivedNativeCurrency && nativeCurrencyPrice
      ? formattedNum(parseFloat(token0.derivedNativeCurrency) * parseFloat(nativeCurrencyPrice), true)
      : '';

  const token1USD =
    token1?.derivedNativeCurrency && nativeCurrencyPrice
      ? formattedNum(parseFloat(token1.derivedNativeCurrency) * parseFloat(nativeCurrencyPrice), true)
      : '';

  // rates
  const token0Rate = reserve0 && reserve1 ? formattedNum(reserve1 / reserve0) : '-';
  const token1Rate = reserve0 && reserve1 ? formattedNum(reserve0 / reserve1) : '-';

  // formatted symbols for overflow
  const formattedSymbol0 = token0?.symbol.length > 6 ? token0?.symbol.slice(0, 5) + '...' : token0?.symbol;
  const formattedSymbol1 = token1?.symbol.length > 6 ? token1?.symbol.slice(0, 5) + '...' : token1?.symbol;

  const below1080 = useMedia('(max-width: 1080px)');
  // const below900 = useMedia('(max-width: 900px)');
  const below600 = useMedia('(max-width: 600px)');

  const swaprButtonsWidth = below600 ? '100%' : 'initial';
  const isPairLoading = !token0 || !token1;

  return (
    <PageWrapper>
      <ContentWrapper>
        <Flex alignItems={'end'} justifyContent={'space-between'}>
          <Typography.LargeText color={'text10'} sx={{ marginRight: '4px' }}>
            <BasicLink to="/pairs">{'Pairs '}</BasicLink>
            {!isPairLoading ? (
              <ExternalListLink external={true} href={getExplorerLink(selectedNetwork, pairAddress, 'address')}>
                {`→  ${token0?.symbol}-${token1?.symbol}`}
              </ExternalListLink>
            ) : (
              <Skeleton style={{ width: '60px' }} />
            )}
          </Typography.LargeText>
          {!below600 && <Search small={true} />}
        </Flex>
        <DashboardWrapper>
          <Flex justifyContent={'space-between'} style={{ gap: '16px', marginBottom: '20px' }}>
            <Flex style={{ gap: '16px' }}>
              {!isPairLoading ? (
                <FixedPanel onClick={() => history.push(`/token/${token0?.id}`)}>
                  <Flex alignItems={'center'} style={{ gap: '8px' }}>
                    <TokenLogo address={token0.id} defaultText={token0.symbol} size={'16px'} />
                    <Typography.SmallBoldText color={'text1'} sx={{ letterSpacing: '0.05em' }}>
                      {`1 ${formattedSymbol0} = ${token0Rate} ${formattedSymbol1} ${
                        parseFloat(token0.derivedNativeCurrency) ? '(' + token0USD + ')' : ''
                      }`}
                    </Typography.SmallBoldText>
                  </Flex>
                </FixedPanel>
              ) : (
                <Skeleton style={{ width: '160px', height: '34px' }} />
              )}
              {!isPairLoading ? (
                <FixedPanel onClick={() => history.push(`/token/${token1?.id}`)}>
                  <Flex alignItems={'center'} style={{ gap: '8px' }}>
                    <TokenLogo address={token1.id} defaultText={token1.symbol} size={'16px'} />
                    <Typography.SmallBoldText color={'text1'} sx={{ letterSpacing: '0.05em' }}>
                      {`1 ${formattedSymbol1} = ${token1Rate} ${formattedSymbol0}  ${
                        parseFloat(token1.derivedNativeCurrency) ? '(' + token1USD + ')' : ''
                      }`}
                    </Typography.SmallBoldText>
                  </Flex>
                </FixedPanel>
              ) : (
                <Skeleton style={{ width: '160px', height: '34px' }} />
              )}
            </Flex>
            <Flex style={{ gap: '16px', width: swaprButtonsWidth }}>
              <Link
                external
                href={getPoolLink(selectedNetwork, nativeCurrency, nativeCurrencyWrapper, token0?.id, token1?.id)}
                style={{ width: swaprButtonsWidth }}
              >
                <ButtonLight>
                  <Typography.SmallBoldText color={'bd1'} sx={{ letterSpacing: '0.08em' }}>
                    + ADD LIQUIDITY
                  </Typography.SmallBoldText>
                </ButtonLight>
              </Link>
              <Link
                external
                href={getSwapLink(selectedNetwork, nativeCurrency, nativeCurrencyWrapper, token0?.id, token1?.id)}
                style={{ width: swaprButtonsWidth }}
              >
                <ButtonDark>
                  <Typography.SmallBoldText color={'text8'} sx={{ letterSpacing: '0.08em' }}>
                    TRADE
                  </Typography.SmallBoldText>
                </ButtonDark>
              </Link>
            </Flex>
          </Flex>
          <>
            <PanelWrapper>
              <Panel style={{ height: '100%' }}>
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
                    label={'AVG. UTILIZATION'}
                    value={formattedUtilization}
                    dailyChange={utilizationChange}
                  />
                  <DailyChangeLabel
                    label={'FEES'}
                    value={(fees || fees === 0) && formattedNum(fees, true)}
                    dailyChange={(volumeChangeUSD || volumeChangeUSD === 0) && volumeChange}
                  />
                </Flex>
              </Panel>
              <Panel style={{ height: '100%' }}>
                <Flex flexDirection={'column'} style={{ gap: '28px' }}>
                  <Typography.Custom sx={{ fontWeight: 500, fontSize: '16px', lineHeight: '19px' }}>
                    Pooled Tokens
                  </Typography.Custom>
                  <Flex flexDirection={'column'} style={{ gap: '20px' }}>
                    {token0?.id ? (
                      <Flex alignItems={'center'} style={{ gap: '8px' }}>
                        <TokenLogo defaultText={token0.symbol} address={token0.id} size={'18px'} />
                        <Typography.LargeBoldText color={'text6'}>
                          {formattedNum(reserve0)} {token0.symbol}
                        </Typography.LargeBoldText>
                      </Flex>
                    ) : (
                      <Skeleton style={{ width: '140px', height: '18px' }} />
                    )}
                    {token1?.id ? (
                      <Flex alignItems={'center'} style={{ gap: '8px' }}>
                        <TokenLogo defaultText={token1.symbol} address={token1.id} size={'18px'} />
                        <Typography.LargeBoldText color={'text6'}>
                          {formattedNum(reserve1)} {token1.symbol}
                        </Typography.LargeBoldText>
                      </Flex>
                    ) : (
                      <Skeleton style={{ width: '140px', height: '18px' }} />
                    )}
                  </Flex>
                </Flex>
              </Panel>
              <Panel
                style={{
                  gridColumn: below1080 ? '' : '2/4',
                  gridRow: below1080 ? '' : '1/3',
                }}
              >
                <PairChart address={pairAddress} base0={reserve1 / reserve0} base1={reserve0 / reserve1} />
              </Panel>
            </PanelWrapper>
            <Panel marginTop={'20px'}>
              <Flex flexDirection={'column'} style={{ gap: '28px' }}>
                <Flex justifyContent={'space-between'}>
                  <Typography.Custom sx={{ fontWeight: 500, fontSize: '16px', lineHeight: '19px' }}>
                    Pair Information
                  </Typography.Custom>
                  <Link external href={getExplorerLink(selectedNetwork, pairAddress, 'token')}>
                    <ButtonDark>
                      <Typography.SmallBoldText color={'text8'} sx={{ letterSpacing: '0.08em' }}>
                        VIEW ON EXPLORER ↗
                      </Typography.SmallBoldText>
                    </ButtonDark>
                  </Link>
                </Flex>
                <Flex justifyContent={'space-between'}>
                  <LabeledValue
                    label={'PAIR NAME'}
                    value={
                      token0 && token1 ? `${token0.symbol}-${token1.symbol}` : <Skeleton style={{ width: '90px' }} />
                    }
                  />
                  <LabeledValue
                    label={'SWAP FEE'}
                    value={pairSwapFeeBips ? `${pairSwapFeeBips / 100}%` : <Skeleton style={{ width: '60px' }} />}
                  />
                  <Flex flexDirection={'column'} style={{ gap: '8px' }}>
                    <Typography.Custom
                      color={'text7'}
                      sx={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.15em' }}
                    >
                      {'PAIR ADRESS'}
                    </Typography.Custom>
                    {pairAddress ? (
                      <Flex>
                        <Typography.LargeBoldText color={'text6'} sx={{ letterSpacing: '0.02em' }}>
                          {pairAddress.slice(0, 6) + '...' + pairAddress.slice(38, 42)}
                        </Typography.LargeBoldText>
                        <CopyHelper toCopy={pairAddress} />
                      </Flex>
                    ) : (
                      <Skeleton style={{ width: '120px' }} />
                    )}
                  </Flex>
                  <Flex flexDirection={'column'} style={{ gap: '8px' }}>
                    {token0 ? (
                      <Typography.Custom
                        color={'text7'}
                        sx={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.15em' }}
                      >
                        {`${token0.symbol} ADDRESS`}
                      </Typography.Custom>
                    ) : (
                      <Skeleton style={{ width: '120px' }} />
                    )}
                    {token0 ? (
                      <Flex>
                        <Typography.LargeBoldText color={'text6'} sx={{ letterSpacing: '0.02em' }}>
                          {token0 && token0.id.slice(0, 6) + '...' + token0.id.slice(38, 42)}
                        </Typography.LargeBoldText>
                        <CopyHelper toCopy={token0.id} />
                      </Flex>
                    ) : (
                      <Skeleton style={{ width: '120px' }} />
                    )}
                  </Flex>
                  <Flex flexDirection={'column'} style={{ gap: '8px' }}>
                    {token1 ? (
                      <Typography.Custom
                        color={'text7'}
                        sx={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.15em' }}
                      >
                        {`${token1.symbol} ADDRESS`}
                      </Typography.Custom>
                    ) : (
                      <Skeleton style={{ width: '120px' }} />
                    )}
                    {token1 ? (
                      <Flex>
                        <Typography.LargeBoldText color={'text6'} sx={{ letterSpacing: '0.02em' }}>
                          {token1 && token1.id.slice(0, 6) + '...' + token1.id.slice(38, 42)}
                        </Typography.LargeBoldText>
                        <CopyHelper toCopy={token1.id} />
                      </Flex>
                    ) : (
                      <Skeleton style={{ width: '120px' }} />
                    )}
                  </Flex>
                </Flex>
              </Flex>
            </Panel>
            <LiquidityMiningCampaingCardList
              campaings={liquidityMiningCampaings}
              nativeCurrencyPrice={nativeCurrencyPrice && parseFloat(nativeCurrencyPrice)}
            />
            <Typography.Custom
              color={'text10'}
              sx={{
                fontSize: '20px',
                lineHeight: '24px',
                fontWeight: 400,
                marginTop: '40px',
                marginBottom: '20px',
                textAlign: below600 ? 'center' : 'left',
              }}
            >
              Transactions
            </Typography.Custom>
            {transactions ? (
              <TxnList transactions={transactions} />
            ) : (
              <Panel
                style={{
                  marginTop: '1.5rem',
                }}
              >
                <Loader />
              </Panel>
            )}
          </>
        </DashboardWrapper>
      </ContentWrapper>
    </PageWrapper>
  );
}

export default withRouter(PairPage);
