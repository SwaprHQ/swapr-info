import dayjs from 'dayjs';
import { useState, useEffect, useMemo } from 'react';
import { usePrevious } from 'react-use';
import { Flex } from 'rebass';

import { Typography } from '../../Theme';
import { timeframeOptions, TIME_FILTER_OPTIONS } from '../../constants';
import { useTokenChartData, useTokenPriceData } from '../../contexts/TokenData';
import CandleStickChart from '../CandleStickChart';
import Chart from '../Chart';
import LocalLoader from '../LocalLoader';
import Panel from '../Panel';
import RadioTimeFilter from '../RadioTimeFilter';
import { ChartWrapper, ChartTypeButton } from './styled';

const CHART_VIEW = {
  VOLUME: 'Volume',
  LIQUIDITY: 'Liquidity',
  PRICE: 'Price',
};

const PanelLoaderWrapper = ({ isLoading, children }) => (
  <Panel minHeight={'340px'} maxHeight={'340px'} style={{ border: 'none', padding: '0' }}>
    {isLoading ? <LocalLoader /> : children}
  </Panel>
);

const TokenChart = ({ address, base }) => {
  const [chartFilter, setChartFilter] = useState(CHART_VIEW.PRICE);
  const [activeFilter, setActiveFilter] = useState(TIME_FILTER_OPTIONS.WEEK);
  const [isHourlyPriceData, setIsHourlyPriceData] = useState(false);

  const addressPrev = usePrevious(address);
  const volumeAndLiquidityData = useTokenChartData(address);
  const dailyYearPriceData = useTokenPriceData(address, timeframeOptions.YEAR, 86400);
  const weeklyHourlyPriceData = useTokenPriceData(address, timeframeOptions.WEEK, 14400);

  useEffect(() => {
    if (address !== addressPrev && addressPrev) {
      setChartFilter(CHART_VIEW.LIQUIDITY);
    }
  }, [address, addressPrev]);

  // format data values
  const { formattedLiquidityData, formattedVolumeData } = useMemo(() => {
    return {
      formattedLiquidityData: volumeAndLiquidityData?.map((data) => ({
        time: dayjs(data.date * 1000).format('YYYY-MM-DD'),
        value: parseFloat(data.totalLiquidityUSD),
      })),
      formattedVolumeData: volumeAndLiquidityData?.map((data) => ({
        time: dayjs(data.date * 1000).format('YYYY-MM-DD'),
        value: parseFloat(data.dailyVolumeUSD),
      })),
    };
  }, [volumeAndLiquidityData]);

  // format prices values
  const { formattedPriceData } = useMemo(() => {
    if (activeFilter === TIME_FILTER_OPTIONS.WEEK) {
      setIsHourlyPriceData(true);

      return {
        formattedPriceData: weeklyHourlyPriceData?.map((data) => ({
          time: dayjs(data.timestamp * 1000).format('YYYY-MM-DD HH:mm'),
          open: parseFloat(data.open),
          close: parseFloat(data.close),
        })),
      };
    }

    setIsHourlyPriceData(false);

    return {
      formattedPriceData: dailyYearPriceData?.map((data) => ({
        time: dayjs(data.timestamp * 1000).format('YYYY-MM-DD'),
        open: parseFloat(data.open),
        close: parseFloat(data.close),
      })),
    };
  }, [dailyYearPriceData, weeklyHourlyPriceData, activeFilter]);

  return (
    <ChartWrapper>
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
            onClick={() => setChartFilter(CHART_VIEW.VOLUME)}
          >
            <Typography.Text>VOLUME</Typography.Text>
          </ChartTypeButton>
          <ChartTypeButton
            isActive={chartFilter === CHART_VIEW.PRICE}
            onClick={() => {
              setChartFilter(CHART_VIEW.PRICE);
            }}
          >
            <Typography.Text>PRICE</Typography.Text>
          </ChartTypeButton>
        </Flex>
        <div>
          <RadioTimeFilter options={TIME_FILTER_OPTIONS} activeValue={activeFilter} onChange={setActiveFilter} />
        </div>
      </Flex>
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
      {chartFilter === CHART_VIEW.PRICE && (
        <PanelLoaderWrapper isLoading={!formattedPriceData || (!base && base !== 0)}>
          <CandleStickChart
            data={formattedPriceData}
            currentPrice={base}
            showTimeFilter={false}
            overridingActiveFilter={activeFilter}
            isHourlyData={isHourlyPriceData}
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
    </ChartWrapper>
  );
};

export default TokenChart;
