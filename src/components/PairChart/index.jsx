import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { useState, useMemo } from 'react';
import Skeleton from 'react-loading-skeleton';
import { Flex } from 'rebass';

import { Typography } from '../../Theme';
import { timeframeOptions, TIME_FILTER_OPTIONS } from '../../constants';
import { usePairChartData, usePairData, usePairRateData } from '../../contexts/PairData';
import { useIsBelowPx } from '../../hooks/useIsBelowPx';
import CandleStickChart from '../CandleStickChart';
import Chart from '../Chart';
import LocalLoader from '../LocalLoader';
import Panel from '../Panel';
import RadioTimeFilter from '../RadioTimeFilter';
import { ChartTypeButton } from '../TokenChart/styled';
import { ChartWrapper } from './styled';

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

  const below600 = useIsBelowPx(600);

  return (
    <ChartWrapper>
      <Flex mb={20} justifyContent={'space-between'} flexDirection={below600 ? 'column' : 'row'} style={{ gap: '8px' }}>
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
          {!below600 && (
            <ChartTypeButton
              isActive={chartFilter === CHART_VIEW.UTILIZATION}
              onClick={() => {
                setChartFilter(CHART_VIEW.UTILIZATION);
              }}
            >
              <Typography.Text>UTILIZATION</Typography.Text>
            </ChartTypeButton>
          )}
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
          {!below600 && (
            <>
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
            </>
          )}
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
            dataType={'PERCENTAGE'}
            showTimeFilter={false}
            overridingActiveFilter={activeFilter}
            type={'AREA'}
            isCurrency={false}
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

PairChart.propTypes = {
  address: PropTypes.string,
  base0: PropTypes.number,
  base1: PropTypes.number,
};

export default PairChart;
