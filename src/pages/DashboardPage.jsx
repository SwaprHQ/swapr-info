import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-feather';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';

import { Typography } from '../Theme';
import { ReactComponent as BarChartSvg } from '../assets/svg/bar-chart.svg';
import { ReactComponent as DollarSvg } from '../assets/svg/dollar.svg';
import { ReactComponent as FeesSvg } from '../assets/svg/fees.svg';
import { ReactComponent as TradesSvg } from '../assets/svg/trades.svg';
import { ReactComponent as WalletsSvg } from '../assets/svg/wallets.svg';
import { PageWrapper, ContentWrapper } from '../components';
import { AutoColumn } from '../components/Column';
import ComulativeNetworkDataCard from '../components/ComulativeNetworkDataCard';
import Icon from '../components/Icon';
import LocalLoader from '../components/LocalLoader';
import NetworkDataCardWithDialog from '../components/NetworkDataCardWithDialog';
import Panel from '../components/Panel';
import StackedChart from '../components/StackedChart';
import { SupportedNetwork, NETOWRK_FEE_RECEIVER_ADDRESSES, STACKED_CHART_TIME_FILTER_OPTIONS } from '../constants';
import {
  useDashboardChartData,
  useDashboardComulativeData,
  useOneDaySwapsData,
  usePastYearUniqueDailyWalletsData,
  useSwapsData,
  useUncollectedFeesData,
  useUniqueDailyWalletsData,
  useUniqueWeeklyWalletsData,
  usePastYearUniqueWeeklyWalletsData,
  useUniqueMonthlyWalletsData,
  usePastYearUniqueMonthlyWalletsData,
} from '../contexts/Dashboard';
import { useSelectedNetworkUpdater } from '../contexts/Network';
import { useIsBelowPx } from '../hooks/useIsBelowPx';
import { formattedNum, getWeekFormattedDate } from '../utils';

const GridRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 20px;
  row-gap: 20px;
`;

const GridCard = styled.div`
  display: grid;
  grid-template-columns: ${({ columns }) => columns};
  grid-template-rows: auto;
  column-gap: 20px;
  row-gap: 20px;
`;

const RedirectIconWrapper = styled.div`
  & > :hover {
    color: ${({ theme }) => theme.text1};
    cursor: pointer;
  }
