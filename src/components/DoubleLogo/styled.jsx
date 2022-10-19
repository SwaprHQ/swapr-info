import styled from 'styled-components';

import TokenLogo from '../TokenLogo';

const TokenWrapper = styled.div`
  z-index: 0;
  position: relative;
  display: flex;
  flex-direction: row;
  min-width: ${({ sizeraw }) => `${sizeraw * 2}px`};
  margin-right: ${({ sizeraw, margin }) => margin && (sizeraw / 3).toString() + 'px'};
`;

const HigherLogo = styled(TokenLogo)`
  z-index: 2;
  background-color: white;
  border-radius: 50%;
  box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.6);
`;

const CoveredLogo = styled(TokenLogo)`
  position: absolute;
  left: ${({ sizeraw }) => (sizeraw / 1.2).toString() + 'px'};
  background-color: white;
  border-radius: 50%;
`;

export { TokenWrapper, HigherLogo, CoveredLogo };
