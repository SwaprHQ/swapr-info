import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 3px;

  padding: 2px 3px;

  border: ${({ theme }) => `1.5px solid ${theme.orange1}`};
  border-radius: 4px;
`;

export { Wrapper };