`;

const PanelLoaderWrapper = ({ minHeight, maxHeight, isLoading, children }) => (
  <Panel minHeight={minHeight || '380px'} maxHeight={maxHeight || '380px'}>
    {isLoading ? <LocalLoader /> : children}
  </Panel>
);

const CardLoaderWrapper = ({ isLoading, children }) => (
  <Panel minHeight={'158px'} padding={'24px'}>
    {isLoading ? <LocalLoader height={'183px'} /> : children}
  </Panel>
);

const DashboardPage = ({ history }) => {
  const oneDayTransactions = useOneDaySwapsData();
  const oneDayWalletsData = useUniqueDailyWalletsData(dayjs.utc().startOf('day').unix());
  const oneWeekWalletsData = useUniqueWeeklyWalletsData(dayjs.utc().subtract(7, 'day').startOf('day').unix());
  const oneMonthWalletsData = useUniqueMonthlyWalletsData(dayjs.utc().subtract(1, 'month').startOf('day').unix());
  const chartData = useDashboardChartData();
  const comulativeData = useDashboardComulativeData();
  const switchNetwork = useSelectedNetworkUpdater();
  const { uncollectedFeesData, loading: isLoadingUncollectedFees } = useUncollectedFeesData();

  const [formattedLiquidityData, setFormattedLiquidityData] = useState([]);
  const [formattedVolumeData, setFormattedVolumeData] = useState([]);
  const [formattedComulativeData, setFormattedComulativeData] = useState({ trades: [], volume: [] });

  // breakpoints
  const isBelow800px = useIsBelowPx(800);
  const isBelow1500px = useIsBelowPx(1500);

  const handleReceiverLookup = (network) => {
    switchNetwork(network);
    history.push(`/account/${NETOWRK_FEE_RECEIVER_ADDRESSES[network]}`);
  };

  useEffect(() => {
    if (chartData && chartData.daily) {
      // group daily volume and liquidity data by date
      const formattedData = Object.values(
        chartData.daily.reduce(
          (accumulator, current) => ({
            ...accumulator,
            [current.date]: {
              time: dayjs.unix(current.date).utc().format('YYYY-MM-DD'),
              tvl: {
                ...accumulator[current.date]?.tvl,
                [current.network]: parseFloat(current.totalLiquidityUSD),
              },
              volume: {
                ...accumulator[current.date]?.volume,
                [current.network]: parseFloat(current.dailyVolumeUSD),
              },
            },
          }),
          {},
        ),
      );

      setFormattedLiquidityData(formattedData.map(({ time, tvl }) => ({ time, ...tvl })));
      setFormattedVolumeData(formattedData.map(({ time, volume }) => ({ time, ...volume })));
    }
  }, [chartData]);

  useEffect(() => {
    if (comulativeData && Object.keys(comulativeData).length > 0) {
      const totalTradesPerNetwork = [];
      const totalVolumePerNetwork = [];

      Object.keys(comulativeData)
        // include only network specific data
        .filter((key) => Object.values(SupportedNetwork).includes(key))
        .forEach((network) => {
          totalTradesPerNetwork.push({
            network,
            value: formattedNum(comulativeData[network].totalTrades),
          });
          totalVolumePerNetwork.push({
            network,
            value: `$ ${formattedNum(comulativeData[network].totalVolume)}`,
          });
        });

      setFormattedComulativeData({ trades: totalTradesPerNetwork, volume: totalVolumePerNetwork });
    }
  }, [comulativeData]);

  const formattedUncollectedFees = useMemo(
    () =>
      Object.keys(uncollectedFeesData ?? {})
        .filter((key) => Object.values(SupportedNetwork).includes(key))
        .map((network) => ({ network, value: `$ ${formattedNum(uncollectedFeesData[network])}` })),
    [uncollectedFeesData],
  );

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, []);

  const isVolumeAndTvlLoading = chartData === undefined || Object.keys(chartData).length === 0;
  const isComulativeDataLoading =
    formattedComulativeData.trades.length === 0 || formattedComulativeData.volume.length === 0;
  const isLoadingOneDayTransactions = oneDayTransactions === undefined || Object.keys(oneDayTransactions).length === 0;
  const isLoadingOneDayWallets = oneDayWalletsData === undefined || Object.keys(oneDayWalletsData).length === 0;
  const isLoadingOneWeekWallets = oneWeekWalletsData === undefined || Object.keys(oneWeekWalletsData).length === 0;
  const isLoadingOneMonthWallets = oneMonthWalletsData === undefined || Object.keys(oneMonthWalletsData).length === 0;

  return (
    <PageWrapper>
      <ContentWrapper>
        <Typography.MediumHeader
          color={'text10'}
          sx={{ textAlign: isBelow800px ? 'center' : 'left', marginTop: '26px' }}
        >
          {isBelow800px ? 'Analytics Dashboard' : 'Swapr Protocol Analytics Dashboard'}
        </Typography.MediumHeader>
        {formattedLiquidityData && (
          <>
            {isBelow800px ? (
              <AutoColumn style={{ marginTop: '6px' }} gap={'20px'}>
                <PanelLoaderWrapper maxHeight={'auto'} isLoading={isVolumeAndTvlLoading}>
                  <StackedChart title={'TVL'} type={'AREA'} data={formattedLiquidityData} />
                </PanelLoaderWrapper>
                <PanelLoaderWrapper maxHeight={'auto'} isLoading={isVolumeAndTvlLoading}>
                  <StackedChart title={'Volume'} type={'BAR'} data={formattedVolumeData} />
                </PanelLoaderWrapper>
                <CardLoaderWrapper isLoading={isComulativeDataLoading}>
                  <ComulativeNetworkDataCard
                    title={'All time volume'}
                    icon={<Icon icon={<DollarSvg height={18} width={18} />} />}
                    comulativeValue={`$ ${formattedNum(comulativeData.totalVolume)}`}
                    networksValues={formattedComulativeData.volume}
                  />
                </CardLoaderWrapper>
                <CardLoaderWrapper isLoading={isComulativeDataLoading}>
                  <ComulativeNetworkDataCard
                    title={'Total transactions'}
                    icon={<Icon icon={<BarChartSvg height={18} width={18} />} />}
                    comulativeValue={formattedNum(comulativeData.totalTrades)}
                    networksValues={formattedComulativeData.trades}
                  />
                </CardLoaderWrapper>
                <CardLoaderWrapper isLoading={isLoadingUncollectedFees}>
                  <ComulativeNetworkDataCard
                    title={'Uncollected fees'}
                    icon={<Icon icon={<FeesSvg height={18} width={18} />} />}
                    comulativeValue={`$ ${formattedNum(uncollectedFeesData?.total ?? 0)}`}
                    networksValues={formattedUncollectedFees}
                    customNetworkAction={
                      <RedirectIconWrapper onClick={handleReceiverLookup}>
                        <Icon icon={<Link size={14} />} color={'text6'} />
                      </RedirectIconWrapper>
                    }
                  />
                </CardLoaderWrapper>
                <CardLoaderWrapper isLoading={isLoadingOneDayTransactions}>
                  <NetworkDataCardWithDialog
                    title={'Trades 24h'}
                    chartTitle={'Trades'}
                    icon={<Icon icon={<TradesSvg height={18} width={18} />} />}
                    networksValues={oneDayTransactions}
                    historicalDataHook={useSwapsData}
                  />
                </CardLoaderWrapper>
                <CardLoaderWrapper isLoading={isLoadingOneDayWallets}>
                  <NetworkDataCardWithDialog
                    title={'Daily wallets'}
                    chartTitle={'Daily Wallets'}
                    icon={<Icon icon={<WalletsSvg height={18} width={18} />} />}
                    networksValues={oneDayWalletsData}
                    historicalDataHook={usePastYearUniqueDailyWalletsData}
                  />
                </CardLoaderWrapper>
                <CardLoaderWrapper isLoading={isLoadingOneWeekWallets}>
                  <NetworkDataCardWithDialog
                    title={'Weekly wallets'}
                    chartTitle={'Weekly Wallets'}
                    icon={<Icon icon={<WalletsSvg height={18} width={18} />} />}
                    networksValues={oneWeekWalletsData}
                    formatActiveDate={(activeDate) => getWeekFormattedDate(activeDate, true)}
                    historicalDataHook={usePastYearUniqueWeeklyWalletsData}
                  />
                </CardLoaderWrapper>
                <CardLoaderWrapper isLoading={isLoadingOneMonthWallets}>
                  <NetworkDataCardWithDialog
                    title={'Monthly wallets'}
                    chartTitle={'Monthly Wallets'}
                    icon={<Icon icon={<WalletsSvg height={18} width={18} />} />}
                    networksValues={oneMonthWalletsData}
                    isTimeFilterVisible={false}
                    defaultTimeFilter={STACKED_CHART_TIME_FILTER_OPTIONS.YEAR}
                    formatActiveDate={(activeDate) => dayjs(activeDate).format('MMMM YYYY')}
                    historicalDataHook={usePastYearUniqueMonthlyWalletsData}
                  />
                </CardLoaderWrapper>
              </AutoColumn>
            ) : (
              <>
                <GridRow>
                  <PanelLoaderWrapper maxHeight={'400px'} isLoading={isVolumeAndTvlLoading}>
                    <StackedChart title={'TVL'} type={'AREA'} data={formattedLiquidityData} />
                  </PanelLoaderWrapper>
                  <PanelLoaderWrapper maxHeight={'400px'} isLoading={isVolumeAndTvlLoading}>
                    <StackedChart title={'Volume'} type={'BAR'} data={formattedVolumeData} />
                  </PanelLoaderWrapper>
                </GridRow>
                <GridCard columns={isBelow1500px ? '1fr 1fr' : '1fr 1fr 1fr'}>
                  <CardLoaderWrapper isLoading={isComulativeDataLoading}>
                    <ComulativeNetworkDataCard
                      title={'All time volume'}
                      icon={<Icon icon={<DollarSvg height={18} width={18} />} />}
                      comulativeValue={`$ ${formattedNum(comulativeData.totalVolume)}`}
                      networksValues={formattedComulativeData.volume}
                    />
                  </CardLoaderWrapper>
                  <CardLoaderWrapper isLoading={isComulativeDataLoading}>
                    <ComulativeNetworkDataCard
                      title={'Total transactions'}
                      icon={<Icon icon={<BarChartSvg height={18} width={18} />} />}
                      comulativeValue={formattedNum(comulativeData.totalTrades)}
                      networksValues={formattedComulativeData.trades}
                    />
                  </CardLoaderWrapper>
                  <CardLoaderWrapper isLoading={isLoadingUncollectedFees}>
                    <ComulativeNetworkDataCard
                      title={'Uncollected fees'}
                      icon={<Icon icon={<FeesSvg height={18} width={18} />} />}
                      comulativeValue={`$ ${formattedNum(uncollectedFeesData?.total ?? 0)}`}
                      networksValues={formattedUncollectedFees}
                      customNetworkAction={
                        <RedirectIconWrapper onClick={handleReceiverLookup}>
                          <Icon icon={<Link size={14} />} color={'text6'} />
                        </RedirectIconWrapper>
                      }
                    />
                  </CardLoaderWrapper>
                  <CardLoaderWrapper isLoading={isLoadingOneDayTransactions}>
                    <NetworkDataCardWithDialog
                      title={'Trades 24h'}
                      chartTitle={'Trades'}
                      icon={<Icon icon={<TradesSvg height={18} width={18} />} />}
                      networksValues={oneDayTransactions}
                      historicalDataHook={useSwapsData}
                    />
                  </CardLoaderWrapper>
                  <CardLoaderWrapper isLoading={isLoadingOneDayWallets}>
                    <NetworkDataCardWithDialog
                      title={'Daily wallets'}
                      chartTitle={'Past Year Daily Wallets'}
                      icon={<Icon icon={<WalletsSvg height={18} width={18} />} />}
                      networksValues={oneDayWalletsData}
                      historicalDataHook={usePastYearUniqueDailyWalletsData}
                    />
                  </CardLoaderWrapper>
                  <CardLoaderWrapper isLoading={isLoadingOneWeekWallets}>
                    <NetworkDataCardWithDialog
                      title={'Weekly wallets'}
                      chartTitle={'Past Year Weekly Wallets'}
                      icon={<Icon icon={<WalletsSvg height={18} width={18} />} />}
                      networksValues={oneWeekWalletsData}
                      formatActiveDate={(activeDate) => getWeekFormattedDate(activeDate)}
                      historicalDataHook={usePastYearUniqueWeeklyWalletsData}
                    />
                  </CardLoaderWrapper>
                  <CardLoaderWrapper isLoading={isLoadingOneMonthWallets}>
                    <NetworkDataCardWithDialog
                      title={'Monthly wallets'}
                      chartTitle={'Past Year Monthly Wallets'}
                      icon={<Icon icon={<WalletsSvg height={18} width={18} />} />}
                      networksValues={oneMonthWalletsData}
                      isTimeFilterVisible={false}
                      defaultTimeFilter={STACKED_CHART_TIME_FILTER_OPTIONS.YEAR}
                      formatActiveDate={(activeDate) => dayjs(activeDate).format('MMMM YYYY')}
                      historicalDataHook={usePastYearUniqueMonthlyWalletsData}
                    />
                  </CardLoaderWrapper>
                </GridCard>
              </>
            )}
          </>
        )}
      </ContentWrapper>
    </PageWrapper>
  );
};

export default withRouter(DashboardPage);
