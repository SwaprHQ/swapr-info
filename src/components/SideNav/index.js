import { transparentize } from 'polished';
import React, { useCallback, useState } from 'react';
import { TrendingUp, List, PieChart, Disc, Menu, Layers } from 'react-feather';
import { withRouter } from 'react-router-dom';
import { useMedia } from 'react-use';
import styled from 'styled-components';

import { TYPE, Typography } from '../../Theme';
import Farms from '../../assets/icons/Farm';
import { SupportedNetwork } from '../../constants';
import { useSessionStart } from '../../contexts/Application';
import { useSelectedNetwork, useSelectedNetworkUpdater } from '../../contexts/Network';
import { AutoColumn } from '../Column';
import DropdownNetworkSelect from '../DropdownNetworkSelect';
import Icon from '../Icon';
import Link, { BasicLink } from '../Link';
import { AutoRow } from '../Row';
import Title from '../Title';
import { MobileMenu } from './MobileMenu';

const Wrapper = styled.div`
  height: ${({ isMobile }) => (isMobile ? 'initial' : 'calc(100vh - 36px)')};
  padding-left: 36px;
  background-color: ${({ theme }) => transparentize(0.4, theme.bg1)};
  color: ${({ theme }) => theme.text1};
  position: sticky;
  top: 0px;
  background-color: ${({ theme }) => theme.bg1};
  color: ${({ theme }) => theme.bg2};

  @media screen and (max-width: 800px) {
    grid-template-columns: 1fr;
    position: relative;
  }

  @media screen and (max-width: 600px) {
    padding: 1rem;
  }
`;

export const Option = styled(Typography.text)`
  color: ${({ activeText, theme }) => (activeText ? theme.text1 : theme.text10)};
  display: flex;
  align-items: center;

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

const MenuIcon = styled(Menu)`
  color: #fff;
`;

const HeaderText = styled.div`
  margin-right: 0.75rem;
  font-size: 0.825rem;
  font-weight: 500;
  display: inline-box;
  display: -webkit-inline-box;
  opacity: 0.8;
  :hover {
    opacity: 1;
  }
  a {
    color: ${({ theme }) => theme.white};
  }
`;

const Polling = styled.div`
  position: fixed;
  display: flex;
  left: 0;
  bottom: 0;
  padding: 1rem;
  color: white;
  opacity: 0.4;
  transition: opacity 0.25s ease;
  :hover {
    opacity: 1;
  }
`;

const PollingDot = styled.div`
  width: 8px;
  height: 8px;
  min-height: 8px;
  min-width: 8px;
  margin-right: 0.5rem;
  margin-top: 3px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.green1};
`;

const AnimatedMobileMenu = styled(MobileMenu)`
  position: fixed;
  right: 0;
  left: 0;
  top: ${(props) => (props.open ? '0' : '-100%')};
  background-color: ${({ theme }) => theme.bg1};
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
  background-color: ${transparentize(0.7, '#000')};
  opacity: ${({ show }) => (show ? 1 : 0)};
  transform: translateY(${(props) => (props.show ? '0' : '10000000px')});
  transition: ${(props) => (props.show ? 'opacity 0.3s ease' : 'transform 0.3s ease 0.3s, opacity 0.3s ease')};
