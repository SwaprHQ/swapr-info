import React from 'react';
import styled from 'styled-components';

import TokenLogo from '../TokenLogo';

const TokenWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  margin-right: ${({ sizeraw, margin }) => margin && (sizeraw / 3 + 8).toString() + 'px'};
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

export default function DoubleTokenLogo({ a0, a1, defaultText0, defaultText1, size = 24, margin = false }) {
  return (
    <TokenWrapper sizeraw={size} margin={margin}>
      <CoveredLogo defaultText={defaultText1} address={a1} size={size.toString() + 'px'} sizeraw={size} />
      <HigherLogo defaultText={defaultText0} address={a0} size={size.toString() + 'px'} sizeraw={size} />
    </TokenWrapper>
  );
}
