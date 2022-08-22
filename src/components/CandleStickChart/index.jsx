import dayjs from 'dayjs';
import { PropTypes } from 'prop-types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CartesianGrid, XAxis, YAxis, Bar, ComposedChart, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useTheme } from 'styled-components';

import { TIME_FILTER_OPTIONS } from '../../constants';
import { formattedNum, formattedPercent } from '../../utils';
import CrosshairTooltip from './CrosshairTooltip';
import Header from './Header';

const CandleStickChart = ({
  data,
  currentPrice,
  title,
  tooltipTitle,
  showTimeFilter,
  isCurrency,
  isHourlyData,
  overridingActiveFilter,
}) => {
  const theme = useTheme();
  const [filteredData, setFilteredData] = useState([]);
  const [headerValue, setHeaderValue] = useState(currentPrice);
  const [activeDate, setActiveDate] = useState(null);
  const [dailyChange, setDailyChange] = useState();
  const [activeFilter, setActiveFilter] = useState(TIME_FILTER_OPTIONS.MONTH_1);

  const formattedCandlesData = useMemo(
    () =>
      data
        .filter((data) => data.close && data.open)
        .map((candle) => ({
          time: candle.time,
          low: Math.min(candle.open, candle.close),
          high: Math.max(candle.open, candle.close),
          height: Math.abs(candle.close - candle.open),
          up: candle.close > candle.open,
          constant: candle.close === candle.open,
        })),
    [data],
  );

  // set header values to the latest candle of the chart
  const setDefaultHeaderValues = useCallback(() => {
    if (formattedCandlesData && formattedCandlesData.length > 0) {
      const lastValue = formattedCandlesData[formattedCandlesData.length - 1];

      const currentHeaderValue = lastValue.up ? lastValue.high : lastValue.low;
      const pastHeaderValue = formattedCandlesData[formattedCandlesData.length - 2].high;

      const dailyChange = pastHeaderValue > 0 ? ((currentHeaderValue - pastHeaderValue) / pastHeaderValue) * 100 : 0;

      setDailyChange(dailyChange);
      setActiveDate(formattedCandlesData[formattedCandlesData.length - 1].time);
      setHeaderValue(currentPrice);
    }
  }, [formattedCandlesData, currentPrice]);

  // set header values to the current candle of the chart
  const setCurrentHeaderValues = (params) => {
    const { activePayload } = params;
    if (activePayload && activePayload.length) {
      const { time, high, low, up, index } = activePayload[0].payload;

      // get the previous data
      const oldData = filteredData[index !== 0 ? index - 1 : index];

      // if the change is positive it means it closed on a higher
      // value, so the high it's the current value, otherwise it's the lowest
      const currentValue = up ? high : low;
      const pastValue = oldData.up ? oldData.high : oldData.low;

      // avoid getting infinity by dividing by 0
      if (pastValue > 0) {
        const dailyChange = ((currentValue - pastValue) / pastValue) * 100;

        setDailyChange(dailyChange);
      } else {
        setDailyChange(0);
      }

      setActiveDate(time);
      setHeaderValue(up ? high : low);
    }
  };

  // set default filtered data
  useEffect(() => {
    if (filteredData && filteredData.length > 0) {
      setDefaultHeaderValues();
    }
  }, [filteredData, setDefaultHeaderValues]);

  // update filtered data on time filter change
  useEffect(() => {
    if (formattedCandlesData && formattedCandlesData.length > 0) {
      let limitDate = new Date();

      switch (overridingActiveFilter ?? activeFilter) {
        case TIME_FILTER_OPTIONS.WEEK: {
          limitDate.setDate(limitDate.getDate() - 7);
          break;
        }
        case TIME_FILTER_OPTIONS.MONTH_1: {
          limitDate.setMonth(limitDate.getMonth() - 1);
          break;
        }
        case TIME_FILTER_OPTIONS.YEAR: {
          limitDate.setFullYear(limitDate.getFullYear() - 1);
          break;
        }
        default: {
          limitDate.setFullYear(limitDate.getDate() - 7);
          break;
        }
      }

      // sort and add index to the chart data in order to properly obtain
      // % changes between values
      setFilteredData(
        formattedCandlesData
          .filter((data) => new Date(data.time).getTime() > limitDate.getTime())
          .map((data, index) => ({ ...data, index })),
      );
    }
  }, [formattedCandlesData, overridingActiveFilter, activeFilter]);

  const { low } = filteredData.length > 0 && filteredData.map((candle) => candle).sort((a, b) => a.low - b.low)[0];

  return (
    <>
      <Header
        title={title}
        value={formattedNum(headerValue, isCurrency)}
        isHourlyData={isHourlyData}
        showTimeFilter={showTimeFilter}
        dailyChange={formattedPercent(dailyChange)}
        date={dayjs(activeDate).format(isHourlyData ? 'MMMM D, YYYY HH:mm' : 'MMMM D, YYYY')}
        activeFilter={activeFilter}
        filterOptions={TIME_FILTER_OPTIONS}
        onFilterChange={setActiveFilter}
      />
      <ResponsiveContainer>
        <ComposedChart
          data={filteredData}
          onMouseMove={setCurrentHeaderValues}
          onMouseLeave={setDefaultHeaderValues}
          margin={{ top: 15 }}
        >
          <CartesianGrid horizontal={false} vertical={false} />
          <XAxis hide dataKey={'time'} />
          <YAxis hide domain={[low, 'auto']} allowDataOverflow={true} />
          <Tooltip
            isAnimationActive={false}
            isHourlyData={isHourlyData}
            content={<CrosshairTooltip title={tooltipTitle ?? 'Price'} isCurrency={isCurrency} />}
          />
          <Bar dataKey={'low'} stackId={'stack'} fillOpacity={0} />
          <Bar dataKey={'height'} stackId={'stack'} minPointSize={1}>
            {filteredData.map((candle) => (
              <Cell key={candle.time} fill={candle.up || candle.constant ? theme.green1 : theme.red1} />
            ))}
          </Bar>
        </ComposedChart>
      </ResponsiveContainer>
    </>
  );
};

CandleStickChart.propTypes = {
  title: PropTypes.string,
  data: PropTypes.any.isRequired,
  currentPrice: PropTypes.number,
  tooltipTitle: PropTypes.string,
  showTimeFilter: PropTypes.bool,
  isCurrency: PropTypes.bool,
  isHourlyData: PropTypes.bool,
};

CandleStickChart.defaultProps = {
  data: [],
  isCurrency: true,
  showTimeFilter: true,
  isHourlyData: false,
};

export default CandleStickChart;
