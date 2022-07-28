import { darken } from 'polished';
import { useState } from 'react';
import { useMedia } from 'react-use';
import { Flex } from 'rebass';
import { Area, XAxis, YAxis, ResponsiveContainer, Tooltip, AreaChart } from 'recharts';
import styled from 'styled-components';

import { TYPE } from '../../Theme';
import { timeframeOptions } from '../../constants';
import { useDarkModeManager } from '../../contexts/LocalStorage';
import { useUserLiquidityChart } from '../../contexts/User';
import { toK, toNiceDate, toNiceDateYear, formattedNum, getTimeframe } from '../../utils';
import { OptionButton } from '../ButtonStyled';
import DropdownBasicSelect from '../DropdownBasicSelect';
import LocalLoader from '../LocalLoader';
import { AutoRow } from '../Row';

const ChartWrapper = styled.div`
  max-height: 420px;

  @media screen and (max-width: 600px) {
    min-height: 200px;
  }
`;

const UserChart = ({ account }) => {
  const chartData = useUserLiquidityChart(account);

  const [timeWindow, setTimeWindow] = useState(timeframeOptions.ALL_TIME);
  let utcStartTime = getTimeframe(timeWindow);

  const below600 = useMedia('(max-width: 600px)');
  const above1600 = useMedia('(min-width: 1600px)');

  const domain = [(dataMin) => (dataMin > utcStartTime ? dataMin : utcStartTime), 'dataMax'];

  const aspect = above1600 ? 60 / 12 : below600 ? 60 / 42 : 60 / 16;

  const [darkMode] = useDarkModeManager();
  const textColor = darkMode ? 'white' : 'black';

  return (
    <ChartWrapper>
      {chartData &&
        (below600 ? (
          <Flex justifyContent={'end'} mb={40}>
            <DropdownBasicSelect
              options={timeframeOptions}
              active={timeWindow}
              setActive={setTimeWindow}
              color={'#4526A2'}
            />
          </Flex>
        ) : (
          <Flex justifyContent={'space-between'} mb={40}>
            <AutoRow gap="10px">
              <TYPE.main>Liquidity Value</TYPE.main>
            </AutoRow>
            <AutoRow justify="flex-end" gap="4px">
              <OptionButton
                active={timeWindow === timeframeOptions.MONTH}
                onClick={() => setTimeWindow(timeframeOptions.MONTH)}
              >
                1M
              </OptionButton>
              <OptionButton
                active={timeWindow === timeframeOptions.WEEK}
                onClick={() => setTimeWindow(timeframeOptions.WEEK)}
              >
                1W
              </OptionButton>
              <OptionButton
                active={timeWindow === timeframeOptions.ALL_TIME}
                onClick={() => setTimeWindow(timeframeOptions.ALL_TIME)}
              >
                All
              </OptionButton>
            </AutoRow>
          </Flex>
        ))}
      {chartData ? (
        <ResponsiveContainer aspect={aspect}>
          <AreaChart margin={{ top: 0, right: 10, bottom: 6, left: 0 }} barCategoryGap={1} data={chartData}>
            <defs>
              <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={'#4526A2'} stopOpacity={0.35} />
                <stop offset="95%" stopColor={'#4526A2'} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              tickLine={false}
              axisLine={false}
              interval="preserveEnd"
              tickMargin={16}
              minTickGap={0}
              tickFormatter={(tick) => toNiceDate(tick)}
              dataKey="date"
              tick={{ fill: textColor }}
              type={'number'}
              domain={domain}
            />
            <YAxis
              type="number"
              orientation="right"
              tickFormatter={(tick) => '$' + toK(tick)}
              axisLine={false}
              tickLine={false}
              interval="preserveEnd"
              minTickGap={6}
              yAxisId={0}
              tick={{ fill: textColor }}
            />
            <Tooltip
              cursor={true}
              formatter={(val) => formattedNum(val, true)}
              labelFormatter={(label) => toNiceDateYear(label)}
              labelStyle={{ paddingTop: 4 }}
              contentStyle={{
                padding: '10px 14px',
                borderRadius: 10,
                borderColor: '#4526A2',
                color: 'black',
              }}
              wrapperStyle={{ top: -70, left: -10 }}
            />
            <Area
              key={'other'}
              dataKey={'valueUSD'}
              stackId="2"
              strokeWidth={2}
              dot={false}
              type="monotone"
              name={'Liquidity'}
              yAxisId={0}
              stroke={darken(0.12, '#4526A2')}
              fill="url(#colorUv)"
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <LocalLoader />
      )}
    </ChartWrapper>
  );
};

export default UserChart;
