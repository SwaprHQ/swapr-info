import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  gap: 6px;
`;

const Button = styled.button`
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

export { Wrapper, Button };
