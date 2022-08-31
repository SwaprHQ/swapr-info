import dayjs from 'dayjs';
import { useState, useRef, useEffect, useMemo } from 'react';
import Skeleton from 'react-loading-skeleton';
import { useMedia } from 'react-use';
import { Flex } from 'rebass';
import styled from 'styled-components';

import { Typography } from '../../Theme';
import { timeframeOptions, TIME_FILTER_OPTIONS } from '../../constants';
import { usePairChartData, usePairData, usePairRateData } from '../../contexts/PairData';
import CandleStickChart from '../CandleStickChart';
import Chart from '../Chart';
import DropdownBasicSelect from '../DropdownBasicSelect';
import LocalLoader from '../LocalLoader';
import Panel from '../Panel';
import RadioTimeFilter from '../RadioTimeFilter';
import { ChartTypeButton } from '../TokenChart/styled';

const ChartWrapper = styled.div`
  height: 100%;
  max-height: 340px;

  @media screen and (max-width: 600px) {
    min-height: 200px;
  }
`;

const CHART_VIEW = {
  VOLUME: 'Volume',
  LIQUIDITY: 'Liquidity',
  UTILIZATION: 'Utilization',
  RATE0: 'Rate 0',
  RATE1: 'Rate 1',
};

const PanelLoaderWrapper = ({ isLoading, children }) => (
  <Panel minHeight={'340px'} maxHeight={'340px'} style={{ border: 'none', padding: '0' }}>
    {isLoading ? <LocalLoader /> : children}
  </Panel>
);

