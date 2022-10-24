import { Box, Text } from 'rebass';
import styled from 'styled-components';

const List = styled(Box)`
  -webkit-overflow-scrolling: touch;
`;

const DashGrid = styled.div`
  display: grid;
  grid-gap: 1em;
  grid-template-columns: 2.5fr 1fr;
  grid-template-areas: 'name swapr';
  align-items: center;
  padding: 0 20px;

  @media screen and (min-width: 500px) {
    padding: 0 36px;
    grid-template-columns: 2.5fr 1fr 1fr;
    grid-template-areas: 'name swapr return';
  }

  @media screen and (min-width: 600px) {
    padding: 0 36px;
    grid-template-columns: 35px 1.2fr 1fr 1fr;
    grid-template-areas: 'number name swapr return';
  }

  @media screen and (min-width: 800px) {
    padding: 0 36px;
    grid-template-columns: 35px 2.5fr 1fr 1fr;
    grid-template-areas: 'number name swapr return';
  }
`;

const ClickableText = styled(Text)`
  color: ${({ theme }) => theme.text1};
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }

  text-align: end;
  user-select: none;
`;

export { ClickableText, DashGrid, List };
