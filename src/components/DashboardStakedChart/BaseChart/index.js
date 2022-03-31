import dayjs from "dayjs";
import { createChart, LineStyle, LineType } from "lightweight-charts";
import PropTypes from "prop-types";
import React, { useEffect, useRef, useState } from "react";
import { Play } from "react-feather";
import styled from "styled-components";

import { formattedNum } from "../../../utils";
import { IconWrapper } from "../..";
import { SupportedNetwork } from "../../../constants";

const Wrapper = styled.div`
  position: relative;
`;

const FIXED_HEIGHT = 300;
const NETWORKS = [
  { name: SupportedNetwork.MAINNET, color: "#e5c914" },
  { name: SupportedNetwork.XDAI, color: "#4526A2" },
  { name: SupportedNetwork.ARBITRUM_ONE, color: "#1fc394" },
];

const BaseChart = ({ title, type, data, width }) => {
  const containerRef = useRef();
  const [chartCreated, setChartCreated] = useState(false);

  useEffect(() => {
    if (data && !chartCreated) {
      const chart = createChart(containerRef.current, {
        width,
        height: FIXED_HEIGHT,
        layout: {
          backgroundColor: "transparent",
          textColor: "white",
        },
        rightPriceScale: {
          scaleMargins: {
            bottom: 0,
          },
          borderVisible: false,
        },
        timeScale: {
          borderVisible: false,
        },
        grid: {
          horzLines: {
            visible: false,
          },
          vertLines: {
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
            color: "#40444f",
            labelVisible: true,
          },
        },
        localization: {
          priceFormatter: (val) => formattedNum(val, true),
        },
      });

      NETWORKS.forEach(({ name, color }) => {
        if (type === "AREA") {
          const areaSeries = chart.addAreaSeries({
            topColor: color,
            bottomColor: color + "00",
            lineColor: color,
            lastValueVisible: false,
            lineWidth: 3,
          });

          areaSeries.setData(data.filter((data) => data.network === name));
        }

        if (type === "BAR") {
          // since lightweight-chart does not support a stacked bar chart
          // add a customized area series in order to resemble a stacked chart
          const barSeries = chart.addAreaSeries({
            topColor: color,
            bottomColor: color + 60,
            lineColor: color,
            lineStyle: LineStyle.Solid,
            lineType: LineType.WithSteps,
            priceLineVisible: false,
            lastValueVisible: false,
            lineWidth: 3,
          });

          barSeries.setData(data.filter((data) => data.network === name));
        }
      });

      const toolTip = document.createElement("div");
      toolTip.setAttribute("id", "tooltip-id");
      toolTip.className = "three-line-legend-dark";
      containerRef.current.appendChild(toolTip);
      toolTip.style.display = "block";
      toolTip.style.fontWeight = "500";
      toolTip.style.left = -4 + "px";
      toolTip.style.top = "-" + 8 + "px";
      toolTip.style.backgroundColor = "transparent";

      // TODO: add way to display current total tvl by default
      const setFixedToolTipText = (value, currentPointDate) => {
        toolTip.innerHTML =
          `<div style="font-size: 16px; margin: 4px 0px; color: white;">${title}</div>` +
          `<div style="font-size: 22px; margin: 4px 0px; color: white">` +
          formattedNum(value ?? 0, true) +
          `<div style="font-size: 12px">${currentPointDate}</div>` +
          "</div>";
      };

      // tooltip attached to crosshair
      const crosshairToolTipWidth = 100;
      const crosshairToolTipHeight = 80;
      const crosshairToolTipMargin = 15;

      const crosshairToolTip = document.createElement("div");
      crosshairToolTip.className = "crosshair-tooltip";
      containerRef.current.appendChild(crosshairToolTip);
      crosshairToolTip.style.display = "none";

      const myCrosshairMoveHandler = (param) => {
        if (
          !param.time ||
          param.point.x < 0 ||
          param.point.x > width ||
          param.point.y < 0 ||
          param.point.y > FIXED_HEIGHT
        ) {
          // hide crosshair tooltip when the pointer leaves the cart
          // or there are no data to show
          crosshairToolTip.style.display = "none";
          return;
        }

        // show the tooltip when pointer hovers over chart data
        crosshairToolTip.style.display = "block";

        let totalAreasStackedValue = 0;
        let crosshairToolTipHtmlContent = "";
        let seriesIndex = 0;

        // get data at the current point for each series
        param.seriesPrices.forEach((seriesValue) => {
          totalAreasStackedValue += seriesValue;

          crosshairToolTipHtmlContent +=
            `<div class="crosshair-item">` +
            `<div>` +
            `<div class="crosshair-item-legend" style="background-color: ${NETWORKS[seriesIndex]?.color}"></div>` +
            NETWORKS[seriesIndex]?.name +
            `</div>` +
            `$ ${formattedNum(seriesValue)}` +
            `</div>`;

          seriesIndex++;
        });

        crosshairToolTip.innerHTML = crosshairToolTipHtmlContent;

        const y = param.point.y;

        let left = param.point.x + crosshairToolTipMargin;
        if (left > width - crosshairToolTipWidth) {
          left = param.point.x - crosshairToolTipMargin - crosshairToolTipWidth;
        }

        let top = y + crosshairToolTipMargin;
        if (top > FIXED_HEIGHT - crosshairToolTipHeight) {
          top = y - crosshairToolTipHeight - crosshairToolTipMargin;
        }

        crosshairToolTip.style.left = left + "px";
        crosshairToolTip.style.top = top + "px";

        // add time and total stacked value at the current point in time
        // to the fixed tooltip
        setFixedToolTipText(
          totalAreasStackedValue,
          dayjs(
            param.time.year + "-" + param.time.month + "-" + param.time.day
          ).format("MMMM D, YYYY")
        );
      };

      chart.subscribeCrosshairMove(myCrosshairMoveHandler);
      chart.timeScale().fitContent();
      setChartCreated(chart);
    }
  }, [title, type, width, data, chartCreated]);

  // scale and resize the chart on width changes
  useEffect(() => {
    if (width) {
      chartCreated && chartCreated.resize(width, FIXED_HEIGHT);
      chartCreated && chartCreated.timeScale().scrollToPosition(0);
    }
  }, [chartCreated, width]);

  return (
    <Wrapper>
      <div ref={containerRef} />
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

BaseChart.propTypes = {
  title: PropTypes.string,
  type: PropTypes.oneOf(["AREA", "BAR"]).isRequired,
  data: PropTypes.array.isRequired,
  width: PropTypes.number.isRequired,
};

BaseChart.defaultProps = {
  title: "Stacked data",
  width: 600,
};

export default BaseChart;
