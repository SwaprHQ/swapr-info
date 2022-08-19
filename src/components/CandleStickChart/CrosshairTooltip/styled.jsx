import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: fit;
  padding: 8px;
  box-sizing: border-box;
  font-size: 12px;
  color: ${({ theme }) => theme.text1};
  background-color: ${({ theme }) => theme.bg1};
  border: 0.5px solid;
  border-color: ${({ theme }) => theme.bd1};
  border-radius: 4px;
`;

export { Wrapper };
