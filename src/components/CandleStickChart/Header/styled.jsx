import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  color: white;
`;

const FlexContainer = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
`;

const DailyChange = styled.div`
  & > div {
    font-size: 13px;
  }
`;

export { Container, FlexContainer, DailyChange };
