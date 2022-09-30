import styled from 'styled-components';

import Panel from '../Panel';

const Wrapper = styled(Panel)`
  padding: ${({ isBelow680px }) => (isBelow680px ? '20px 0' : '32px 0')};
`;

const Header = styled.div`
  display: grid;
  align-items: center;
  grid-template-columns: 1.5fr 1fr 0.4fr;
  grid-template-areas: 'account value action';
  padding: ${({ isBelow680px }) => (isBelow680px ? '0 20px 24px 20px' : '0 36px 24px 36px')};

  @media screen and (min-width: 450px) {
    grid-template-columns: 1.5fr 1fr 1fr 0.4fr;
    grid-template-areas: 'account pair value action';
  }

  @media screen and (min-width: 800px) {
    grid-template-columns: 3fr 1fr 1fr 0.4fr;
    grid-template-areas: 'account pair value action';
  }
`;

const Account = styled.div`
  display: grid;
  align-content: center;
  grid-template-columns: 1.5fr 1fr 0.4fr;
  grid-template-areas: 'account value action';
  height: 48px;
  padding: ${({ isBelow680px }) => (isBelow680px ? '0 20px' : '0 36px')};

  @media screen and (min-width: 450px) {
    grid-template-columns: 1.5fr 1fr 1fr 0.4fr;
    grid-template-areas: 'account pair value action';
  }

  @media screen and (min-width: 800px) {
    grid-template-columns: 3fr 1fr 1fr 0.4fr;
    grid-template-areas: 'account pair value action';
  }
`;

const GridArea = styled.div`
  grid-area: ${({ area }) => area};
  justify-self: ${({ justify }) => justify || 'stretch'}; ;
`;

const TrashIcon = styled.div`
  transition: 200ms opacity;

  :hover {
    cursor: pointer;
    opacity: 0.7;
  }
`;

export { Wrapper, Header, Account, GridArea, TrashIcon };
