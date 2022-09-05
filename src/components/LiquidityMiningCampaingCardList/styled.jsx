import styled from 'styled-components';

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  width: 150px;
  height: 36px;

  background: linear-gradient(118.9deg, rgba(255, 255, 255, 0.2) -0.59%, rgba(0, 0, 0, 0) 132.78%),
    rgba(61, 55, 88, 0.7);
  background-blend-mode: overlay, normal;
  backdrop-filter: blur(25px);

  border: ${({ theme }) => `1px solid ${theme.bd1}`};

  border-radius: 12px;
  margin-top: 20px;
`;

const CardsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;

  margin-top: 20px;

  @media screen and (max-width: 600px) {
    flex-direction: column;
  }
`;

const ActiveBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  padding: 1px 4px;
  height: 16px;

  font-weight: 500;
  font-size: 11px;
  line-height: 14px;
  color: ${({ theme }) => theme.green1};

  border: ${({ theme }) => `1px solid ${theme.green1}`};
  border-radius: 4px;
`;

const EndBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  padding: 1px 4px;
  height: 16px;

  font-weight: 500;
  font-size: 11px;
  line-height: 14px;
  color: ${({ theme }) => theme.red1};

  border: ${({ theme }) => `1px solid ${theme.red1}`};
  border-radius: 4px;
`;

export { Header, CardsWrapper, ActiveBadge, EndBadge };
