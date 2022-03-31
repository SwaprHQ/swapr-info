import PropTypes from "prop-types";
import React, { useEffect, useRef, useState } from "react";
import { ResponsiveContainer } from "recharts";

import DashboardStakedChart from "../BaseChart";

const ResponsiveStackedChart = ({ title, type, data }) => {
  const responsiveContainerRef = useRef();
  const [width, setWidth] = useState(
    responsiveContainerRef?.current?.container?.clientWidth
  );

  const isClient = typeof window === "object";

  // update the width on a window resize
  useEffect(() => {
    if (!isClient) {
      return false;
    }

    const handleResize = () => {
      setWidth(
        responsiveContainerRef?.current?.container?.clientWidth ?? width
      );
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [isClient, width]);

  return (
    <ResponsiveContainer aspect={60 / 28} ref={responsiveContainerRef}>
      <DashboardStakedChart
        title={title}
        type={type}
        width={width}
        data={data}
      />
    </ResponsiveContainer>
  );
};

ResponsiveStackedChart.propTypes = {
  title: PropTypes.string,
  type: PropTypes.oneOf(["AREA", "BAR"]).isRequired,
  data: PropTypes.array.isRequired,
};

ResponsiveStackedChart.defaultProps = {
  type: "AREA",
  data: [],
};

export default ResponsiveStackedChart;
