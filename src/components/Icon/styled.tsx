import styled from 'styled-components';

export const IconWrapper = styled.div<{ theme: any; color: string; marginRight?: string }>`
  color: ${({ theme, color }) => (color ? theme[color] : theme.green1)};
  margin-right: ${({ marginRight }) => (marginRight ? `${marginRight}px` : '8px')};
`;
