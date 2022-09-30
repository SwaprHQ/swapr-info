import styled from 'styled-components';

const DashGrid = styled.div`
  display: grid;
  grid-gap: 1em;
  grid-template-columns: 0.05fr 3fr 1fr 1fr;
  grid-template-areas: 'number name pair value';
  padding: 0 36px;

  > * {
    justify-content: flex-end;

    :first-child {
      justify-content: flex-start;
      text-align: left;
    }
  }

  @media screen and (max-width: 1080px) {
    grid-template-columns: 0.05fr 1.4fr 1fr 1fr;
    grid-template-areas: 'number name pair value';
  }

  @media screen and (max-width: 600px) {
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-areas: 'name pair value';
  }

  @media screen and (max-width: 450px) {
    grid-template-columns: 1fr 1fr;
    grid-template-areas: 'name value';
  }
`;

export { DashGrid };
