import styled from 'styled-components';

const ChartWrapper = styled.div`
  height: 100%;
  min-height: 300px;

  @media screen and (max-width: 600px) {
    min-height: 200px;
  }
`;

const ChartTypeButton = styled.button`
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

export { ChartWrapper, ChartTypeButton };
