import { ChevronDown as Arrow } from 'react-feather';
import styled from 'styled-components';

const Wrapper = styled.div`
  position: relative;
  background-color: ${({ theme }) => theme.dropdownBg};
  border: 1px solid ${({ color, theme }) => color || theme.bd1};
  width: ${({ width }) => (width ? width : '160px')};
  padding: 4px 10px;
  padding-right: 6px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;

  :hover {
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
  top: 38px;
  left: -1px;
  padding-top: 40px;
  background-color: ${({ theme }) => theme.dropdownBg};
  backdrop-filter: blur(25px);
  border: 1px solid ${({ color, theme }) => color || theme.bd1};
  padding: 10px 10px;
  border-radius: 8px;
  width: calc(100% - 20px);
  font-weight: 500;
  font-size: 1rem;
  color: black;
  :hover {
    cursor: pointer;
  }
`;

const ArrowStyled = styled(Arrow)`
  height: 20px;
  width: 20px;
  margin-left: 6px;
`;

export { Wrapper, IconWrapper, Dropdown, ArrowStyled };