`;

function SideNav({ history }) {
  const below1080 = useMedia('(max-width: 1080px)');

  const below1180 = useMedia('(max-width: 1180px)');

  const seconds = useSessionStart();

  const selectedNetwork = useSelectedNetwork();
  const updateSelectedNetwork = useSelectedNetworkUpdater();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMobileMenuOpen = () => {
    setMobileMenuOpen(true);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
  };

  const handleSelectedNetworkChange = useCallback(
    (network) => {
      updateSelectedNetwork(network);
      history.push('/');
    },
    [updateSelectedNetwork, history],
  );

  return (
    <Wrapper isMobile={below1080}>
      {!below1080 ? (
        <DesktopWrapper style={{ marginTop: '36px' }}>
          <AutoColumn gap={'24px'}>
            <Title />
            {history.location.pathname !== '/dashboard' ? (
              <DropdownNetworkSelect
                active={selectedNetwork}
                setActive={handleSelectedNetworkChange}
                options={Object.values(SupportedNetwork)}
              />
            ) : (
              <DropdownNetworkSelect active={'All'} disabled={true} options={[{ ALL: 'All' }]} />
            )}
            {!below1080 && (
              <AutoColumn gap={'lg'} style={{ marginTop: '1rem' }}>
                <BasicLink to="/dashboard">
                  <Option activeText={history.location.pathname === '/dashboard' ?? undefined}>
                    <Layers size={20} style={{ marginRight: '.75rem' }} />
                    Dashboard
                  </Option>
                </BasicLink>
                <BasicLink to="/home">
                  <Option activeText={history.location.pathname === '/home' ?? undefined}>
                    <TrendingUp size={20} style={{ marginRight: '.75rem' }} />
                    Overview
                  </Option>
                </BasicLink>
                <BasicLink to="/tokens">
                  <Option
                    activeText={
                      (history.location.pathname.split('/')[1] === 'tokens' ||
                        history.location.pathname.split('/')[1] === 'token') ??
                      undefined
                    }
                  >
                    <Disc size={20} style={{ marginRight: '.75rem' }} />
                    Tokens
                  </Option>
                </BasicLink>
                <BasicLink to="/pairs">
                  <Option
                    activeText={
                      (history.location.pathname.split('/')[1] === 'pairs' ||
                        history.location.pathname.split('/')[1] === 'pair') ??
                      undefined
                    }
                  >
                    <PieChart size={20} style={{ marginRight: '.75rem' }} />
                    Pairs
                  </Option>
                </BasicLink>
                <BasicLink to="/farming">
                  <Option
                    activeText={
                      (history.location.pathname.split('/')[1] === 'farming' ||
                        history.location.pathname.split('/')[1] === 'farming') ??
                      undefined
                    }
                  >
                    <Icon
                      icon={
                        <Farms
                          height={20}
                          width={20}
                          color={
                            history.location.pathname.split('/')[1] === 'farming' ||
                            history.location.pathname.split('/')[1] === 'farming'
                              ? 'text1'
                              : 'text10'
                          }
                        />
                      }
                    />
                    Farms
                  </Option>
                </BasicLink>

                <BasicLink to="/accounts">
                  <Option
                    activeText={
                      (history.location.pathname.split('/')[1] === 'accounts' ||
                        history.location.pathname.split('/')[1] === 'account') ??
                      undefined
                    }
                  >
                    <List size={20} style={{ marginRight: '.75rem' }} />
                    Accounts
                  </Option>
                </BasicLink>
              </AutoColumn>
            )}
          </AutoColumn>
          <AutoColumn gap="0.5rem" style={{ marginLeft: '.75rem', marginBottom: '4rem' }}>
            <HeaderText>
              <Link href="https://dxdao.eth.link" target="_blank">
                DXdao
              </Link>
            </HeaderText>
            <HeaderText>
              <Link href="https://twitter.com/SwaprEth" target="_blank">
                Twitter
              </Link>
            </HeaderText>
          </AutoColumn>
          {!below1180 && (
            <Polling style={{ marginLeft: '.5rem' }}>
              <PollingDot />
              <a href="/" style={{ color: 'white' }}>
                <TYPE.small color={'white'}>
                  Updated {seconds ? seconds + 's' : '-'} ago <br />
                </TYPE.small>
              </a>
            </Polling>
          )}
        </DesktopWrapper>
      ) : (
        <>
          <AnimatedMobileMenu open={mobileMenuOpen} onClose={handleMobileMenuClose} />
          <Overlay show={mobileMenuOpen} onClick={handleMobileMenuClose} />
          <MobileWrapper>
            <Title />
            <AutoRow justify="flex-end" gap="8px">
              {history.location.pathname !== '/dashboard' ? (
                <DropdownNetworkSelect
                  active={selectedNetwork}
                  setActive={handleSelectedNetworkChange}
                  options={Object.values(SupportedNetwork)}
                />
              ) : (
                <DropdownNetworkSelect active={'All'} disabled={true} options={[{ ALL: 'All' }]} />
              )}
              <MenuIcon onClick={handleMobileMenuOpen} />
            </AutoRow>
          </MobileWrapper>
        </>
      )}
    </Wrapper>
  );
}

export default withRouter(SideNav);
