import styled from 'styled-components';

const Wrapper = styled.div`
  width: fit-content;
  padding: 3px 4px;

  border: ${({ theme, isActive }) => `1.5px solid ${isActive ? theme.green1 : theme.red1}`};
  border-radius: 4px;
`;

export { Wrapper };
