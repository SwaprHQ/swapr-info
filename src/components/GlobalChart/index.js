import React, { useState, useMemo, memo } from 'react';
import isEqual from 'react-fast-compare';
import { useMedia } from 'react-use';
import { ResponsiveContainer } from 'recharts';

import { TYPE } from '../../Theme';
import { timeframeOptions } from '../../constants';
import { getTimeframe } from '../../utils';
import { OptionButton } from '../ButtonStyled';
import DropdownBasicSelect from '../DropdownBasicSelect';
import LocalLoader from '../LocalLoader';
import { RowFixed } from '../Row';
import TradingViewChart, { CHART_TYPES } from '../TradingviewChart';

const CHART_VIEW = {
  VOLUME: 'Volume',
  LIQUIDITY: 'Liquidity',
};

const VOLUME_WINDOW = {
  WEEKLY: 'WEEKLY',
  DAYS: 'DAYS',
};
const GlobalChart = ({
  display,
  totalLiquidityUSD,
  oneDayVolumeUSD,
  volumeChangeUSD,
  liquidityChangeUSD,
  oneWeekVolume,
  weeklyVolumeChange,
  dailyData,
  weeklyData,
}) => {
  // chart options
  const [chartView, setChartView] = useState(display === 'volume' ? CHART_VIEW.VOLUME : CHART_VIEW.LIQUIDITY);

  // time window and window size for chart
  const timeWindow = timeframeOptions.ALL_TIME;
  const [volumeWindow, setVolumeWindow] = useState(VOLUME_WINDOW.DAYS);

  // based on window, get starttim
  let utcStartTime = getTimeframe(timeWindow);

  const chartDataFiltered = useMemo(() => {
    let currentData = volumeWindow === VOLUME_WINDOW.DAYS ? dailyData : weeklyData;
    return (
      currentData &&
      Object.keys(currentData)
        ?.map((key) => {
          let item = currentData[key];
          if (item.date > utcStartTime) {
            return item;
          } else {
            return null;
          }
        })
        .filter((item) => {
          return !!item;
        })
    );
  }, [dailyData, utcStartTime, volumeWindow, weeklyData]);
  const below800 = useMedia('(max-width: 800px)');

  return chartDataFiltered ? (
    <>
      {below800 && (
        <DropdownBasicSelect options={CHART_VIEW} active={chartView} setActive={setChartView} color={'#4526A2'} />
      )}

      {chartDataFiltered && chartView === CHART_VIEW.LIQUIDITY && (
        <ResponsiveContainer aspect={60 / 28}>
          {dailyData ? (
            <TradingViewChart
              data={dailyData}
              base={totalLiquidityUSD}
              baseChange={liquidityChangeUSD}
              title="Liquidity"
              field="totalLiquidityUSD"
              type={CHART_TYPES.AREA}
            />
          ) : (
            <LocalLoader />
          )}
        </ResponsiveContainer>
      )}
      {chartDataFiltered && chartView === CHART_VIEW.VOLUME && (
        <ResponsiveContainer aspect={60 / 28}>
          <TradingViewChart
            data={chartDataFiltered}
            base={volumeWindow === VOLUME_WINDOW.WEEKLY ? oneWeekVolume : oneDayVolumeUSD}
            baseChange={volumeWindow === VOLUME_WINDOW.WEEKLY ? weeklyVolumeChange : volumeChangeUSD}
            title={volumeWindow === VOLUME_WINDOW.WEEKLY ? 'Volume (7d)' : 'Volume'}
            field={volumeWindow === VOLUME_WINDOW.WEEKLY ? 'weeklyVolumeUSD' : 'dailyVolumeUSD'}
            type={CHART_TYPES.BAR}
            useWeekly={volumeWindow === VOLUME_WINDOW.WEEKLY}
          />
        </ResponsiveContainer>
      )}
      {display === 'volume' && (
        <RowFixed
          style={{
            bottom: '70px',
            position: 'absolute',
            left: '20px',
            zIndex: 2,
          }}
        >
          <OptionButton
            active={volumeWindow === VOLUME_WINDOW.DAYS}
            onClick={() => setVolumeWindow(VOLUME_WINDOW.DAYS)}
          >
            <TYPE.body>D</TYPE.body>
          </OptionButton>
          <OptionButton
            style={{ marginLeft: '4px' }}
            active={volumeWindow === VOLUME_WINDOW.WEEKLY}
            onClick={() => setVolumeWindow(VOLUME_WINDOW.WEEKLY)}
          >
            <TYPE.body>W</TYPE.body>
          </OptionButton>
        </RowFixed>
      )}
    </>
  ) : (
    ''
  );
};

export default memo(GlobalChart, isEqual);
