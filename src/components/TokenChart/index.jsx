import dayjs from 'dayjs';
import { useState, useEffect, useMemo } from 'react';
import { useMedia, usePrevious } from 'react-use';
import { Flex } from 'rebass';
import styled from 'styled-components';

import { timeframeOptions, TIME_FILTER_OPTIONS } from '../../constants';
import { useTokenChartData, useTokenPriceData } from '../../contexts/TokenData';
import { OptionButton } from '../ButtonStyled';
import CandleStickChart from '../CandleStickChart';
import Chart from '../Chart';
import DropdownBasicSelect from '../DropdownBasicSelect';
import LocalLoader from '../LocalLoader';
import Panel from '../Panel';
import RadioTimeFilter from '../RadioTimeFilter';

const ChartWrapper = styled.div`
  height: 100%;
  min-height: 300px;

  @media screen and (max-width: 600px) {
    min-height: 200px;
  }
`;

const CHART_VIEW = {
  VOLUME: 'Volume',
  LIQUIDITY: 'Liquidity',
  PRICE: 'Price',
};

const PARTIAL_TIME_FILTER_OPTIONS = {
  WEEK: TIME_FILTER_OPTIONS.WEEK,
  MONTH_1: TIME_FILTER_OPTIONS.MONTH_1,
};

const PanelLoaderWrapper = ({ isLoading, children }) => (
  <Panel minHeight={'320px'} maxHeight={'320px'} style={{ border: 'none', padding: '0' }}>
    {isLoading ? <LocalLoader /> : children}
  </Panel>
);

const TokenChart = ({ address, base }) => {
  const [chartFilter, setChartFilter] = useState(CHART_VIEW.PRICE);
  const [activeFilter, setActiveFilter] = useState(TIME_FILTER_OPTIONS.MONTH_1);
  const [isHourlyPriceData, setIsHourlyPriceData] = useState(false);

  const addressPrev = usePrevious(address);
  const volumeAndLiquidityData = useTokenChartData(address);
  const priceData = useTokenPriceData(address, timeframeOptions.MONTH, 86400);
  const weeklyHorlyPriceData = useTokenPriceData(address, timeframeOptions.WEEK, 14400);

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
        formattedPriceData: weeklyHorlyPriceData?.map((data) => ({
          time: dayjs(data.timestamp * 1000).format('YYYY-MM-DD, HH:mm'),
          open: parseFloat(data.open),
          close: parseFloat(data.close),
        })),
      };
    }

    setIsHourlyPriceData(false);

    return {
      formattedPriceData: priceData?.map((data) => ({
        time: dayjs(data.timestamp * 1000).format('YYYY-MM-DD'),
        open: parseFloat(data.open),
        close: parseFloat(data.close),
      })),
    };
  }, [priceData, weeklyHorlyPriceData, activeFilter]);

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
          <Flex>
            <OptionButton
              active={chartFilter === CHART_VIEW.LIQUIDITY}
              onClick={() => setChartFilter(CHART_VIEW.LIQUIDITY)}
              style={{ marginRight: '6px' }}
            >
              Liquidity
            </OptionButton>
            <OptionButton
              active={chartFilter === CHART_VIEW.VOLUME}
              onClick={() => setChartFilter(CHART_VIEW.VOLUME)}
              style={{ marginRight: '6px' }}
            >
              Volume
            </OptionButton>
            <OptionButton
              active={chartFilter === CHART_VIEW.PRICE}
              onClick={() => {
                setChartFilter(CHART_VIEW.PRICE);
              }}
            >
              Price
            </OptionButton>
          </Flex>
          <div>
            <RadioTimeFilter
              options={chartFilter === CHART_VIEW.PRICE ? PARTIAL_TIME_FILTER_OPTIONS : TIME_FILTER_OPTIONS}
              activeValue={activeFilter}
              onChange={setActiveFilter}
            />
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
      {chartFilter === CHART_VIEW.PRICE && (
        <PanelLoaderWrapper isLoading={!formattedPriceData}>
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