const PairChart = ({ address, base0, base1 }) => {
  const [chartFilter, setChartFilter] = useState(CHART_VIEW.LIQUIDITY);
  const [activeFilter, setActiveFilter] = useState(TIME_FILTER_OPTIONS.WEEK);
  const [isHourlyPriceData, setIsHourlyPriceData] = useState(false);

  // update the width on a window resize
  const ref = useRef();
  const isClient = typeof window === 'object';
  const [width, setWidth] = useState(ref?.current?.container?.clientWidth);

  const [height, setHeight] = useState(ref?.current?.container?.clientHeight);
  useEffect(() => {
    if (!isClient) {
      return false;
    }
    function handleResize() {
      setWidth(ref?.current?.container?.clientWidth ?? width);
      setHeight(ref?.current?.container?.clientHeight ?? height);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [height, isClient, width]); // Empty array ensures that effect is only run on mount and unmount

  // get data for pair, and rates
  const pairData = usePairData(address);
  const liquidityVolumeAndUtilizationData = usePairChartData(address);

  const dailyYearData = usePairRateData(address, timeframeOptions.YEAR, 86400);
  const weeklyHourlyData = usePairRateData(address, timeframeOptions.WEEK, 3600);

  // format liquidity, volume, and utilization values
  const { formattedLiquidityData, formattedVolumeData, formattedUtilizationData } = useMemo(
    () => ({
      formattedLiquidityData: liquidityVolumeAndUtilizationData?.map((data) => ({
        time: dayjs(data.date * 1000).format('YYYY-MM-DD'),
        value: parseFloat(data.reserveUSD),
      })),
      formattedVolumeData: liquidityVolumeAndUtilizationData?.map((data) => ({
        time: dayjs(data.date * 1000).format('YYYY-MM-DD'),
        value: parseFloat(data.dailyVolumeUSD),
      })),
      formattedUtilizationData: liquidityVolumeAndUtilizationData?.map((data) => ({
        time: dayjs(data.date * 1000).format('YYYY-MM-DD'),
        value: parseFloat(data.utilization),
      })),
    }),
    [liquidityVolumeAndUtilizationData],
  );

  // format prices values
  const { formattedPriceDataRate0, formattedPriceDataRate1 } = useMemo(() => {
    if (activeFilter === TIME_FILTER_OPTIONS.WEEK && weeklyHourlyData) {
      setIsHourlyPriceData(true);

      return {
        formattedPriceDataRate0: weeklyHourlyData[0]?.map((data) => ({
          timestamp: data.timestamp * 1000,
          open: parseFloat(data.open),
          close: parseFloat(data.close),
        })),
        formattedPriceDataRate1: weeklyHourlyData[1]?.map((data) => ({
          timestamp: data.timestamp * 1000,
          open: parseFloat(data.open),
          close: parseFloat(data.close),
        })),
      };
    }

    if (dailyYearData) {
      setIsHourlyPriceData(false);

      return {
        formattedPriceDataRate0: dailyYearData[0]?.map((data) => ({
          timestamp: data.timestamp * 1000,
          open: parseFloat(data.open),
          close: parseFloat(data.close),
        })),
        formattedPriceDataRate1: dailyYearData[1]?.map((data) => ({
          timestamp: data.timestamp * 1000,
          open: parseFloat(data.open),
          close: parseFloat(data.close),
        })),
      };
    }

    return {
      formattedPriceDataRate0: [],
      formattedPriceDataRate1: [],
    };
  }, [dailyYearData, weeklyHourlyData, activeFilter]);

  // formatted symbols for overflow
  const formattedSymbol0 =
    pairData?.token0?.symbol.length > 6 ? pairData?.token0?.symbol.slice(0, 5) + '...' : pairData?.token0?.symbol;
  const formattedSymbol1 =
    pairData?.token1?.symbol.length > 6 ? pairData?.token1?.symbol.slice(0, 5) + '...' : pairData?.token1?.symbol;

  // const below1600 = useMedia('(max-width: 1600px)');
  // const below1080 = useMedia('(max-width: 1080px)');
  const below600 = useMedia('(max-width: 600px)');

  return (
    <ChartWrapper>
      {below600 ? (
        <Flex justifyContent={'space-between'} mb={40}>
          <DropdownBasicSelect options={CHART_VIEW} active={chartFilter} setActive={setChartFilter} />
          <DropdownBasicSelect options={TIME_FILTER_OPTIONS} active={activeFilter} setActive={setActiveFilter} />
        </Flex>
      ) : (
        <Flex mb={20} justifyContent={'space-between'}>
          <Flex style={{ gap: '6px' }}>
            <ChartTypeButton
              isActive={chartFilter === CHART_VIEW.LIQUIDITY}
              onClick={() => setChartFilter(CHART_VIEW.LIQUIDITY)}
            >
              <Typography.Text>TVL</Typography.Text>
            </ChartTypeButton>
            <ChartTypeButton
              isActive={chartFilter === CHART_VIEW.VOLUME}
              onClick={() => {
                setChartFilter(CHART_VIEW.VOLUME);
              }}
            >
              <Typography.Text>VOLUME</Typography.Text>
            </ChartTypeButton>
            <ChartTypeButton
              isActive={chartFilter === CHART_VIEW.UTILIZATION}
              onClick={() => {
                setChartFilter(CHART_VIEW.UTILIZATION);
              }}
            >
              <Typography.Text>UTILIZATION</Typography.Text>
            </ChartTypeButton>
            {pairData.token0 ? (
              <ChartTypeButton
                isActive={chartFilter === CHART_VIEW.RATE0}
                onClick={() => {
                  setChartFilter(CHART_VIEW.RATE0);
                }}
              >
                <Typography.Text>{formattedSymbol1 + '-' + formattedSymbol0}</Typography.Text>
              </ChartTypeButton>
            ) : (
              <Skeleton style={{ width: '70px', height: '22px' }} />
            )}
            {pairData.token0 ? (
              <ChartTypeButton
                isActive={chartFilter === CHART_VIEW.RATE1}
                onClick={() => {
                  setChartFilter(CHART_VIEW.RATE1);
                }}
              >
                <Typography.Text>{formattedSymbol0 + '-' + formattedSymbol1}</Typography.Text>
              </ChartTypeButton>
            ) : (
              <Skeleton style={{ width: '70px', height: '22px' }} />
            )}
          </Flex>
          <div>
            <RadioTimeFilter options={TIME_FILTER_OPTIONS} activeValue={activeFilter} onChange={setActiveFilter} />
          </div>
        </Flex>
      )}
      {chartFilter === CHART_VIEW.LIQUIDITY && (
        <PanelLoaderWrapper isLoading={!formattedLiquidityData}>
          <Chart
            data={formattedLiquidityData}
            showTimeFilter={false}
            overridingActiveFilter={activeFilter}
            type={'AREA'}
            tooltipTitle={'Liquidity'}
          />
        </PanelLoaderWrapper>
      )}
      {chartFilter === CHART_VIEW.VOLUME && (
        <PanelLoaderWrapper isLoading={!formattedVolumeData}>
          <Chart
            data={formattedVolumeData}
            showTimeFilter={false}
            overridingActiveFilter={activeFilter}
            type={'BAR'}
            tooltipTitle={'Volume'}
          />
        </PanelLoaderWrapper>
      )}
      {chartFilter === CHART_VIEW.UTILIZATION && (
        <PanelLoaderWrapper isLoading={!formattedUtilizationData}>
          <Chart
            data={formattedUtilizationData}
            showTimeFilter={false}
            overridingActiveFilter={activeFilter}
            type={'AREA'}
            tooltipTitle={'Utilization'}
          />
        </PanelLoaderWrapper>
      )}
      {chartFilter === CHART_VIEW.RATE1 &&
        (formattedPriceDataRate1 ? (
          <PanelLoaderWrapper isLoading={formattedPriceDataRate1.length === 0}>
            <CandleStickChart
              data={formattedPriceDataRate1}
              currentPrice={base0}
              overridingActiveFilter={activeFilter}
              showTimeFilter={false}
              isHourlyData={isHourlyPriceData}
            />
          </PanelLoaderWrapper>
        ) : (
          <LocalLoader />
        ))}
      {chartFilter === CHART_VIEW.RATE0 &&
        (formattedPriceDataRate0 ? (
          <PanelLoaderWrapper isLoading={formattedPriceDataRate0.length === 0}>
            <CandleStickChart
              data={formattedPriceDataRate0}
              currentPrice={base1}
              overridingActiveFilter={activeFilter}
              showTimeFilter={false}
              isHourlyData={isHourlyPriceData}
            />
          </PanelLoaderWrapper>
        ) : (
          <LocalLoader />
        ))}
    </ChartWrapper>
  );
};

export default PairChart;
