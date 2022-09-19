import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import { useMedia } from 'react-use';
import { Area, AreaChart, Bar, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useTheme } from 'styled-components';

import { TIME_FILTER_OPTIONS } from '../../constants';
import { formattedPercent, getWeekFormattedDate } from '../../utils';
import CrosshairTooltip from './CrosshairTooltip';
import Header from './Header';

dayjs.extend(isoWeek);

const getFilterLimitDate = (timeFilter) => {
  let limitDate = new Date();

  switch (timeFilter) {
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

  return limitDate;
};

const getWeeklyAggregatedData = (limitDate, data) => {
  const rawWeeklyAggregatedData = data
    .filter((data) => new Date(data.time).getTime() > limitDate.getTime())
    .reduce(
      (previous, current) => ({
        ...previous,
        [dayjs(current.time).isoWeek()]: previous[dayjs(current.time).isoWeek()]
          ? previous[dayjs(current.time).isoWeek()] + current.value
          : current.value,
      }),
      {},
    );

  let weeklyAggregatedData = [];

  Object.keys(rawWeeklyAggregatedData).forEach((weekNumber) => {
    weeklyAggregatedData.push({
      time: dayjs().isoWeek(weekNumber).format('YYYY-MM-DD'),
      value: rawWeeklyAggregatedData[weekNumber],
    });
  });

  return weeklyAggregatedData;
};

const Chart = ({ title, tooltipTitle, data, type, dataType, overridingActiveFilter, showTimeFilter }) => {
  const theme = useTheme();
  const [filteredData, setFilteredData] = useState(data);
  const [headerValue, setHeaderValue] = useState(null);
  const [activeDate, setActiveDate] = useState(null);
  const [activeFilter, setActiveFilter] = useState(TIME_FILTER_OPTIONS.MONTH_1);
  const [dailyChange, setDailyChange] = useState();
  const [isWeeklyActive, setIsWeeklyActive] = useState(false);

  const below500 = useMedia('(max-width: 500px)');

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
    const { activePayload } = params;
    if (activePayload && activePayload.length) {
      const { time, value, index } = activePayload[0].payload;

      // get previous data
      const oldData = filteredData[index !== 0 ? index - 1 : index];

      // avoid getting infinity by dividing by 0
      if (oldData?.value > 0) {
        const dailyChange = ((value - oldData.value) / oldData.value) * 100;

        setDailyChange(dailyChange);
      } else {
        setDailyChange(0);
      }

      setActiveDate(time);
      setHeaderValue(value);
    }
  };

  useEffect(() => {
    const limitDate = getFilterLimitDate(overridingActiveFilter ?? activeFilter);

    if (isWeeklyActive) {
      setFilteredData(getWeeklyAggregatedData(limitDate, data));
    } else {
      setFilteredData(
        data
          .filter((data) => new Date(data.time).getTime() > limitDate.getTime())
          .map((data, index) => ({ ...data, index })),
      );
    }
  }, [data, activeFilter, isWeeklyActive, overridingActiveFilter]);

  // set default filtered data
  useEffect(() => {
    if (filteredData && filteredData.length > 0) {
      setDefaultHeaderValues();
    }
  }, [filteredData, setDefaultHeaderValues]);

  // update filtered data on time filter change
  useEffect(() => {
    if (data && data.length > 0) {
      const limitDate = getFilterLimitDate(overridingActiveFilter ?? activeFilter);

      if (isWeeklyActive && activeFilter !== TIME_FILTER_OPTIONS.WEEK) {
        const weeklyData = getWeeklyAggregatedData(limitDate, data);
        setFilteredData(
          weeklyData
            .filter((data) => new Date(data.time).getTime() > limitDate.getTime())
            .map((data, index) => ({ ...data, index })),
        );
      } else {
        setIsWeeklyActive(false);
      }
    }
  }, [data, overridingActiveFilter, activeFilter, isWeeklyActive]);

  return (
    <>
      <Header
        title={title}
        value={headerValue}
        dataType={dataType}
        showTimeFilter={showTimeFilter}
        dailyChange={formattedPercent(dailyChange)}
        date={isWeeklyActive ? getWeekFormattedDate(activeDate, below500) : dayjs(activeDate).format('MMMM D, YYYY')}
        activeFilter={activeFilter}
        isWeeklyActive={isWeeklyActive}
        filterOptions={TIME_FILTER_OPTIONS}
        onFilterChange={setActiveFilter}
        onWeeklyToggle={() => setIsWeeklyActive((previousValue) => !previousValue)}
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
              content={<CrosshairTooltip title={tooltipTitle || title} isWeeklyActive={isWeeklyActive} />}
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
              content={<CrosshairTooltip title={tooltipTitle || title} isWeeklyActive={isWeeklyActive} />}
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
  dataType: PropTypes.oneOf(['CURRENCY', 'PERCENTAGE']),
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
