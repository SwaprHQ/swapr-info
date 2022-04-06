import React, { useRef, useState } from "react";
import styled from "styled-components";

import Row, { RowBetween } from "../Row";
import { AutoColumn } from "../Column";
import { ChevronDown as Arrow } from "react-feather";
import { TYPE } from "../../Theme";
import { StyledIcon } from "..";
import { useClickAway } from "react-use";
import { SupportedNetwork } from "../../constants";
import EthereumLogo from "../../assets/svg/ethereum-logo.svg";
import GnosisLogo from "../../assets/svg/gnosis-chain-logo.svg";
import ArbitrumLogo from "../../assets/svg/arbitrum-one-logo.svg";

const NetworkLogo = {
  [SupportedNetwork.MAINNET]: EthereumLogo,
  [SupportedNetwork.ARBITRUM_ONE]: ArbitrumLogo,
  [SupportedNetwork.XDAI]: GnosisLogo,
};

const Wrapper = styled.div`
  z-index: 20;
  position: relative;
  background-color: ${({ theme }) => theme.panelColor};
  border: 1px solid ${({ color, theme }) => color || theme.primary4};
  width: ${({ width }) => (width ? width : "150px")};
  padding: 4px 10px;
  padding-right: 6px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;

  :hover {
    cursor: pointer;
  }
`;

const IconWrapper = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;

  & > img {
    height: 20px;
  }
`;

const Dropdown = styled.div`
  position: absolute;
  top: 38px;
  padding-top: 40px;
  background-color: ${({ theme }) => theme.bg1};
  border: 1px solid rgba(0, 0, 0, 0.15);
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

const DropdownSelect = ({
  options,
  active,
  setActive,
  color,
  width = null,
}) => {
  const [showDropdown, toggleDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const containerRef = useRef(null);
  useClickAway(dropdownRef, event => {
    if (showDropdown && !containerRef.current.contains(event.target))
      toggleDropdown(false);
  });

  return (
    <Wrapper open={showDropdown} color={color} ref={containerRef} width={width}>
      <RowBetween
        onClick={() => toggleDropdown(!showDropdown)}
        justify="center"
      >
        <TYPE.main display="flex">
          <Icon network={active} />
          {active}
        </TYPE.main>
        <StyledIcon>
          <ArrowStyled />
        </StyledIcon>
      </RowBetween>
      {showDropdown && (
        <Dropdown>
          <div ref={dropdownRef}>
            <AutoColumn gap="20px">
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
                      <TYPE.body fontSize={14} display="flex">
                        <Icon network={option} />
                        {option}
                      </TYPE.body>
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
};

export default DropdownSelect;
