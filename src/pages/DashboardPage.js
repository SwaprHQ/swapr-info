import dayjs from 'dayjs';
import { transparentize } from 'polished';
import React, { useEffect, useState } from 'react';
import { DollarSign, FileText } from 'react-feather';
import { withRouter } from 'react-router-dom';
import { useMedia } from 'react-use';
import styled from 'styled-components';

import { TYPE, ThemedBackground } from '../Theme';
import { PageWrapper, ContentWrapper } from '../components';
import { AutoColumn } from '../components/Column';
import ComulativeNetworkDataCard from '../components/ComulativeNetworkDataCard';
import LocalLoader from '../components/LocalLoader';
import Panel from '../components/Panel';
import StackedChart from '../components/StackedChart';
import { SupportedNetwork } from '../constants';
import { useDashboardChartData, useDashboardComulativeData } from '../contexts/Dashboard';
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

const DashboardPage = () => {
  const chartData = useDashboardChartData();
  const comulativeData = useDashboardComulativeData();
  const [formattedLiquidityData, setFormattedLiquidityData] = useState([]);
  const [formattedVolumeData, setFormattedVolumeData] = useState([]);
  const [formattedTotalTrades, setFormattedTotalTrades] = useState([]);
  const [formattedTotalVolume, setFormattedTotalVolume] = useState([]);

  // breakpoints
  const below800 = useMedia('(max-width: 800px)');

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

      setFormattedTotalTrades(totalTradesPerNetwork);
      setFormattedTotalVolume(totalVolumePerNetwork);
    }
  }, [comulativeData]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, []);

  return (
    <>
      {(chartData === undefined ||
        Object.keys(chartData).length === 0 ||
        comulativeData === undefined ||
        Object.keys(comulativeData).length === 0) && <LocalLoader fill="true" />}
      <PageWrapper>
        <ThemedBackground backgroundColor={transparentize(0.8, '#4526A2')} />
        <ContentWrapper>
          <TYPE.largeHeader>{below800 ? 'Analytics Dashboard' : 'Swapr Protocol Analytics Dashboard'}</TYPE.largeHeader>
          {formattedLiquidityData && (
            <>
              {below800 ? (
                <AutoColumn style={{ marginTop: '6px' }} gap="24px">
                  <Panel style={{ height: '100%' }}>
                    <StackedChart title={'TVL'} type={'AREA'} data={formattedLiquidityData} />
                  </Panel>
                  <Panel style={{ height: '100%' }}>
                    <StackedChart title={'Volume'} type={'BAR'} data={formattedVolumeData} />
                  </Panel>
                  <ComulativeNetworkDataCard
                    title={'All time volume'}
                    icon={<DollarSign size={22} color="#50dfb6" />}
                    comulativeValue={`$ ${formattedNum(comulativeData.totalVolume)}`}
                    networksValues={formattedTotalVolume}
                  />
                  <ComulativeNetworkDataCard
                    title={'Total trades'}
                    icon={<FileText size={22} color="#50dfb6" />}
                    comulativeValue={formattedNum(comulativeData.totalTrades)}
                    networksValues={formattedTotalTrades}
                  />
                </AutoColumn>
              ) : (
                <GridRow>
                  <div>
                    <GridChart>
                      <Panel style={{ height: '100%' }}>
                        <StackedChart title={'TVL'} type={'AREA'} data={formattedLiquidityData} />
                      </Panel>
                      <Panel style={{ height: '100%' }}>
                        <StackedChart title={'Volume'} type={'BAR'} data={formattedVolumeData} />
                      </Panel>
                    </GridChart>
                  </div>
                  <div>
                    <GridCard>
                      <ComulativeNetworkDataCard
                        title={'All time volume'}
                        icon={<DollarSign size={22} color="#50dfb6" />}
                        comulativeValue={`$ ${formattedNum(comulativeData.totalVolume)}`}
                        networksValues={formattedTotalVolume}
                      />
                      <ComulativeNetworkDataCard
                        title={'Total trades'}
                        icon={<FileText size={22} color="#50dfb6" />}
                        comulativeValue={formattedNum(comulativeData.totalTrades)}
                        networksValues={formattedTotalTrades}
                      />
                    </GridCard>
                  </div>
                </GridRow>
              )}
            </>
          )}
        </ContentWrapper>
        )
      </PageWrapper>
    </>
  );
};

export default withRouter(DashboardPage);
