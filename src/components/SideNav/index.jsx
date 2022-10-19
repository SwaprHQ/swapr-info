import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import { TrendingUp, List, PieChart, Disc, Layers, Menu } from 'react-feather';
import { withRouter } from 'react-router-dom';
import { Flex } from 'rebass';

import { Typography } from '../../Theme';
import Farms from '../../assets/icons/Farm';
import { ReactComponent as GasInfoSvg } from '../../assets/svg/gas-info.svg';
import { SupportedNetwork } from '../../constants';
import { useNativeCurrencyPrice } from '../../contexts/GlobalData';
import { useNativeCurrencySymbol, useSelectedNetwork, useSelectedNetworkUpdater } from '../../contexts/Network';
import { useGasInfo } from '../../hooks/useGasInfo';
import { useIsBelowPx } from '../../hooks/useIsBelowPx';
import { useSwprPrice } from '../../hooks/useSwprPrice';
import { formattedNum } from '../../utils';
import { AutoColumn } from '../Column';
import DropdownNetworkSelect from '../DropdownNetworkSelect';
import Icon from '../Icon';
import Link, { BasicLink } from '../Link';
import Polling from '../Polling';
import Title from '../Title';
import {
  Wrapper,
  Option,
  OptionDivider,
  DesktopWrapper,
  MobileWrapper,
  GasInfo,
  AnimatedMobileMenu,
  Overlay,
} from './styled';

const SideNav = ({ history }) => {
  const isBelow350px = useIsBelowPx(350);
  const below1080 = useIsBelowPx(1080);
  const below1180 = useIsBelowPx(1180);

  const selectedNetwork = useSelectedNetwork();
  const updateSelectedNetwork = useSelectedNetworkUpdater();

  const { gas } = useGasInfo();
  const { loading, price } = useSwprPrice();
  const nativeCurrencySymbol = useNativeCurrencySymbol();
  const [nativeCurrencyPrice] = useNativeCurrencyPrice();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [swprPrice, setSwprPrice] = useState(0);

  const formattedNativeCurrencyPrice = nativeCurrencyPrice ? formattedNum(nativeCurrencyPrice, true) : '-';
  const formattedSwprPrice = swprPrice ? formattedNum(swprPrice, true) : '-';

  useEffect(() => {
    if (!loading && nativeCurrencyPrice) {
      setSwprPrice(price * nativeCurrencyPrice);
    }
  }, [loading, price, nativeCurrencyPrice, swprPrice]);

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
        <DesktopWrapper style={{ marginTop: '36px', marginLeft: '16px' }}>
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
            <AutoColumn gap={'lg'} style={{ marginTop: '1rem' }}>
              <BasicLink to="/dashboard">
                <Option activeText={history.location.pathname === '/dashboard' ?? undefined}>
                  <Layers size={20} style={{ marginRight: '.75rem' }} />
                  Dashboard
                </Option>
                <OptionDivider />
              </BasicLink>
              <BasicLink to="/home">
                <Option activeText={history.location.pathname === '/home' ?? undefined}>
                  <TrendingUp size={20} style={{ marginRight: '.75rem' }} />
                  Overview
                </Option>
                <OptionDivider />
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
                <OptionDivider />
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
                <OptionDivider />
              </BasicLink>
              <BasicLink to="/farming">
                <Option activeText={history.location.pathname.split('/')[1] === 'farming' ?? undefined}>
                  <Icon
                    icon={
                      <Farms
                        height={20}
                        width={20}
                        color={history.location.pathname.split('/')[1] === 'farming' ? 'text1' : 'text10'}
                      />
                    }
                  />
                  Farms
                </Option>
                <OptionDivider />
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
                <OptionDivider />
              </BasicLink>
            </AutoColumn>
          </AutoColumn>
          <AutoColumn gap={'12px'} style={{ marginBottom: '4rem' }}>
            <Typography.Text>
              <Link external={true} color={'text10'} href="https://swapr.eth.limo">
                Swapr
              </Link>
            </Typography.Text>
            <Typography.Text>
              <Link external={true} color={'text10'} href="https://dxdao.eth.limo">
                DXdao
              </Link>
            </Typography.Text>
            <Typography.Text>
              <Link external={true} color={'text10'} href="https://twitter.com/SwaprEth">
                Twitter
              </Link>
            </Typography.Text>
            <Typography.Text>
              <Link external={true} color={'text10'} href="https://discord.com/invite/4QXEJQkvHH">
                Discord
              </Link>
            </Typography.Text>
            <Typography.Text>
              <Link external={true} color={'text10'} href="https://github.com/SwaprDAO/swapr-info">
                Github
              </Link>
            </Typography.Text>
            <Typography.Text>
              <Link external={true} color={'text10'} href="https://dxdocs.eth.limo">
                DXdocs
              </Link>
            </Typography.Text>
            <Flex marginTop={'6px'} style={{ gap: '16px' }}>
              <Flex alignItems={'center'} style={{ gap: '4px' }}>
                <Typography.SmallText>{nativeCurrencySymbol}: </Typography.SmallText>
                <Typography.Custom sx={{ display: 'inline', fontWeight: 700, fontSize: 10 }}>
                  {formattedNativeCurrencyPrice}
                </Typography.Custom>
              </Flex>
              <Flex alignItems={'center'} style={{ gap: '4px' }}>
                <Typography.SmallText>SWPR: </Typography.SmallText>
                <Typography.Custom sx={{ display: 'inline', fontWeight: 700, fontSize: 10 }}>
                  {formattedSwprPrice}
                </Typography.Custom>
              </Flex>
            </Flex>
            {!below1180 && (
              <Flex>
                <Polling />
                {gas.normal > 0 && (
                  <GasInfo>
                    <GasInfoSvg />
                    <Typography.TinyText sx={{ marginLeft: '2px' }}>{gas.normal}</Typography.TinyText>
                  </GasInfo>
                )}
              </Flex>
            )}
          </AutoColumn>
        </DesktopWrapper>
      ) : (
        <>
          <AnimatedMobileMenu open={mobileMenuOpen} onClose={handleMobileMenuClose} />
          <Overlay show={mobileMenuOpen} onClick={handleMobileMenuClose} />
          <MobileWrapper>
            {isBelow350px ? (
              <Flex alignItems={'center'} justifyContent={'space-between'} style={{ width: '100%' }}>
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
                <span onClick={handleMobileMenuOpen}>
                  <Icon icon={<Menu height={26} width={26} />} color={'text1'} />
                </span>
              </Flex>
            ) : (
              <Flex alignItems={'center'} justifyContent={'space-between'} style={{ width: '100%' }}>
                <Title />
                <Flex alignItems={'center'} style={{ gap: '8px' }}>
                  {history.location.pathname !== '/dashboard' ? (
                    <DropdownNetworkSelect
                      active={selectedNetwork}
                      setActive={handleSelectedNetworkChange}
                      options={Object.values(SupportedNetwork)}
                    />
                  ) : (
                    <DropdownNetworkSelect active={'All'} disabled={true} options={[{ ALL: 'All' }]} />
                  )}
                  <span onClick={handleMobileMenuOpen}>
                    <Icon icon={<Menu height={26} width={26} />} color={'text1'} />
                  </span>
                </Flex>
              </Flex>
            )}
          </MobileWrapper>
        </>
      )}
    </Wrapper>
  );
};

SideNav.propTypes = {
  history: PropTypes.object,
};

export default withRouter(SideNav);
