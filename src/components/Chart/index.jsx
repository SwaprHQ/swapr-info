import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import { Area, AreaChart, Bar, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useTheme } from 'styled-components';

import { TIME_FILTER_OPTIONS } from '../../constants';
import { formattedPercent } from '../../utils';
import CrosshairTooltip from './CrosshairTooltip';
import Header from './Header';

const Chart = ({ title, tooltipTitle, data, type, dataType, overridingActiveFilter, showTimeFilter }) => {
  const theme = useTheme();
  const [filteredData, setFilteredData] = useState(data);
  const [headerValue, setHeaderValue] = useState(null);
  const [activeDate, setActiveDate] = useState(null);
  const [activeFilter, setActiveFilter] = useState(TIME_FILTER_OPTIONS.MONTH_1);
  const [dailyChange, setDailyChange] = useState();

  // set header values to the latest point of the chart
  const setDefaultHeaderValues = useCallback(() => {
    if (data && Object.keys(data).length > 0) {
      let pastHeaderValue = 0;
      let currentHeaderValue = 0;

      Object.keys(data[data.length - 1])
        .filter((key) => key !== 'time')
        .forEach((key) => {
          currentHeaderValue += data[data.length - 1][key];
          pastHeaderValue += data[data.length - 2][key];
        });

      const dailyChange = pastHeaderValue > 0 ? ((currentHeaderValue - pastHeaderValue) / pastHeaderValue) * 100 : 0;

      setDailyChange(dailyChange);
      setActiveDate(data[data.length - 1].time);
      setHeaderValue(currentHeaderValue);
    }
  }, [data]);

  // set header values to the current point of the chart
  const setCurrentHeaderValues = (params) => {
    const { activePayload, activeLabel } = params;
    if (activePayload && activePayload.length) {
      const { time, value } = activePayload[0].payload;

      let pastValue = 0;

      // get the previous day data by subtracting
      // one day from the active label
      const oneDayOldDate = new Date(activeLabel);
      oneDayOldDate.setDate(oneDayOldDate.getDate() - 1);
      const oneDayOldData = filteredData.find(
        (data) => dayjs(data.time).format('YYYY-MM-DD') === dayjs(oneDayOldDate).format('YYYY-MM-DD'),
      );

      if (oneDayOldData) {
        Object.keys(oneDayOldData)
          .filter((key) => key !== 'time')
          .forEach((key) => {
            pastValue += oneDayOldData[key];
          });
      }

      // avoid getting infinity by dividing by 0
      if (pastValue > 0) {
        const dailyChange = ((value - pastValue) / pastValue) * 100;

        setDailyChange(dailyChange);
      } else {
        setDailyChange(0);
      }

      setActiveDate(time);
      setHeaderValue(value);
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
    if (data && data.length > 0) {
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
          limitDate.setDate(limitDate.getDate() - 7);
          break;
        }
      }

      setFilteredData(data.filter((data) => new Date(data.time).getTime() > limitDate.getTime()));
    }
  }, [data, overridingActiveFilter, activeFilter]);

  return (
    <>
      <Header
        title={title}
        value={headerValue}
        dataType={dataType}
        showTimeFilter={showTimeFilter}
        dailyChange={formattedPercent(dailyChange)}
        date={dayjs(activeDate).format('MMMM D, YYYY')}
        activeFilter={activeFilter}
        filterOptions={TIME_FILTER_OPTIONS}
        onFilterChange={setActiveFilter}
      />
      <ResponsiveContainer>
        {type === 'AREA' ? (
          <AreaChart
            className={'basic-chart'}
            onMouseMove={setCurrentHeaderValues}
            onMouseLeave={setDefaultHeaderValues}
            data={filteredData}
            margin={{ top: 5 }}
          >
            <defs>
              <linearGradient id={'base'} x1={'1'} y1={'0'} x2={'1'} y2={'1'}>
                <stop offset={'10%'} stopColor={theme.text7} stopOpacity={1} />
                <stop offset={'90%'} stopColor={theme.text7} stopOpacity={0.4} />
              </linearGradient>
            </defs>
            <XAxis hide dataKey={'time'} />
            <YAxis hide />
            <Tooltip
              isAnimationActive={false}
              content={<CrosshairTooltip title={tooltipTitle || title} />}
              dataType={dataType}
            />
            <Area
              animationDuration={500}
              type={'monotone'}
              strokeWidth={3}
              dataKey={'value'}
              stroke={theme.text7}
              fill={'url(#base)'}
            />
          </AreaChart>
        ) : type === 'BAR' ? (
          <ComposedChart
            className={'basic-chart'}
            onMouseMove={setCurrentHeaderValues}
            onMouseLeave={setDefaultHeaderValues}
            data={filteredData}
            throttleDelay={15}
            margin={{ top: 5 }}
          >
            <XAxis dataKey={'time'} hide />
            <YAxis hide />
            <Tooltip
              isAnimationActive={false}
              content={<CrosshairTooltip title={tooltipTitle || title} />}
              dataType={dataType}
            />
            <Bar
              animationDuration={500}
              type={'monotone'}
              strokeWidth={3}
              dataKey={'value'}
              stroke={theme.text7}
              fill={theme.text7}
              barGap={10}
            />
          </ComposedChart>
        ) : null}
      </ResponsiveContainer>
    </>
  );
};

Chart.propTypes = {
  title: PropTypes.string,
  tooltipTitle: PropTypes.string,
  data: PropTypes.any.isRequired,
  type: PropTypes.oneOf(['BAR', 'AREA']).isRequired,
  dataType: PropTypes.oneOf(['CURRENCY', 'PERCENTAGE']).isRequired,
  showTimeFilter: PropTypes.bool,
  overridingActiveFilter: PropTypes.oneOf(Object.values(TIME_FILTER_OPTIONS)),
  maxWith: PropTypes.number,
  minHeight: PropTypes.number,
};

Chart.defaultProps = {
  type: 'AREA',
  data: [],
  dataType: 'CURRENCY',
  showTimeFilter: true,
};

export default Chart;
