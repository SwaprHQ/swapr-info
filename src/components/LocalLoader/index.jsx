import styled, { css, keyframes } from 'styled-components';

import LogoDark from '../../assets/svg/logo.svg';
import LogoWhite from '../../assets/svg/logo_white.svg';
import { useDarkModeManager } from '../../contexts/LocalStorage';

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
  animation: ${pulse} 800ms linear infinite;
  & > * {
    width: 64px;
  }
`;

const LocalLoader = ({ fill, height }) => {
  const [darkMode] = useDarkModeManager();

  return (
    <Wrapper fill={fill} height={height}>
      <AnimatedImg>
        <img src={darkMode ? LogoWhite : LogoDark} alt="loading-icon" />
      </AnimatedImg>
    </Wrapper>
  );
};

export default LocalLoader;
