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
import { ResponsiveStackedChart } from "../components/DashboardStakedChart";

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
      setFormattedLiquidityData(
        chartData.daily.map((data) => ({
          network: data.network,
          time: dayjs.unix(data.date).utc().format("YYYY-MM-DD"),
          value: parseFloat(data.totalLiquidityUSD),
        }))
      );

      setFormattedVolumeData(
        chartData.daily.map((data) => ({
          network: data.network,
          time: dayjs.unix(data.date).utc().format("YYYY-MM-DD"),
          value: parseFloat(data.dailyVolumeUSD),
        }))
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
    <PageWrapper>
      <ThemedBackground backgroundColor={transparentize(0.8, "#4526A2")} />
      <ContentWrapper>
        <TYPE.largeHeader>
          {below800
            ? "Analytics Dashboard"
            : "Swapr Protocol Analytics Dashboard"}
        </TYPE.largeHeader>
        {below800 ? (
          <AutoColumn style={{ marginTop: "6px" }} gap="24px">
            <Panel style={{ height: "100%", minHeight: "300px" }}>
              <ResponsiveStackedChart
                title={"TVL"}
                type={"AREA"}
                data={formattedLiquidityData}
              />
            </Panel>
            <Panel style={{ height: "100%", minHeight: "300px" }}>
              <ResponsiveStackedChart
                title={"Volume"}
                type={"BAR"}
                data={formattedVolumeData}
              />
            </Panel>
          </AutoColumn>
        ) : (
          formattedLiquidityData.length > 0 &&
          formattedVolumeData.length > 0 && (
            <GridRow>
              <Panel style={{ height: "100%", minHeight: "300px" }}>
                <ResponsiveStackedChart
                  title={"TVL"}
                  type={"AREA"}
                  data={formattedLiquidityData}
                />
              </Panel>
              <Panel style={{ height: "100%", minHeight: "300px" }}>
                <ResponsiveStackedChart
                  title={"Volume"}
                  type={"BAR"}
                  data={formattedVolumeData}
                />
              </Panel>
            </GridRow>
          )
        )}
      </ContentWrapper>
    </PageWrapper>
  );
};

export default withRouter(DashboardPage);
