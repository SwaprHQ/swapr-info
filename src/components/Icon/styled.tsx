import styled from 'styled-components';

export const Wrapper = styled.div<{ theme: any; color: string }>`
  color: ${({ theme, color }) => (color ? theme[color] : theme.green1)};
`;
