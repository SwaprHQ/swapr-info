import dayjs from 'dayjs';
import { transparentize } from 'polished';
import React, { useEffect, useState } from 'react';
import { DollarSign, FileText, Repeat, Users } from 'react-feather';
import { withRouter } from 'react-router-dom';
import { useMedia } from 'react-use';
import styled from 'styled-components';

import { TYPE, ThemedBackground } from '../Theme';
import { PageWrapper, ContentWrapper } from '../components';
import { AutoColumn } from '../components/Column';
import ComulativeNetworkDataCard from '../components/ComulativeNetworkDataCard';
import Icon from '../components/Icon';
import LocalLoader from '../components/LocalLoader';
import NetworkDataCardWithDialog from '../components/NetworkDataCardWithDialog';
import Panel from '../components/Panel';
import StackedChart from '../components/StackedChart';
import { SupportedNetwork } from '../constants';
import {
  useDashboardChartData,
  useDashboardComulativeData,
  useOneDaySwapsData,
  useOneDayWalletsData,
  usePastMonthWalletsData,
  useSwapsData,
} from '../contexts/Dashboard';
import { formattedNum } from '../utils';

const GridRow = styled.div`
  display: grid;
  grid-template-columns: 3fr 1.5fr;
  column-gap: 16px;
  row-gap: 16px;
`;

const GridChart = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 416px 416px;
  row-gap: 16px;
`;

const GridCard = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto;
  row-gap: 16px;
`;

const PanelLoaderWrapper = ({ isLoading, children }) => <Panel>{isLoading ? <LocalLoader /> : children}</Panel>;
const CardLoaderWrapper = ({ isLoading, children }) => (
  <Panel>{isLoading ? <LocalLoader height={'163px'} /> : children}</Panel>
);

