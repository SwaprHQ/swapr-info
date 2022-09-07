import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  gap: 10px;

  padding: 20px;
  height: 26px;
  min-width: 150px;
  border-radius: 12px;
  margin: ${({ margin }) => (margin ? `${margin}` : '0')};
  border: 1px solid ${({ theme }) => theme.bd1};

  background: ${({ isNegative }) =>
    isNegative
      ? `linear-gradient(226.13deg, rgba(152, 15, 15, 0.2) -7.71%, rgba(152, 15, 15, 0) 85.36%), linear-gradient(113.18deg, rgba(255, 255, 255, 0.15) -0.1%, rgba(0, 0, 0, 0) 98.9%), #0C0B11`
      : `linear-gradient(226.13deg, rgba(15, 152, 106, 0.2) -7.71%, rgba(15, 152, 106, 0) 85.36%),
  linear-gradient(113.18deg, rgba(255, 255, 255, 0.15) -0.1%, rgba(0, 0, 0, 0) 98.9%), #0c0b11`};
  background-blend-mode: normal, overlay, normal;
`;

const PercentageChange = styled.div`
  margin-top: 16px;

  & > div {
    font-size: 13px;
    line-height: 14px;
    font-weight: 600;
  }
`;

export { PercentageChange, Wrapper };
