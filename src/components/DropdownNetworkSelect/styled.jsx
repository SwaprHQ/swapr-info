import { ChevronDown as Arrow } from 'react-feather';
import styled from 'styled-components';

const Wrapper = styled.div`
  position: relative;
  background: linear-gradient(143.3deg, rgba(46, 23, 242, 0.5) -120%, rgba(46, 23, 242, 0) 60%),
    linear-gradient(113.18deg, rgba(255, 255, 255, 0.1) 0%, rgba(0, 0, 0, 0) 100%), rgba(23, 22, 23);
  background-blend-mode: normal, overlay, normal;
  backdrop-filter: blur(25px);
  border: 1px solid ${({ color, theme }) => color || theme.bd1};
  max-width: 151px;
  height: 100%;
  max-height: 36px;
  width: 100%;
  padding: 3px 12px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  z-index: 2;

  :hover {
    cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
  }
`;

const IconWrapper = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  width: ${({ size }) => (size ? `${size}px` : '16px')};
  height: ${({ size }) => (size ? `${size}px` : '16px')};

  & > img {
    height: 16px;
  }
`;

const Dropdown = styled.div`
  position: absolute;
  top: 38px;
  left: -1px;
  padding-top: 40px;
  background: linear-gradient(143.3deg, rgba(46, 23, 242, 0.5) -120%, rgba(46, 23, 242, 0) 60%),
    linear-gradient(113.18deg, rgba(255, 255, 255, 0.1) 0%, rgba(0, 0, 0, 0) 100%), rgba(23, 22, 23);
  background-blend-mode: normal, overlay, normal;
  backdrop-filter: blur(25px);
  border: 1px solid ${({ color, theme }) => color || theme.bd1};
  padding: 6px 12px;
  border-radius: 12px;
  width: calc(100% - 24px);

  :hover {
    cursor: pointer;
  }
`;

const ArrowStyled = styled(Arrow)`
  display: flex;
  align-items: center;
  height: 18px;
  width: 18px;
`;

export { Wrapper, IconWrapper, Dropdown, ArrowStyled };
