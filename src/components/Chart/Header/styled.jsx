import { Flex } from 'rebass';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  color: white;
`;

const FlexContainer = styled(Flex)`
  gap: 6px;
`;

const DailyChange = styled.div`
  & > div {
    font-size: 13px;
  }
`;

const WeeklyButton = styled.button`
  height: 26px;
  padding: 4px 5px;
  border: 1px solid;
  border-color: ${({ theme }) => theme.bd1};
  border-radius: 6px;
  background-color: ${({ isActive, theme }) => (isActive ? theme.bg2 : 'transparent')};

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

export { Container, FlexContainer, DailyChange, WeeklyButton };
