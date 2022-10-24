import { Box, Text } from 'rebass';
import styled from 'styled-components';

const List = styled(Box)`
  -webkit-overflow-scrolling: touch;
`;

const DashGrid = styled.div`
  display: grid;
  grid-gap: 1em;
  grid-template-columns: 20px 1fr 1fr;
  grid-template-areas: 'txn value time';
  padding: 0 20px;

  > * {
    justify-content: flex-end;
    width: 100%;

    &:first-child {
      justify-content: flex-start;
      text-align: left;
      width: 100px;
    }
  }

  @media screen and (min-width: 680px) {
    padding: 0 36px;

    > * {
      &:first-child {
        width: 180px;
      }
    }
  }

  @media screen and (min-width: 780px) {
    padding: 0 36px;
    grid-template-columns: 1.2fr 1fr 1fr 1fr 1fr;
    grid-template-areas: 'txn value amountToken amountOther time';

    > * {
      &:first-child {
        width: 180px;
      }
    }
  }

  @media screen and (min-width: 1080px) {
    padding: 0 36px;
    grid-template-columns: 1.2fr 1fr 1fr 1fr 1fr 1fr;
    grid-template-areas: 'txn value amountToken amountOther account time';
  }
`;

const ClickableText = styled(Text)`
  color: ${({ theme }) => theme.text1};
  user-select: none;
  text-align: end;

  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }

  @media screen and (max-width: 640px) {
    font-size: 14px;
  }
`;

const SortText = styled.button`
  padding: 4px 5px;
  border: 1px solid;
  border-color: ${({ theme }) => theme.bd1};
  border-radius: 6px;
  background-color: ${({ isActive, theme }) => (isActive ? theme.bg2 : 'transparent')};
  color: ${({ isActive, theme }) => (isActive ? theme.text12 : theme.text7)};
  text-transform: uppercase;

  :hover {
    cursor: pointer;
  }

  :hover > * {
    color: ${({ theme }) => theme.text12};
  }

  & > div {
    color: ${({ isActive, theme }) => (isActive ? theme.text12 : theme.text7)};
  }

  transition: background 200ms;
`;

export { ClickableText, DashGrid, List, SortText };
