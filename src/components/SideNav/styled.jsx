import { transparentize } from 'polished';
import styled from 'styled-components';

import { Typography } from '../../Theme';
import { MobileMenu } from './MobileMenu';

const Wrapper = styled.div`
  height: ${({ isMobile }) => (isMobile ? 'initial' : '100vh')};
  padding: 0 14px;
  color: ${({ theme }) => theme.text1};
  position: sticky;
  z-index: 2;
  top: 0px;
  background-color: ${({ theme }) => theme.bg1};
  color: ${({ theme }) => theme.bg2};

  @media screen and (max-width: 800px) {
    grid-template-columns: 1fr;
    position: relative;
  }

  @media screen and (max-width: 1080px) {
    padding: 1rem;
  }
`;

const Option = styled(Typography.LargeText)`
  color: ${({ activeText, theme }) => (activeText ? theme.text1 : theme.text10)};
  display: flex;
  align-items: center;
  justify-content: ${({ isCentered }) => (isCentered ? 'center' : 'flex-start')};
  user-select: none;

  && {
    font-weight: ${({ activeText }) => (activeText ? '700' : '400')};
  }

  &:hover {
    color: ${({ theme }) => theme.text1};
  }

  // Apply hover directly to the svg path element (needed for the Farms icon)
  &:hover div path {
    fill: ${({ theme }) => theme.text1};
  }
`;

const OptionDivider = styled.div`
  height: 1px;
  margin-top: 14px;
  background: linear-gradient(90deg, rgba(135, 128, 191, 0) 0.84%, #8780bf 28.45%, rgba(135, 128, 191, 0) 100.17%);
`;

const MobileOptionDivider = styled.div`
  height: 1px;
  background: linear-gradient(90deg, rgba(135, 128, 191, 0) 0.84%, #8780bf 28.45%, rgba(135, 128, 191, 0) 100.17%);
`;

const DesktopWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100vh;
`;

const MobileWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const GasInfo = styled.div`
  display: flex;
  margin-left: 12px;
  padding: 4px 5px;
  border: 1px solid rgba(242, 153, 74, 0.65);
  background: rgba(242, 153, 74, 0.08);
  border-radius: 6px;

  div {
    color: ${({ theme }) => theme.orange1};
  }

  align-items: center;
`;

const AnimatedMobileMenu = styled(MobileMenu)`
  position: fixed;
  right: 0;
  left: 0;
  top: ${(props) => (props.open ? '0' : '-100%')};
  background-color: ${({ theme }) => theme.bg7};
  border-radius: 0 0 8px 8px;
  color: #fff;
  transition: top ease 0.3s;
  z-index: 100;
`;

const Overlay = styled.div`
  position: fixed;
  right: 0;
  left: 0;
  top: 0;
  bottom: 0;
  background-color: ${transparentize(0.4, '#000')};
  opacity: ${({ show }) => (show ? 1 : 0)};
  transform: translateY(${(props) => (props.show ? '0' : '10000000px')});
  transition: ${(props) => (props.show ? 'opacity 0.3s ease' : 'transform 0.3s ease 0.3s, opacity 0.3s ease')};
`;

export {
  Wrapper,
  Option,
  OptionDivider,
  MobileOptionDivider,
  DesktopWrapper,
  MobileWrapper,
  GasInfo,
  AnimatedMobileMenu,
  Overlay,
};
