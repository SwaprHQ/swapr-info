import { transparentize } from "polished";
import React, { useEffect, useState } from "react";
import { withRouter } from "react-router-dom";
import { useMedia } from "react-use";
import styled from "styled-components";
import dayjs from "dayjs";

import { AutoColumn } from "../components/Column";
import Panel from "../components/Panel";
import { TYPE, ThemedBackground } from "../Theme";
import { PageWrapper, ContentWrapper } from "../components";
import { useDashboardChartData } from "../contexts/Dashboard";
import StackedChart from "../components/StackedChart";
import LocalLoader from "../components/LocalLoader";

const GridRow = styled.div`
  display: grid;
  width: 100%;
  grid-template-columns: 1fr 1fr;
  column-gap: 6px;
  align-items: start;
  justify-content: space-between;
`;

const DashboardPage = () => {
  const chartData = useDashboardChartData();
  const [formattedLiquidityData, setFormattedLiquidityData] = useState([]);
  const [formattedVolumeData, setFormattedVolumeData] = useState([]);

  // breakpoints
  const below800 = useMedia("(max-width: 800px)");

  useEffect(() => {
    if (chartData && chartData.daily) {
      const formattedData = Object.values(
        chartData.daily.reduce(
          (accumulator, current) => ({
            ...accumulator,
            [current.date]: {
              time: dayjs.unix(current.date).utc().format("YYYY-MM-DD"),
              tvl: {
                ...accumulator[current.date]?.tvl,
                [current.network]: parseFloat(current.totalLiquidityUSD),
              },
              volume: {
                ...accumulator[current.date]?.volume,
                [current.network]: parseFloat(current.dailyVolumeUSD),
              },
            },
          }),
          {}
        )
      );

      // group daily liquidity data by date
      setFormattedLiquidityData(
        formattedData.map(({ time, tvl }) => ({ time, ...tvl }))
      );
      // group daily volume data by date
      setFormattedVolumeData(
        formattedData.map(({ time, volume }) => ({ time, ...volume }))
      );
    }
  }, [chartData]);

  useEffect(() => {
    document.querySelector("body").scrollTo({
      behavior: "smooth",
      top: 0,
    });
  }, []);

  return (
    <>
      {(chartData === undefined || Object.keys(chartData).length === 0) && (
        <LocalLoader fill="true" />
      )}
      <PageWrapper>
        <ThemedBackground backgroundColor={transparentize(0.8, "#4526A2")} />
        <ContentWrapper>
          <TYPE.largeHeader>
            {below800
              ? "Analytics Dashboard"
              : "Swapr Protocol Analytics Dashboard"}
          </TYPE.largeHeader>
          {formattedLiquidityData && (
            <>
              {below800 ? (
                <AutoColumn style={{ marginTop: "6px" }} gap="24px">
                  <Panel style={{ height: "100%" }}>
                    <StackedChart
                      title={"TVL"}
                      type={"AREA"}
                      data={formattedLiquidityData}
                    />
                  </Panel>
                  <Panel style={{ height: "100%" }}>
                    <StackedChart
                      title={"Volume"}
                      type={"BAR"}
                      data={formattedVolumeData}
                    />
                  </Panel>
                </AutoColumn>
              ) : (
                <GridRow>
                  <Panel style={{ height: "100%" }}>
                    <StackedChart
                      title={"TVL"}
                      type={"AREA"}
                      data={formattedLiquidityData}
                    />
                  </Panel>
                  <Panel style={{ height: "100%" }}>
                    <StackedChart
                      title={"Volume"}
                      type={"BAR"}
                      data={formattedVolumeData}
                    />
                  </Panel>
                </GridRow>
              )}
            </>
          )}
        </ContentWrapper>
        )
      </PageWrapper>
    </>
  );
};

export default withRouter(DashboardPage);
