import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 3px;
  padding: 2px 3px;
  border: ${({ theme, isActive }) => `1.5px solid ${isActive ? theme.orange1 : theme.mercuryGray}`};
  border-radius: 4px;
`;

export { Wrapper };
