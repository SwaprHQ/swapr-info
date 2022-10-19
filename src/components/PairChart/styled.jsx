import styled from 'styled-components';

const ChartWrapper = styled.div`
  height: 100%;
  min-height: 340px;

  @media screen and (max-width: 600px) {
    min-height: 200px;
  }
`;

export { ChartWrapper };
