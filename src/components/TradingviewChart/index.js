import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { createChart } from 'lightweight-charts';
import React, { useState, useEffect, useRef, memo } from 'react';
import isEqual from 'react-fast-compare';
import { Play } from 'react-feather';
import { usePrevious } from 'react-use';
import styled from 'styled-components';

import { IconWrapper } from '..';
import { useDarkModeManager } from '../../contexts/LocalStorage';
import useEventCallback from '../../hooks/useEventCallback';
import { formattedNum } from '../../utils';
import Tooltip from './Tooltip';

dayjs.extend(utc);

export const CHART_TYPES = {
  BAR: 'BAR',
  AREA: 'AREA',
};

const Wrapper = styled.div`
  position: relative;
`;

// constant height for charts
const HEIGHT = 300;
const InitialMouseOverValues = { dateStr: '', price: 0 };

const TradingViewChart = ({
  type = CHART_TYPES.BAR,
  data,
  base,
  baseChange,
  field,
  title,
  width,
  useWeekly = false,
}) => {
  // reference for DOM element to create with chart
  const ref = useRef();

  // pointer to the chart object
  const [chartCreated, setChartCreated] = useState(false);
  const dataPrev = usePrevious(data);
  const [mouseOverValues, setMouseOverValues] = useState(InitialMouseOverValues);

  useEffect(() => {
    if (data !== dataPrev && chartCreated && type === CHART_TYPES.BAR) {
      chartCreated.resize(0, 0);
      setChartCreated();
    }
  }, [chartCreated, data, dataPrev, type]);

  // parese the data and format for tardingview consumption
  const formattedData = data?.map((entry) => {
    return {
      time: dayjs.unix(entry.date).utc().format('YYYY-MM-DD'),
      value: parseFloat(entry[field]),
    };
  });

  const onMouseMove = useEventCallback((param, series) => {
    if (
      param !== undefined &&
      param.time !== undefined &&
      param.point.x > 0 &&
      param.point.x < width &&
      param.point.y > 0 &&
      param.point.y < HEIGHT
    ) {
      const dateStr = useWeekly
        ? dayjs(param.time.year + '-' + param.time.month + '-' + param.time.day)
            .startOf('week')
            .format('MMMM D, YYYY') +
          '-' +
          dayjs(param.time.year + '-' + param.time.month + '-' + param.time.day)
            .endOf('week')
            .format('MMMM D, YYYY')
        : dayjs(param.time.year + '-' + param.time.month + '-' + param.time.day).format('MMMM D, YYYY');

      const price = param.seriesPrices.get(series);

      setMouseOverValues({ dateStr, price });
    } else {
      setMouseOverValues(InitialMouseOverValues);
    }
  });

  // adjust the scale based on the type of chart
  const topScale = type === CHART_TYPES.AREA ? 0.32 : 0.2;

  const [darkMode] = useDarkModeManager();
  const textColor = darkMode ? 'white' : 'black';
  const previousTheme = usePrevious(darkMode);
  const previousBase = usePrevious(base);

  // reset the chart if them switches
  useEffect(() => {
    const reset = () => {
      chartCreated.resize(0, 0);
      setChartCreated();
    };
    if ((chartCreated && previousTheme !== darkMode) || (chartCreated && previousBase !== base)) {
      reset();
    }
  }, [chartCreated, darkMode, previousTheme, type, previousBase, base]);

  // if no chart created yet, create one with options and add to DOM manually
  useEffect(() => {
    if (!chartCreated && formattedData) {
      var chart = createChart(ref.current, {
        width: width,
        height: HEIGHT,
        layout: {
          backgroundColor: 'transparent',
          textColor: textColor,
        },
        rightPriceScale: {
          scaleMargins: {
            top: topScale,
            bottom: 0,
          },
          borderVisible: false,
        },
        timeScale: {
          borderVisible: false,
        },
        grid: {
          horzLines: {
            color: 'rgba(197, 203, 206, 0.5)',
            visible: false,
          },
          vertLines: {
            color: 'rgba(197, 203, 206, 0.5)',
            visible: false,
          },
        },
        crosshair: {
          horzLine: {
            visible: false,
            labelVisible: false,
          },
          vertLine: {
            visible: true,
            style: 0,
            width: 2,
            color: 'rgba(32, 38, 46, 0.1)',
            labelVisible: false,
          },
        },
        localization: {
          priceFormatter: (val) => formattedNum(val, true),
        },
      });

      var series =
        type === CHART_TYPES.BAR
          ? chart.addHistogramSeries({
              color: '#4526A2',
              priceFormat: {
                type: 'volume',
              },
              scaleMargins: {
                top: 0.32,
                bottom: 0,
              },
              lineColor: '#4526A2',
              lineWidth: 3,
            })
          : chart.addAreaSeries({
              topColor: '#4526A2',
              bottomColor: 'rgba(69, 38, 162, 0)',
              lineColor: '#4526A2',
              lineWidth: 3,
            });

      series.setData(formattedData);

      // update the title when hovering on the chart
      chart.subscribeCrosshairMove(function (param) {
        onMouseMove(param, series);
      });

      chart.timeScale().fitContent();

      setChartCreated(chart);
    }
  }, [
    base,
    baseChange,
    chartCreated,
    data,
    formattedData,
    onMouseMove,
    textColor,
    title,
    topScale,
    type,
    useWeekly,
    width,
  ]);

  // responsiveness
  useEffect(() => {
    if (width) {
      chartCreated && chartCreated.resize(width, HEIGHT);
      chartCreated && chartCreated.timeScale().scrollToPosition(0);
    }
  }, [chartCreated, width]);

  return (
    <Wrapper>
      <div ref={ref} id={'test-id' + type} style={{ marginTop: '50px' }} />
      <Tooltip
        type={type}
        base={base}
        textColor={textColor}
        title={title}
        useWeekly={useWeekly}
        baseChange={baseChange}
        {...mouseOverValues}
      />
      <IconWrapper>
        <Play
          onClick={() => {
            chartCreated && chartCreated.timeScale().fitContent();
          }}
        />
      </IconWrapper>
    </Wrapper>
  );
};

export default memo(TradingViewChart, isEqual);
