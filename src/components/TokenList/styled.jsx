import { Box, Text } from 'rebass';
import styled from 'styled-components';

const List = styled(Box)`
  -webkit-overflow-scrolling: touch;
`;

const DashGrid = styled.div`
  display: grid;
  grid-gap: 1em;
  grid-template-columns: 100px 1fr;
  grid-template-areas: 'name vol';
  padding: 0 20px;

  > * {
    justify-content: flex-end;

    &:first-child {
      justify-content: flex-start;
      text-align: left;
    }
  }

  @media screen and (min-width: 680px) {
    padding: 0 36px;
    display: grid;
    grid-gap: 1em;
    grid-template-columns: 180px 1fr 1fr 1fr 1fr;
    grid-template-areas: 'name symbol price liq vol';

    > * {
      justify-content: flex-end;
      width: 100%;

      &:first-child {
        justify-content: flex-start;
      }
    }
  }

  @media screen and (min-width: 1080px) {
    padding: 0 36px;
    display: grid;
    grid-gap: 0.5em;
    grid-template-columns: 0.1fr 1.5fr 0.6fr 1fr 1fr 1fr 1fr;
    grid-template-areas: 'index name symbol price change liq vol';
  }
`;

const ClickableText = styled(Text)`
  text-align: end;
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
  user-select: none;
  color: ${({ theme }) => theme.text1};

  @media screen and (max-width: 640px) {
    font-size: 0.85rem;
  }
`;

export { List, DashGrid, ClickableText };
