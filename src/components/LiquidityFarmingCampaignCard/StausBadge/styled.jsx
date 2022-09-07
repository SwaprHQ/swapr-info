import styled from 'styled-components';

const ActiveEndedWrapper = styled.div`
  width: fit-content;
  padding: 3px 4px;

  border: ${({ theme, isActive }) => `1.5px solid ${isActive ? theme.green1 : theme.red1}`};
  border-radius: 4px;
`;

const LockedWrapper = styled.div`
  width: fit-content;
  padding: 3px 4px;

  border: ${({ theme }) => `1.5px solid ${theme.orange1}`};
  border-radius: 4px;
`;

export { ActiveEndedWrapper, LockedWrapper };
