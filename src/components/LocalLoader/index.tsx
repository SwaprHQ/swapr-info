import React from 'react';
import styled, { keyframes } from 'styled-components';

import { useDarkModeManager } from '../../contexts/LocalStorage';

const pulse = keyframes`
  0% { transform: scale(1); }
  60% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

const Wrapper = styled.div<{ fullHeight?: boolean; height?: number }>`
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  height: ${({ fullHeight }) => (fullHeight ? '100vh' : '180px')}
  width: 100%;

  
`;

const AnimatedImg = styled.div`
  animation: ${pulse} 800ms linear infinite;
  & > * {
    width: 72px;
  }
`;

export default function LocalLoader({ fill = false }) {
  const [darkMode] = useDarkModeManager();

  return (
    <Wrapper fullHeight={fill}>
      <AnimatedImg>
        <img
          src={require(darkMode ? '../../assets/svg/logo_white.svg' : '../../assets/svg/logo.svg')}
          alt="loading-icon"
        />
      </AnimatedImg>
    </Wrapper>
  );
}
