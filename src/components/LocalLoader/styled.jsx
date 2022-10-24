import styled, { css, keyframes } from 'styled-components';

const pulse = keyframes`
  0% { transform: scale(1); }
  60% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

const Wrapper = styled.div`
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: ${({ height }) => (height ? `${height}px` : '180px')};
  width: 100%;

  ${(props) =>
    props.fill && !props.height
      ? css`
          height: 100vh;
        `
      : css`
          height: 100%;
        `}
`;

const AnimatedImg = styled.div`
  height: 64px;
  animation: ${pulse} 800ms linear infinite;

  & > * {
    width: 64px;
  }
`;

export { Wrapper, AnimatedImg };
