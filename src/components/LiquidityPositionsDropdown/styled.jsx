import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  width: ${({ width }) => width ?? '260px'};
  position: relative;
  background-color: ${({ theme }) => theme.bg7};
  border: 1px solid ${({ color, theme }) => color || theme.bd1};
  padding: 14px 15px;
  border-radius: 12px;
  align-items: center;
  justify-content: center;

  &:hover {
    cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
  }
`;

const IconWrapper = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  width: ${({ size }) => (size ? `${size}px` : '20px')};
  height: ${({ size }) => (size ? `${size}px` : '20px')};
  & > img {
    height: 20px;
  }
`;

const Dropdown = styled.div`
  z-index: 2;
  position: absolute;
  top: 57px;
  left: -1px;
  background-color: ${({ theme }) => theme.bg7};
  border: 1px solid ${({ color, theme }) => color || theme.bd1};
  padding: 14px 15px;
  border-radius: 12px;
  width: calc(100% - 30px);

  &:hover {
    cursor: pointer;
  }
`;

const LiquidityPosition = styled.div`
  display: flex;
  height: 24px;
  gap: 8px;
  align-items: center;
`;

export { Wrapper, IconWrapper, Dropdown, LiquidityPosition };
