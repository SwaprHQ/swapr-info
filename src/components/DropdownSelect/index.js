import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown as Arrow } from 'react-feather';
import { useClickAway } from 'react-use';
import styled from 'styled-components';

import { StyledIcon } from '..';
import { Typography } from '../../Theme';
import ArbitrumLogo from '../../assets/svg/arbitrum-one-logo.svg';
import EthereumLogo from '../../assets/svg/ethereum-logo.svg';
import GnosisLogo from '../../assets/svg/gnosis-chain-logo.svg';
import { SupportedNetwork } from '../../constants';
import { AutoColumn } from '../Column';
import Row, { RowBetween } from '../Row';

const NetworkLogo = {
  [SupportedNetwork.MAINNET]: EthereumLogo,
  [SupportedNetwork.ARBITRUM_ONE]: ArbitrumLogo,
  [SupportedNetwork.XDAI]: GnosisLogo,
};

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

const Icon = ({ network }) => {
  if (NetworkLogo[network] === undefined) {
    return null;
  }

  return (
    <IconWrapper size={20}>
      <img src={NetworkLogo[network]} alt={network} />
    </IconWrapper>
  );
};

export default function DropdownSelect({ options, active, disabled, setActive, color, width = null }) {
  const [showDropdown, toggleDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const containerRef = useRef(null);

  useClickAway(dropdownRef, (event) => {
    if (showDropdown && !containerRef.current.contains(event.target)) toggleDropdown(false);
  });

  // Preload network logos
  useEffect(() => {
    Object.values(NetworkLogo).forEach((image) => {
      new Image().src = image;
    });
  }, []);

  return (
    <Wrapper open={showDropdown} color={color} ref={containerRef} width={width} disabled={disabled}>
      {disabled ? (
        <RowBetween justify={'center'}>
          <Typography.smallHeader display={'flex'} color={'disabled'}>
            {active}
          </Typography.smallHeader>
          <StyledIcon disabled={disabled}>
            <ArrowStyled />
          </StyledIcon>
        </RowBetween>
      ) : (
        <RowBetween onClick={() => toggleDropdown(!showDropdown)} justify={'center'}>
          <Typography.smallHeader color={'text8'} display={'flex'}>
            <Icon network={active} />
            {active}
          </Typography.smallHeader>
          <StyledIcon>
            <ArrowStyled />
          </StyledIcon>
        </RowBetween>
      )}
      {showDropdown && (
        <Dropdown>
          <div ref={dropdownRef}>
            <AutoColumn gap={'20px'}>
              {Object.keys(options).map((key, index) => {
                let option = options[key];
                return (
                  option !== active && (
                    <Row
                      onClick={() => {
                        toggleDropdown(!showDropdown);
                        setActive(option);
                      }}
                      key={index}
                    >
                      <Typography.smallHeader color={'text8'} sx={{ ':hover': { color: '#EBE9F8' } }} display={'flex'}>
                        <Icon network={option} />
                        {option}
                      </Typography.smallHeader>
                    </Row>
                  )
                );
              })}
            </AutoColumn>
          </div>
        </Dropdown>
      )}
    </Wrapper>
  );
}
