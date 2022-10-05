import dayjs from 'dayjs';
import { PropTypes } from 'prop-types';
import { useMemo } from 'react';
import styled from 'styled-components';

import { useUserLiquidityChart } from '../../contexts/User';
import Chart from '../Chart';
import LocalLoader from '../LocalLoader';
import Panel from '../Panel';

const ChartWrapper = styled.div`
  height: 100%;
  min-height: 340px;

  @media screen and (max-width: 600px) {
    min-height: 200px;
  }
`;

const PanelLoaderWrapper = ({ isLoading, children }) => (
  <Panel minHeight={'340px'} style={{ border: 'none', padding: '0' }}>
    {isLoading ? <LocalLoader /> : children}
  </Panel>
);

const UserLiquidityChart = ({ account }) => {
  // get data for pair, and rates
  const userLiquidityData = useUserLiquidityChart(account);

  // format liquidity values
  const { formattedLiquidityData } = useMemo(
    () => ({
      formattedLiquidityData: userLiquidityData?.map((data) => ({
        time: dayjs.unix(data.date).format('YYYY-MM-DD'),
        value: parseFloat(data.valueUSD),
      })),
    }),
    [userLiquidityData],
  );

  return (
    <ChartWrapper>
      <PanelLoaderWrapper isLoading={!formattedLiquidityData}>
        <Chart data={formattedLiquidityData} showTimeFilter={true} type={'AREA'} tooltipTitle={'Fees'} />
      </PanelLoaderWrapper>
    </ChartWrapper>
  );
};

UserLiquidityChart.propTypes = {
  account: PropTypes.string.isRequired,
};

export default UserLiquidityChart;
