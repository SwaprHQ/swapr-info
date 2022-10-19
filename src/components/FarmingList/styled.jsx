import { Box, Text } from 'rebass';
import styled from 'styled-components';

const List = styled(Box)`
  -webkit-overflow-scrolling: touch;
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

const DashGrid = styled.div`
  display: grid;
  grid-gap: 1em;
  grid-template-columns: 0.5fr 0.9fr 0.5fr 0.4fr 0.2fr;
  grid-template-areas: 'pair tvl apy rewardTokens link';
  padding: 10px 36px;
  height: 100px;

  > * {
    justify-content: flex-end;

    :first-child {
      justify-content: flex-start;
      text-align: left;
    }
  }

  @media screen and (min-width: 680px) {
    display: grid;
    grid-gap: 1em;
    grid-template-columns: 0.6fr 0.6fr 0.6fr 0.6fr 0.4fr 0.2fr;
    grid-template-areas: 'pair tvl yield apy rewardTokens link';

    > * {
      justify-content: flex-end;
      width: 100%;

      &:first-child {
        justify-content: flex-start;
      }
    }
  }

  @media screen and (min-width: 1081px) {
    display: grid;
    grid-gap: 0.5em;
    grid-template-columns: 0.2fr 1fr 1fr 1fr 1fr 1fr 0.5fr 0.5fr;
    grid-template-areas: 'index pair tvl yield apy rewardTokens owner link';
  }
`;

export { List, ClickableText, DashGrid };
