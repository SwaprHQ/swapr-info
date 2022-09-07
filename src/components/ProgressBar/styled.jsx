import styled from 'styled-components';

const GREEN_PERCENTAGE_LIMIT = 50;
const ORANGE_PERCENTAGE_LIMIT = 70;

const BarWrapper = styled.div`
  position: relative;
`;

const DarkBar = styled.div`
  position: absolute;
  width: 100%;
  height: 3px;

  background: ${({ theme }) => theme.loaderHighlight};
  opacity: 0.5;
  border-radius: 6px;
`;

const ColoredBar = styled.div`
  position: absolute;
  width: ${({ progress }) => `${progress}%`};
  height: 3px;

  background: ${({ theme, progress }) =>
    progress < GREEN_PERCENTAGE_LIMIT
      ? theme.green1
      : progress >= GREEN_PERCENTAGE_LIMIT && progress < ORANGE_PERCENTAGE_LIMIT
      ? theme.orange1
      : theme.red1};
  opacity: 0.5;
  border-radius: 6px;
`;

const ProgressPercentage = styled.div`
  font-size: 13px;
  line-height: 13px;
  font-weight: 400;

  color: ${({ theme, progress }) =>
    progress === 0
      ? theme.text10
      : progress < GREEN_PERCENTAGE_LIMIT
      ? theme.green1
      : progress >= GREEN_PERCENTAGE_LIMIT && progress < ORANGE_PERCENTAGE_LIMIT
      ? theme.orange1
      : theme.red1}};
`;

export { BarWrapper, ColoredBar, DarkBar, ProgressPercentage };
