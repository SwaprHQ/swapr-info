import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: calc(100% + 16px);
  padding: 8px;
  box-sizing: border-box;
  font-size: 12px;
  color: ${({ theme }) => theme.text1};
  background-color: ${({ theme }) => theme.bg1};
  border: 0.5px solid;
  border-color: ${({ theme }) => theme.bd1};
  border-radius: 4px;
`;

const LegendItem = styled.div`
  width: 10px;
  height: 10px;
  background-color: ${({ color }) => color};
  border-radius: 5px;
  margin-right: 8px;
`;

export { Wrapper, LegendItem };
