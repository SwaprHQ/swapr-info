import React from 'react';
import Skeleton from 'react-loading-skeleton';
import { Box } from 'rebass';
import styled from 'styled-components';

import { useDarkModeManager } from '../../contexts/LocalStorage';
import { formattedNum } from '../../utils';

const Value = styled.div`
  font-size: 22px;
  color: ${({ theme }) => theme.text1};
  font-weight: bold;
  display: flex;
  align-items: center;
`;

const Title = styled.div`
  font-size: 16px;
  color: ${({ theme }) => theme.text1};
  margin: 4px 0px;
`;

const Container = styled.div`
  font-weight: 500;
  left: -4px;
  top: -50px;
  background-color: transparent;
`;

interface TooltipProps {
  type: string;
  title: string;
  base: number;
  baseChange: number;
  useWeekly: boolean;
  dateStr: string;
  price: number;
}

export default function Tooltip({ type, title, base, baseChange, useWeekly, dateStr, price }: TooltipProps) {
  const [darkMode] = useDarkModeManager();

  const percentChange = baseChange?.toFixed(2);
  const color = baseChange >= 0 ? 'green' : 'red';
  const formattedPercentChange = percentChange ? (baseChange > 0 ? '+' : '') + percentChange + '%' : '0%';

  return (
    <Container className={darkMode ? 'three-line-legend-dark' : 'three-line-legend'}>
      <Title>
        {title}
        {type === 'BAR' && !useWeekly ? ' (24hr)' : ''}
      </Title>

      <ValueContainer date={dateStr} price={price} base={base} percent={formattedPercentChange} color={color} />
    </Container>
  );
}

interface ValueContainerProps {
  date: string;
  price: number;
  base: number;
  percent: string;
  color: string;
}

function ValueContainer({ date, price, base, percent, color }: ValueContainerProps) {
  if (date === '' && base !== undefined) {
    return (
      <Value>
        {formattedNum(base ?? 0, true)}
        <span style={{ marginLeft: '10px', fontSize: '16px', color: `${color}` }}>{percent}</span>
      </Value>
    );
  }
  if (date === '' && base === undefined) {
    return <Skeleton style={{ width: '80px' }} />;
  }

  if (date !== '') {
    return (
      <>
        <Value>{formattedNum(price ?? 0, true)}</Value>
        <Box>{date}</Box>
      </>
    );
  }

  return null;
}
