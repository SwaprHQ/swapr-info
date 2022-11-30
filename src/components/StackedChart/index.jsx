import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import { Flex } from 'rebass';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Bar, ComposedChart, Legend } from 'recharts';

import { Typography } from '../../Theme';
import { NETWORK_COLORS, SupportedNetwork, STACKED_CHART_TIME_FILTER_OPTIONS } from '../../constants';
import { formattedPercent } from '../../utils';
import CrosshairTooltip from './CrosshairTooltip';
import { LegendItem } from './CrosshairTooltip/styled';
import Header from './Header';

const renderLegend = (props) => {
  const { payload } = props;

  return (
    <Flex style={{ display: 'flex', gap: '14px' }}>
      {payload.map((entry, index) => (
        <Flex key={`item-${index}`} style={{ alignItems: 'center' }}>
          <LegendItem color={entry.color} />
          <Typography.LargeText color={'text7'} sx={{ display: 'inline' }}>
            {entry.value}
          </Typography.LargeText>
        </Flex>
      ))}
    </Flex>
  );
};

const StackedChart = ({ title, type, data, dataType, defaultTimeFilter, showTimeFilter, formatActiveDate }) => {
  const [filteredData, setFilteredData] = useState(data);
  const [stackedDataValue, setStackedDataValue] = useState(null);
  const [activeDate, setActiveDate] = useState(null);
  const [activeFilter, setActiveFilter] = useState(defaultTimeFilter);
  const [dailyChange, setDailyChange] = useState();

  // set header values to the latest point of the chart
  const setDefaultHeaderValues = useCallback(() => {
    if (data && Object.keys(data).length > 0) {
      let pastStackedDataValue = 0;
      let currentStackedDataValue = 0;

      Object.keys(data[data.length - 1])
        .filter((key) => key !== 'time')
        .forEach((key) => {
          currentStackedDataValue += data[data.length - 1][key];
          pastStackedDataValue += data[data.length - 2][key];
        });

      const dailyChange =
        pastStackedDataValue > 0 ? ((currentStackedDataValue - pastStackedDataValue) / pastStackedDataValue) * 100 : 0;

      setActiveDate(data[data.length - 1].time);
      setDailyChange(dailyChange);
      setStackedDataValue(currentStackedDataValue);
    }
  }, [data]);

  // set header values to the current point of the chart
  const setCurrentStackedValue = (params) => {
    const { activePayload } = params;
    if (activePayload && activePayload.length) {
      const activeIndex = activePayload[0].payload.index;

      let currentStackedDataValue = 0;
      let pastStackedDataValue = 0;

      activePayload
        .filter((series) => series.value)
        .forEach((series) => {
          currentStackedDataValue += series.value;
        });

      // get the previous day data
      const oneDayOldData = filteredData[activeIndex === 0 ? activeIndex : activeIndex - 1];

      if (oneDayOldData) {
        Object.keys(oneDayOldData)
          .filter((key) => key !== 'time')
          .forEach((key) => {
            pastStackedDataValue += oneDayOldData[key];
          });
      }

      // avoid getting infinity by dividing by 0
      if (pastStackedDataValue > 0) {
        const dailyChange = ((currentStackedDataValue - pastStackedDataValue) / pastStackedDataValue) * 100;

        setDailyChange(dailyChange);
      } else {
        setDailyChange(0);
      }

      setActiveDate(activePayload.find((series) => series).payload.time);
      setStackedDataValue(currentStackedDataValue);
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

      switch (activeFilter) {
        case STACKED_CHART_TIME_FILTER_OPTIONS.MONTH_1: {
          limitDate.setMonth(limitDate.getMonth() - 1);
          break;
        }
        case STACKED_CHART_TIME_FILTER_OPTIONS.MONTH_3: {
          limitDate.setMonth(limitDate.getMonth() - 3);
          break;
        }
        case STACKED_CHART_TIME_FILTER_OPTIONS.YEAR: {
          limitDate.setFullYear(limitDate.getFullYear() - 1);
          break;
        }
        default: {
          limitDate.setMonth(limitDate.getMonth() - 1);
          break;
        }
      }

      // add index to the chart data in order to properly obtain
      // % changes between values
      setFilteredData(
        data
          .filter((data) => new Date(data.time).getTime() > limitDate.getTime())
          .map((data, index) => ({ ...data, index })),
      );
    }
  }, [data, activeFilter]);

  return (
    <>
      <Header
        title={title}
        value={stackedDataValue}
        dataType={dataType}
        showTimeFilter={showTimeFilter}
        dailyChange={formattedPercent(dailyChange)}
        formatActiveDate={formatActiveDate}
        date={activeDate}
        activeFilter={activeFilter}
        filterOptions={STACKED_CHART_TIME_FILTER_OPTIONS}
        onFilterChange={setActiveFilter}
      />
      <ResponsiveContainer height={'100%'}>
        {type === 'AREA' ? (
          <AreaChart
            className={'basic-chart'}
            onMouseMove={setCurrentStackedValue}
            onMouseLeave={setDefaultHeaderValues}
            data={filteredData}
            margin={{ top: 5 }}
          >
            <defs>
              <linearGradient id={'xdai'} x1={'1'} y1={'0'} x2={'1'} y2={'1'}>
                <stop offset={'10%'} stopColor={NETWORK_COLORS[SupportedNetwork.XDAI]} stopOpacity={1} />
                <stop offset={'80%'} stopColor={NETWORK_COLORS[SupportedNetwork.XDAI]} stopOpacity={0.4} />
              </linearGradient>
              <linearGradient id={'mainnet'} x1={'1'} y1={'0'} x2={'1'} y2={'1'}>
                <stop offset={'10%'} stopColor={NETWORK_COLORS[SupportedNetwork.MAINNET]} stopOpacity={1} />
                <stop offset={'80%'} stopColor={NETWORK_COLORS[SupportedNetwork.MAINNET]} stopOpacity={0.4} />
              </linearGradient>
              <linearGradient id={'arbitrum'} x1={'1'} y1={'0'} x2={'1'} y2={'1'}>
                <stop offset={'10%'} stopColor={NETWORK_COLORS[SupportedNetwork.ARBITRUM_ONE]} stopOpacity={1} />
                <stop offset={'80%'} stopColor={NETWORK_COLORS[SupportedNetwork.ARBITRUM_ONE]} stopOpacity={0.4} />
              </linearGradient>
            </defs>
            <XAxis dataKey={'time'} hide />
            <YAxis hide />
            <Legend
              verticalAlign={'bottom'}
              align={'left'}
              iconType={'circle'}
              iconSize={10}
              fontSize={14}
              wrapperStyle={{
                paddingTop: 16,
              }}
              content={renderLegend}
            />
            <Tooltip isAnimationActive={false} content={<CrosshairTooltip dataType={dataType} />} />
            <Area
              animationDuration={500}
              type={'monotone'}
              dataKey={SupportedNetwork.MAINNET}
              stackId={'1'}
              stroke={NETWORK_COLORS[SupportedNetwork.MAINNET]}
              fill={'url(#mainnet)'}
              strokeWidth={3}
            />
            <Area
              animationDuration={500}
              type={'monotone'}
              dataKey={SupportedNetwork.ARBITRUM_ONE}
              stackId={'1'}
              stroke={NETWORK_COLORS[SupportedNetwork.ARBITRUM_ONE]}
              fill={'url(#arbitrum)'}
              strokeWidth={3}
            />
            <Area
              animationDuration={500}
              type={'monotone'}
              dataKey={SupportedNetwork.XDAI}
              stackId={'1'}
              stroke={NETWORK_COLORS[SupportedNetwork.XDAI]}
              fill={'url(#xdai)'}
              strokeWidth={3}
            />
          </AreaChart>
        ) : type === 'BAR' ? (
          <ComposedChart
            className={'basic-chart'}
            onMouseMove={setCurrentStackedValue}
            onMouseLeave={setDefaultHeaderValues}
            data={filteredData}
            throttleDelay={15}
            margin={{ top: 5 }}
          >
            <Legend
              verticalAlign={'bottom'}
              align={'left'}
              iconType={'circle'}
              iconSize={10}
              fontSize={14}
              wrapperStyle={{
                paddingTop: 16,
              }}
              content={renderLegend}
            />
            <XAxis dataKey={'time'} hide />
            <YAxis hide />
            <Tooltip isAnimationActive={false} content={<CrosshairTooltip />} />
            <Bar
              animationDuration={500}
              type={'monotone'}
              dataKey={SupportedNetwork.MAINNET}
              stackId={'1'}
              stroke={NETWORK_COLORS[SupportedNetwork.MAINNET]}
              fill={NETWORK_COLORS[SupportedNetwork.MAINNET]}
              strokeWidth={3}
            />
            <Bar
              animationDuration={500}
              type={'monotone'}
              dataKey={SupportedNetwork.ARBITRUM_ONE}
              stackId={'1'}
              stroke={NETWORK_COLORS[SupportedNetwork.ARBITRUM_ONE]}
              fill={NETWORK_COLORS[SupportedNetwork.ARBITRUM_ONE]}
              strokeWidth={3}
            />
            <Bar
              animationDuration={500}
              type={'monotone'}
              dataKey={SupportedNetwork.XDAI}
              stackId={'1'}
              stroke={NETWORK_COLORS[SupportedNetwork.XDAI]}
              fill={NETWORK_COLORS[SupportedNetwork.XDAI]}
              strokeWidth={3}
            />
          </ComposedChart>
        ) : null}
      </ResponsiveContainer>
    </>
  );
};

StackedChart.propTypes = {
  title: PropTypes.string.isRequired,
  data: PropTypes.any.isRequired,
  dataType: PropTypes.oneOf(['CURRENCY', 'PERCENTAGE', 'BASE']),
  showTimeFilter: PropTypes.bool,
  defaultTimeFilter: PropTypes.oneOf(['1M', '3M', '1Y']),
  type: PropTypes.oneOf(['BAR', 'AREA']).isRequired,
  formatActiveDate: PropTypes.func,
};

StackedChart.defaultProps = {
  type: 'AREA',
  data: [],
  dataType: 'CURRENCY',
  defaultTimeFilter: '1M',
  showTimeFilter: true,
};

export default StackedChart;
