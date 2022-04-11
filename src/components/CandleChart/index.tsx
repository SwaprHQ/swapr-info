import dayjs from 'dayjs';
import { createChart, CrosshairMode } from 'lightweight-charts';
import type { IChartApi } from 'lightweight-charts';
import React, { useState, useEffect, useRef } from 'react';
import { Play } from 'react-feather';
import { usePrevious } from 'react-use';
import styled from 'styled-components';

import { useDarkModeManager } from '../../contexts/LocalStorage';
import { formattedNum } from '../../utils';

// get the title of the chart
function setLastBarText(
  toolTip: HTMLElement,
  base: number,
  textColor: string,
  valueFormatter: (val: number) => string | number,
) {
  toolTip.innerHTML = base
    ? `<div style="font-size: 22px; margin: 4px 0px; color: ${textColor}">` + valueFormatter(base) + '</div>'
    : '';
}

const IconWrapper = styled.div`
  position: absolute;
  right: 10px;
  color: ${({ theme }) => theme.text1}
  border-radius: 3px;
  height: 16px;
  width: 16px;
  padding: 0px;
  bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;

  :hover {
    cursor: pointer;
    opacity: 0.7;
  }
`;

interface CandleStickChartProps {
  data: any;
  width?: number;
  height?: number;
  base?: number;
  margin?: boolean;
  valueFormatter?: (val: number) => string | number;
}

export default function CandleStickChart({
  data,
  width,
  height = 300,
  base,
  margin = true,
  valueFormatter = (val) => formattedNum(val, true),
}: CandleStickChartProps) {
  // reference for DOM element to create with chart
  const ref = useRef();

  const formattedData = data?.map((entry) => {
    return {
      time: parseFloat(entry.timestamp),
      open: parseFloat(entry.open),
      low: parseFloat(entry.open),
      close: parseFloat(entry.close),
      high: parseFloat(entry.close),
    };
  });

  if (formattedData && formattedData.length > 0) {
    formattedData.push({
      time: dayjs().unix(),
      open: parseFloat(formattedData[formattedData.length - 1].close),
      close: parseFloat(base.toString()),
      low: Math.min(parseFloat(base.toString()), parseFloat(formattedData[formattedData.length - 1].close)),
      high: Math.max(parseFloat(base.toString()), parseFloat(formattedData[formattedData.length - 1].close)),
    });
  }

  // pointer to the chart object
  const [chartCreated, setChartCreated] = useState<IChartApi | undefined>(undefined);
  const dataPrev = usePrevious(data);

  const [darkMode] = useDarkModeManager();
  const textColor = darkMode ? 'white' : 'black';
  const previousTheme = usePrevious(darkMode);

  // reset the chart if theme switches
  useEffect(() => {
    if (chartCreated !== undefined && previousTheme !== darkMode) {
      // remove the tooltip element
      const tooltip = document.getElementById('tooltip-id');
      const node = document.getElementById('test-id');
      node.removeChild(tooltip);
      chartCreated?.resize(0, 0);
      setChartCreated(undefined);
    }
  }, [chartCreated, darkMode, previousTheme]);

  useEffect(() => {
    if (data !== dataPrev && chartCreated !== undefined) {
      // remove the tooltip element
      const tooltip = document.getElementById('tooltip-id');
      const node = document.getElementById('test-id');
      node.removeChild(tooltip);
      chartCreated.resize(0, 0);
      setChartCreated(undefined);
    }
  }, [chartCreated, data, dataPrev]);

  // if no chart created yet, create one with options and add to DOM manually
  useEffect(() => {
    if (!chartCreated) {
      const chart = createChart(ref.current, {
        width: width,
        height: height,
        layout: {
          backgroundColor: 'transparent',
          textColor: textColor,
        },
        grid: {
          vertLines: {
            color: 'rgba(197, 203, 206, 0.5)',
          },
          horzLines: {
            color: 'rgba(197, 203, 206, 0.5)',
          },
        },
        crosshair: {
          mode: CrosshairMode.Normal,
        },
        rightPriceScale: {
          borderColor: 'rgba(197, 203, 206, 0.8)',
          visible: true,
        },
        timeScale: {
          borderColor: 'rgba(197, 203, 206, 0.8)',
        },
        localization: {
          priceFormatter: (val) => formattedNum(val),
        },
      });

      const candleSeries = chart.addCandlestickSeries({
        upColor: 'green',
        downColor: 'red',
        borderDownColor: 'red',
        borderUpColor: 'green',
        wickDownColor: 'red',
        wickUpColor: 'green',
      });

      candleSeries.setData(formattedData);

      const toolTip = document.createElement('div');
      toolTip.setAttribute('id', 'tooltip-id');
      toolTip.className = 'three-line-legend';
      //@ts-expect-error  #TODO: refactor required
      ref.current?.appendChild(toolTip);
      toolTip.style.display = 'block';
      toolTip.style.left = (margin ? 116 : 10) + 'px';
      toolTip.style.top = 50 + 'px';
      toolTip.style.backgroundColor = 'transparent';

      setLastBarText(toolTip, base, textColor, valueFormatter);

      // update the title when hovering on the chart
      chart.subscribeCrosshairMove(function (param) {
        if (
          param === undefined ||
          param.time === undefined ||
          param.point.x < 0 ||
          param.point.x > width ||
          param.point.y < 0 ||
          param.point.y > height
        ) {
          setLastBarText(toolTip, base, textColor, valueFormatter);
        } else {
          //@ts-expect-error
          const price = param.seriesPrices.get(candleSeries).close;
          //@ts-expect-error
          const time = dayjs.unix(param.time).format('MM/DD h:mm A');
          toolTip.innerHTML =
            `<div style="font-size: 22px; margin: 4px 0px; color: ${textColor}">` +
            valueFormatter(price) +
            `<span style="font-size: 12px; margin: 4px 6px; color: ${textColor}">` +
            time +
            ' UTC' +
            '</span>' +
            '</div>';
        }
      });

      chart.timeScale().fitContent();

      setChartCreated(chart);
    }
  }, [chartCreated, formattedData, width, height, valueFormatter, base, margin, textColor]);

  // responsiveness
  useEffect(() => {
    if (width) {
      chartCreated !== undefined && chartCreated.resize(width, height);
      chartCreated !== undefined && chartCreated.timeScale().scrollToPosition(0, true);
    }
  }, [chartCreated, height, width]);

  return (
    <div>
      <div ref={ref} id="test-id" />
      <IconWrapper>
        <Play
          onClick={() => {
            chartCreated && chartCreated.timeScale().fitContent();
          }}
        />
      </IconWrapper>
    </div>
  );
}
