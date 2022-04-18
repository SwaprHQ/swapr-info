import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Bar, ComposedChart, Legend } from 'recharts';

import { TYPE } from '../../Theme';
import { SupportedNetwork } from '../../constants';
import { formattedNum, formattedPercent } from '../../utils';
import CrosshairTooltip from './CrosshairTooltip';
import Header from './Header';

const TIME_FILTER_OPTIONS = {
  MONTH_1: '1M',
  MONTH_3: '3M',
  YEAR: '1Y',
};
const NETWORK_COLORS = {
  [SupportedNetwork.MAINNET]: '#2974e0',
  [SupportedNetwork.XDAI]: '#4526A2',
  [SupportedNetwork.ARBITRUM_ONE]: '#feb125',
};
const LegendItem = (value) => (
  <TYPE.light color="text1" as="span">
    {value}
  </TYPE.light>
);

const StackedChart = ({ title, type, data }) => {
  const [filteredData, setFilteredData] = useState(data);
  const [stackedDataValue, setStackedDataValue] = useState(null);
  const [activeDate, setActiveDate] = useState(null);
  const [activeFilter, setActiveFilter] = useState(TIME_FILTER_OPTIONS.MONTH_1);
  const [dailyChange, setDailyChange] = useState();

  // set header values to the latest point of the chart
  const setDefaultHeaderValues = useCallback(() => {
    let pastStackedDataValue = 0;
    let currentStackedDataValue = 0;

    Object.keys(data[data.length - 1])
      .filter((key) => key !== 'time')
      .forEach((key) => {
        currentStackedDataValue += data[data.length - 1][key];
        pastStackedDataValue += data[data.length - 2][key];
      });

    const dailyChange = ((currentStackedDataValue - pastStackedDataValue) / pastStackedDataValue) * 100;

    setDailyChange(dailyChange);
    setActiveDate(data[data.length - 1].time);
    setStackedDataValue(currentStackedDataValue);
  }, [data]);

  // set header values to the current point of the chart
  const setCurrentStackedValue = (params) => {
    const { activePayload, activeLabel } = params;
    if (activePayload && activePayload.length) {
      let currentStackedDataValue = 0;
      let pastStackedDataValue = 0;

      activePayload
        .filter((series) => series.value)
        .forEach((series) => {
          currentStackedDataValue += series.value;
        });

      // get the previous day data by subtracting
      // one day from the active label
      // (the label is the actual date in the YYYY-MM-DD format)
      const oneDayOldDate = new Date(activeLabel);
      oneDayOldDate.setDate(oneDayOldDate.getDate() - 1);
      const oneDayOldData = filteredData.find((data) => data.time === dayjs(oneDayOldDate).format('YYYY-MM-DD'));

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
        case TIME_FILTER_OPTIONS.MONTH_1: {
          limitDate.setMonth(limitDate.getMonth() - 1);
          break;
        }
        case TIME_FILTER_OPTIONS.MONTH_3: {
          limitDate.setMonth(limitDate.getMonth() - 3);
          break;
        }
        case TIME_FILTER_OPTIONS.YEAR: {
          limitDate.setFullYear(limitDate.getFullYear() - 1);
          break;
        }
        default: {
          limitDate.setFullYear(limitDate.getMonth() - 1);
          break;
        }
      }

      setFilteredData(data.filter((data) => new Date(data.time).getTime() > limitDate.getTime()));
    }
  }, [data, activeFilter]);

  return (
    <>
      <Header
        title={title}
        value={formattedNum(stackedDataValue)}
        dailyChange={formattedPercent(dailyChange)}
        date={dayjs(activeDate).format('MMMM D, YYYY')}
        activeFilter={activeFilter}
        filterOptions={TIME_FILTER_OPTIONS}
        onFilterChange={setActiveFilter}
      />
      <ResponsiveContainer maxHeight={400} maxWith={500} minHeight={300}>
        {type === 'AREA' ? (
          <AreaChart
            className="basic-chart"
            onMouseMove={setCurrentStackedValue}
            onMouseLeave={setDefaultHeaderValues}
            data={filteredData}
            margin={{ top: 5 }}
          >
            <defs>
              <linearGradient id="xdai" x1="1" y1="0" x2="1" y2="1">
                <stop offset="10%" stopColor={NETWORK_COLORS[SupportedNetwork.XDAI]} stopOpacity={1} />
                <stop offset="90%" stopColor={NETWORK_COLORS[SupportedNetwork.XDAI]} stopOpacity={0.4} />
              </linearGradient>
              <linearGradient id="mainnet" x1="1" y1="0" x2="1" y2="1">
                <stop offset="10%" stopColor={NETWORK_COLORS[SupportedNetwork.MAINNET]} stopOpacity={1} />
                <stop offset="90%" stopColor={NETWORK_COLORS[SupportedNetwork.MAINNET]} stopOpacity={0.4} />
              </linearGradient>
              <linearGradient id="arbitrum" x1="1" y1="0" x2="1" y2="1">
                <stop offset="10%" stopColor={NETWORK_COLORS[SupportedNetwork.ARBITRUM_ONE]} stopOpacity={1} />
                <stop offset="90%" stopColor={NETWORK_COLORS[SupportedNetwork.ARBITRUM_ONE]} stopOpacity={0.4} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" hide />
            <YAxis hide />
            <Legend
              verticalAlign="top"
              align="left"
              iconType="circle"
              iconSize={10}
              fontSize={14}
              formatter={LegendItem}
            />
            <Tooltip isAnimationActive={false} content={<CrosshairTooltip />} />
            <Area
              animationDuration={500}
              type="monotone"
              dataKey={SupportedNetwork.XDAI}
              stackId="1"
              stroke={NETWORK_COLORS[SupportedNetwork.XDAI]}
              fill="url(#xdai)"
              strokeWidth={3}
            />
            <Area
              animationDuration={500}
              type="monotone"
              dataKey={SupportedNetwork.MAINNET}
              stackId="1"
              stroke={NETWORK_COLORS[SupportedNetwork.MAINNET]}
              fill="url(#mainnet)"
              strokeWidth={3}
            />
            <Area
              animationDuration={500}
              type="monotone"
              dataKey={SupportedNetwork.ARBITRUM_ONE}
              stackId="1"
              stroke={NETWORK_COLORS[SupportedNetwork.ARBITRUM_ONE]}
              fill="url(#arbitrum)"
              strokeWidth={3}
            />
          </AreaChart>
        ) : type === 'BAR' ? (
          <ComposedChart
            className="basic-chart"
            onMouseMove={setCurrentStackedValue}
            onMouseLeave={setDefaultHeaderValues}
            data={filteredData}
            throttleDelay={15}
            margin={{ top: 5 }}
          >
            <Legend
              verticalAlign="top"
              align="left"
              iconType="circle"
              iconSize={10}
              fontSize={14}
              formatter={LegendItem}
            />
            <XAxis dataKey="time" hide />
            <YAxis hide />
            <Tooltip isAnimationActive={false} content={<CrosshairTooltip />} />
            <Bar
              animationDuration={500}
              type="monotone"
              dataKey={SupportedNetwork.XDAI}
              stackId="1"
              stroke={NETWORK_COLORS[SupportedNetwork.XDAI]}
              fill={NETWORK_COLORS[SupportedNetwork.XDAI]}
              strokeWidth={3}
            />
            <Bar
              animationDuration={500}
              type="monotone"
              dataKey={SupportedNetwork.MAINNET}
              stackId="1"
              stroke={NETWORK_COLORS[SupportedNetwork.MAINNET]}
              fill={NETWORK_COLORS[SupportedNetwork.MAINNET]}
              strokeWidth={3}
            />
            <Bar
              animationDuration={500}
              type="monotone"
              dataKey={SupportedNetwork.ARBITRUM_ONE}
              stackId="1"
              stroke={NETWORK_COLORS[SupportedNetwork.ARBITRUM_ONE]}
              fill={NETWORK_COLORS[SupportedNetwork.ARBITRUM_ONE]}
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
  type: PropTypes.oneOf(['BAR', 'AREA']).isRequired,
};

StackedChart.defaultProps = {
  type: 'AREA',
  data: [],
};

export default StackedChart;
