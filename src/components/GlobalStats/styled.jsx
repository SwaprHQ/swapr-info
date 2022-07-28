import styled from 'styled-components';

const Wrapper = styled.div`
  margin-top: 20px;
  display: flex;
  flex-direction: ${({ isMobile }) => (isMobile ? 'column' : 'row')};
  gap: 20px;
  width: 100%;
`;

const StatsCard = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  gap: 26px;
  flex: 1;

  background: ${({ theme }) => `linear-gradient(0deg, ${theme.bg7}, ${theme.bg7}),
    linear-gradient(143.3deg, rgba(46, 23, 242, 0.5) -185.11%, rgba(46, 23, 242, 0) 49.63%), rgba(57, 51, 88, 0.3)`};
  backdrop-filter: blur(25px);

  border: 1px solid;
  border-color: ${({ theme }) => theme.bd1};
  border-radius: 12px;
`;

export { Wrapper, StatsCard };
