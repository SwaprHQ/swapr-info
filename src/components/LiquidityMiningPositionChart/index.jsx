import dayjs from 'dayjs';
import { PropTypes } from 'prop-types';
import { useState, useMemo } from 'react';
import { useMedia } from 'react-use';
import { Flex } from 'rebass';
import styled from 'styled-components';

import { Typography } from '../../Theme';
import { TIME_FILTER_OPTIONS } from '../../constants';
import { useUserPositionChart } from '../../contexts/User';
import Chart from '../Chart';
import LocalLoader from '../LocalLoader';
import Panel from '../Panel';
import RadioTimeFilter from '../RadioTimeFilter';
import { ChartTypeButton } from '../TokenChart/styled';

const ChartWrapper = styled.div`
  height: 100%;
  min-height: 340px;

  @media screen and (max-width: 600px) {
    min-height: 200px;
  }
`;

const CHART_VIEW = {
  LIQUIDITY: 'Liquidity',
  FEES: 'Fees',
};

const PanelLoaderWrapper = ({ isLoading, children }) => (
  <Panel minHeight={'340px'} maxHeight={'340px'} style={{ border: 'none', padding: '0' }}>
    {isLoading ? <LocalLoader /> : children}
  </Panel>
);

const LiquidityMiningPositionChart = ({ account, position }) => {
  const [chartFilter, setChartFilter] = useState(CHART_VIEW.LIQUIDITY);
  const [activeFilter, setActiveFilter] = useState(TIME_FILTER_OPTIONS.WEEK);

  // get data for pair, and rates
  const liquidityMiningPositionData = useUserPositionChart(position, account);

  // format liquidity and fees values
  const { formattedLiquidityData, formattedFeesData } = useMemo(
    () => ({
      formattedLiquidityData: liquidityMiningPositionData?.map((data) => ({
        time: dayjs.unix(data.date).format('YYYY-MM-DD'),
        value: parseFloat(data.usdValue),
      })),
      formattedFeesData: liquidityMiningPositionData?.map((data) => ({
        time: dayjs.unix(data.date).format('YYYY-MM-DD'),
        value: parseFloat(data.fees),
      })),
    }),
    [liquidityMiningPositionData],
  );

  const isBelow600px = useMedia('(max-width: 600px)');

  return (
    <ChartWrapper>
      <Flex
        mb={20}
        justifyContent={'space-between'}
        flexDirection={isBelow600px ? 'column' : 'row'}
        style={{ gap: '8px' }}
      >
        <Flex style={{ gap: '6px' }}>
          <ChartTypeButton
            isActive={chartFilter === CHART_VIEW.LIQUIDITY}
            onClick={() => setChartFilter(CHART_VIEW.LIQUIDITY)}
          >
            <Typography.Text>LIQUIDITY</Typography.Text>
          </ChartTypeButton>
          <ChartTypeButton
            isActive={chartFilter === CHART_VIEW.FEES}
            onClick={() => {
              setChartFilter(CHART_VIEW.FEES);
            }}
          >
            <Typography.Text>FEES</Typography.Text>
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
      {chartFilter === CHART_VIEW.FEES && (
        <PanelLoaderWrapper isLoading={!formattedFeesData}>
          <Chart
            data={formattedFeesData}
            showTimeFilter={false}
            overridingActiveFilter={activeFilter}
            type={'AREA'}
            tooltipTitle={'Fees'}
          />
        </PanelLoaderWrapper>
      )}
    </ChartWrapper>
  );
};

LiquidityMiningPositionChart.propTypes = {
  account: PropTypes.string.isRequired,
  position: PropTypes.object.isRequired,
};

export default LiquidityMiningPositionChart;
