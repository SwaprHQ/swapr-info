import dayjs from 'dayjs';
import { PropTypes } from 'prop-types';
import { useMemo } from 'react';

import { useUserLiquidityChart } from '../../contexts/User';
import Chart from '../Chart';
import LocalLoader from '../LocalLoader';
import Panel from '../Panel';

const PanelLoaderWrapper = ({ isLoading, children }) => (
  <Panel style={{ border: 'none', padding: '0' }}>{isLoading ? <LocalLoader /> : children}</Panel>
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
    <PanelLoaderWrapper isLoading={!formattedLiquidityData}>
      <Chart data={formattedLiquidityData} showTimeFilter={true} type={'AREA'} tooltipTitle={'Fees'} />
    </PanelLoaderWrapper>
  );
};

UserLiquidityChart.propTypes = {
  account: PropTypes.string.isRequired,
};

export default UserLiquidityChart;
