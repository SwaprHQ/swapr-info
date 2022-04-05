import dayjs from "dayjs";
import PropTypes from "prop-types";
import { useDebounce } from "react-use";
import React, { useCallback, useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Bar,
  ComposedChart,
} from "recharts";

import { SupportedNetwork } from "../../constants";
import { formattedNum, formattedPercent } from "../../utils";
import Header from "./Header";
import CrosshairTooltip from "./CrosshairTooltip";

const filterOptions = {
  MONTH_1: "1M",
  MONTH_3: "3M",
  YEAR: "1Y",
  MAX: "MAX",
};

const NETWORKS = [
  { name: SupportedNetwork.MAINNET, color: "#e5c914" },
  { name: SupportedNetwork.XDAI, color: "#4526A2" },
  { name: SupportedNetwork.ARBITRUM_ONE, color: "#1fc394" },
];

const StackedChart = ({ title, type, data }) => {
  const [filteredData, setFilteredData] = useState(data);
  const [stackedDataValue, setStackedDataValue] = useState(null);
  const [activeDate, setActiveDate] = useState(null);
  const [activeFilter, setActiveFilter] = useState(filterOptions.MONTH_1);
  const [dailyChange, setDailyChange] = useState();

  // set header values to the latest point of the chart
  const setDefaultHeaderValues = useCallback(() => {
    let pastStackedDataValue = 0;
    let currentStackedDataValue = 0;

    Object.keys(data[data.length - 1])
      .filter((key) => key !== "time")
      .forEach((key) => {
        currentStackedDataValue += data[data.length - 1][key];
        pastStackedDataValue += data[data.length - 2][key];
      });

    const dailyChange =
      ((currentStackedDataValue - pastStackedDataValue) /
        pastStackedDataValue) *
      100;

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
      const oneDayOldData = filteredData.find(
        (data) => data.time === dayjs(oneDayOldDate).format("YYYY-MM-DD")
      );

      if (oneDayOldData) {
        Object.keys(oneDayOldData)
          .filter((key) => key !== "time")
          .forEach((key) => {
            pastStackedDataValue += oneDayOldData[key];
          });
      }

      // avoid getting infinity by dividing by 0
      if (pastStackedDataValue > 0) {
        const dailyChange =
          ((currentStackedDataValue - pastStackedDataValue) /
            pastStackedDataValue) *
          100;

        setDailyChange(dailyChange);
      } else {
        setDailyChange(0);
      }

      setActiveDate(activePayload.find((series) => series).payload.time);
      setStackedDataValue(currentStackedDataValue);
    }
  };

  // set default filtered data on mount
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
        case filterOptions.MONTH_1: {
          limitDate.setMonth(limitDate.getMonth() - 1);
          break;
        }
        case filterOptions.MONTH_3: {
          limitDate.setMonth(limitDate.getMonth() - 3);
          break;
        }
        case filterOptions.YEAR: {
          limitDate.setFullYear(limitDate.getFullYear() - 1);
          break;
        }
        default: {
          // TODO: find a cleaner way
          limitDate.setFullYear(limitDate.getFullYear() - 10);
        }
      }

      setFilteredData(
        data.filter(
          (data) => new Date(data.time).getTime() > limitDate.getTime()
        )
      );
    }
  }, [data, activeFilter]);

  return (
    <>
      <Header
        title={title}
        value={formattedNum(stackedDataValue)}
        dailyChange={formattedPercent(dailyChange)}
        date={activeDate}
        activeFilter={activeFilter}
        filterOptions={filterOptions}
        onFilterChange={setActiveFilter}
      />
      <ResponsiveContainer aspect={60 / 28}>
        {type === "AREA" ? (
          <AreaChart
            className="basic-chart"
            onMouseMove={setCurrentStackedValue}
            onMouseLeave={setDefaultHeaderValues}
            width={500}
            height={400}
            data={filteredData}
            margin={{
              top: 10,
              right: 0,
              left: 0,
              bottom: 0,
            }}
          >
            <XAxis dataKey="time" hide />
            <YAxis hide />
            <Tooltip isAnimationActive={false} content={<CrosshairTooltip />} />
            <Area
              animationDuration={500}
              type="monotone"
              dataKey={SupportedNetwork.XDAI}
              stackId="1"
              stroke="#4526A2"
              fill="#4526A2"
            />
            <Area
              animationDuration={500}
              type="monotone"
              dataKey={SupportedNetwork.MAINNET}
              stackId="1"
              stroke="#e5c914"
              fill="#e5c914"
            />
            <Area
              animationDuration={500}
              type="monotone"
              dataKey={SupportedNetwork.ARBITRUM_ONE}
              stackId="1"
              stroke="#1fc394"
              fill="#1fc394"
            />
          </AreaChart>
        ) : type === "BAR" ? (
          <ComposedChart
            className="basic-chart"
            onMouseMove={setCurrentStackedValue}
            onMouseLeave={setDefaultHeaderValues}
            width={500}
            height={400}
            data={filteredData}
            margin={{
              top: 10,
              right: 0,
              left: 0,
              bottom: 0,
            }}
          >
            <XAxis dataKey="time" hide />
            <YAxis hide />
            <Tooltip isAnimationActive={false} content={<CrosshairTooltip />} />
            <Bar
              animationDuration={500}
              type="monotone"
              dataKey={SupportedNetwork.XDAI}
              stackId="1"
              stroke="#4526A2"
              fill="#4526A2"
            />
            <Bar
              animationDuration={500}
              type="monotone"
              dataKey={SupportedNetwork.MAINNET}
              stackId="1"
              stroke="#e5c914"
              fill="#e5c914"
            />
            <Bar
              animationDuration={500}
              type="monotone"
              dataKey={SupportedNetwork.ARBITRUM_ONE}
              stackId="1"
              stroke="#1fc394"
              fill="#1fc394"
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
  type: PropTypes.oneOf(["BAR", "AREA"]).isRequired,
};

StackedChart.defaultProps = {
  type: "AREA",
  data: [],
};

export default StackedChart;
