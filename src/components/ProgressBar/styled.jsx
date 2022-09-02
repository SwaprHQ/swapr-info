import styled from 'styled-components';

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
    progress < 50 ? theme.green1 : progress >= 50 && progress < 70 ? theme.orange1 : theme.red1};
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
      : progress < 50
      ? theme.green1
      : progress >= 50 && progress < 70
      ? theme.orange1
      : theme.red1}};
`;

export { BarWrapper, ColoredBar, DarkBar, ProgressPercentage };