const DashboardPage = () => {
  const oneDayTransactions = useOneDaySwapsData();
  const oneDayWalletsData = useOneDayWalletsData();
  const chartData = useDashboardChartData();
  const comulativeData = useDashboardComulativeData();
  const [formattedLiquidityData, setFormattedLiquidityData] = useState([]);
  const [formattedVolumeData, setFormattedVolumeData] = useState([]);
  const [formattedComulativeData, setFormattedComulativeData] = useState({ trades: [], volume: [] });

  // breakpoints
  const below800 = useMedia('(max-width: 800px)');
  const below1400 = useMedia('(max-width: 1400px)');

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

  return (
    <PageWrapper>
      <ThemedBackground backgroundColor={transparentize(0.8, '#4526A2')} />
      <ContentWrapper style={{ maxWidth: '1250px' }}>
        <TYPE.largeHeader>{below800 ? 'Analytics Dashboard' : 'Swapr Protocol Analytics Dashboard'}</TYPE.largeHeader>
        {formattedLiquidityData && (
          <>
            {below800 ? (
              <AutoColumn style={{ marginTop: '6px' }} gap={'16px'}>
                <PanelLoaderWrapper isLoading={isVolumeAndTvlLoading}>
                  <StackedChart title={'TVL'} type={'AREA'} data={formattedLiquidityData} />
                </PanelLoaderWrapper>
                <PanelLoaderWrapper isLoading={isVolumeAndTvlLoading}>
                  <StackedChart title={'Volume'} type={'BAR'} data={formattedVolumeData} />
                </PanelLoaderWrapper>
                <CardLoaderWrapper isLoading={isComulativeDataLoading}>
                  <ComulativeNetworkDataCard
                    title={'All time volume'}
                    icon={<Icon icon={<DollarSign />} />}
                    comulativeValue={`$ ${formattedNum(comulativeData.totalVolume)}`}
                    networksValues={formattedComulativeData.volume}
                  />
                </CardLoaderWrapper>
                <CardLoaderWrapper isLoading={isComulativeDataLoading}>
                  <ComulativeNetworkDataCard
                    title={'Total transactions'}
                    icon={<Icon icon={<FileText />} />}
                    comulativeValue={formattedNum(comulativeData.totalTrades)}
                    networksValues={formattedComulativeData.trades}
                  />
                </CardLoaderWrapper>
                <CardLoaderWrapper isLoading={isLoadingOneDayTransactions}>
                  <NetworkDataCardWithDialog
                    title={'Trades (past 24h)'}
                    icon={<Icon icon={<FileText />} />}
                    dialogContent={'content'}
                    networksValues={oneDayTransactions}
                    historicalDataHook={useSwapsData}
                  />
                </CardLoaderWrapper>
                <CardLoaderWrapper isLoading={isLoadingOneDayWallets}>
                  <NetworkDataCardWithDialog
                    title={'Wallets (past 24h)'}
                    chartTitle={'Wallets'}
                    icon={<Icon icon={<Users />} />}
                    networksValues={oneDayWalletsData}
                    historicalDataHook={usePastMonthWalletsData}
                  />
                </CardLoaderWrapper>
              </AutoColumn>
            ) : below1400 ? (
              <AutoColumn style={{ marginTop: '6px' }} gap={'16px'}>
                <PanelLoaderWrapper isLoading={isVolumeAndTvlLoading}>
                  <StackedChart title={'TVL'} type={'AREA'} data={formattedLiquidityData} />
                </PanelLoaderWrapper>
                <PanelLoaderWrapper isLoading={isVolumeAndTvlLoading}>
                  <StackedChart title={'Volume'} type={'BAR'} data={formattedVolumeData} />
                </PanelLoaderWrapper>
                <AutoColumn gap={'16px'}>
                  <CardLoaderWrapper isLoading={isComulativeDataLoading}>
                    <ComulativeNetworkDataCard
                      title={'All time volume'}
                      icon={<Icon icon={<DollarSign />} />}
                      comulativeValue={`$ ${formattedNum(comulativeData.totalVolume)}`}
                      networksValues={formattedComulativeData.volume}
                    />
                  </CardLoaderWrapper>
                  <CardLoaderWrapper isLoading={isComulativeDataLoading}>
                    <ComulativeNetworkDataCard
                      title={'Total transactions'}
                      icon={<Icon icon={<FileText />} />}
                      comulativeValue={formattedNum(comulativeData.totalTrades)}
                      networksValues={formattedComulativeData.trades}
                    />
                  </CardLoaderWrapper>
                  <CardLoaderWrapper isLoading={isLoadingOneDayTransactions}>
                    <NetworkDataCardWithDialog
                      title={'Trades (past 24h)'}
                      icon={<Icon icon={<FileText />} />}
                      dialogContent={'content'}
                      networksValues={oneDayTransactions}
                      historicalDataHook={useSwapsData}
                    />
                  </CardLoaderWrapper>
                  <CardLoaderWrapper isLoading={isLoadingOneDayWallets}>
                    <NetworkDataCardWithDialog
                      title={'Wallets (past 24h)'}
                      chartTitle={'Wallets'}
                      icon={<Icon icon={<Users />} />}
                      networksValues={oneDayWalletsData}
                      historicalDataHook={usePastMonthWalletsData}
                    />
                  </CardLoaderWrapper>
                </AutoColumn>
              </AutoColumn>
            ) : (
              <GridRow>
                <GridChart>
                  <PanelLoaderWrapper isLoading={isVolumeAndTvlLoading}>
                    <StackedChart title={'TVL'} type={'AREA'} data={formattedLiquidityData} />
                  </PanelLoaderWrapper>
                  <PanelLoaderWrapper isLoading={isVolumeAndTvlLoading}>
                    <StackedChart title={'Volume'} type={'BAR'} data={formattedVolumeData} />
                  </PanelLoaderWrapper>
                </GridChart>
                <div>
                  <GridCard>
                    <CardLoaderWrapper isLoading={isComulativeDataLoading}>
                      <ComulativeNetworkDataCard
                        title={'All time volume'}
                        icon={<Icon icon={<DollarSign />} />}
                        comulativeValue={`$ ${formattedNum(comulativeData.totalVolume)}`}
                        networksValues={formattedComulativeData.volume}
                      />
                    </CardLoaderWrapper>
                    <CardLoaderWrapper isLoading={isComulativeDataLoading}>
                      <ComulativeNetworkDataCard
                        title={'Total transactions'}
                        icon={<Icon icon={<FileText />} />}
                        comulativeValue={formattedNum(comulativeData.totalTrades)}
                        networksValues={formattedComulativeData.trades}
                      />
                    </CardLoaderWrapper>
                    <CardLoaderWrapper isLoading={isLoadingOneDayTransactions}>
                      <NetworkDataCardWithDialog
                        title={'Trades (past 24h)'}
                        chartTitle={'Trades'}
                        icon={<Icon icon={<Repeat />} />}
                        networksValues={oneDayTransactions}
                        historicalDataHook={useSwapsData}
                      />
                    </CardLoaderWrapper>
                    <CardLoaderWrapper isLoading={isLoadingOneDayWallets}>
                      <NetworkDataCardWithDialog
                        title={'Wallets (past 24h)'}
                        chartTitle={'Wallets'}
                        icon={<Icon icon={<Users />} />}
                        networksValues={oneDayWalletsData}
                        historicalDataHook={usePastMonthWalletsData}
                      />
                    </CardLoaderWrapper>
                  </GridCard>
                </div>
              </GridRow>
            )}
          </>
        )}
      </ContentWrapper>
    </PageWrapper>
  );
};

export default withRouter(DashboardPage);
