import React, { useMemo } from "react";
import styled from "styled-components";
import EthereumLogo from "../../assets/eth.png";
import xDAILogo from "../../assets/xdai-logo.png";
import DXDLogo from "../../assets/dxd-logo.svg";
import SWPRLogo from "../../assets/swpr-logo.png";
import {
  useNativeCurrencyWrapper,
  useSelectedNetwork,
} from "../../contexts/Network.js";
import {
  DXD_ADDRESS,
  SWPR_ADDRESS,
  SupportedNetwork,
} from "../../constants/index.js";
import { useTokenIcon } from "../../hooks/useTokenIcon.js";
import { getAddress } from "@ethersproject/address";
import {
  useBadImageUrls,
  useBadImageUrlsUpdater,
} from "../../contexts/Application";

const Inline = styled.div`
  display: flex;
  align-items: center;
  align-self: center;
`;

const Image = styled.img`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  background-color: white;
  border-radius: 50%;
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
`;

export default function TokenLogo({
  address,
  defaultText = "?",
  header = false,
  size = "24px",
  ...rest
}) {
  const updateBadImageUrls = useBadImageUrlsUpdater();
  const badImages = useBadImageUrls();
  const selectedNetwork = useSelectedNetwork();
  const nativeCurrencyWrapper = useNativeCurrencyWrapper();
  const tokenIcon = useTokenIcon(address);
  const source = useMemo(() => {
    if (!address) return [];
    const lowercaseAddress = address.toLowerCase();
    if (lowercaseAddress === nativeCurrencyWrapper.address.toLowerCase()) {
      return selectedNetwork === SupportedNetwork.XDAI
        ? xDAILogo
        : EthereumLogo;
    }
    if (lowercaseAddress === DXD_ADDRESS[selectedNetwork].toLowerCase())
      return DXDLogo;
    if (
      SWPR_ADDRESS[selectedNetwork] &&
      lowercaseAddress === SWPR_ADDRESS[selectedNetwork].toLowerCase()
    )
      return SWPRLogo;
    const trustWalletIcon = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${getAddress(
      address
    )}/logo.png`;
    if (!badImages[trustWalletIcon]) return trustWalletIcon;
    if (tokenIcon && !badImages[tokenIcon]) return tokenIcon;
    return null;
  }, [address, tokenIcon, nativeCurrencyWrapper, selectedNetwork, badImages]);

  if (!!!source) {
    const numberSize = size ? parseInt(size.replace("px", "")) : 24;
    const fontSize = Math.ceil(numberSize / 4.5);
    return (
      <Inline>
        <svg height={numberSize} width={numberSize} {...rest} fill="none">
          <circle
            cx={numberSize / 2}
            cy={numberSize / 2}
            r={numberSize / 2}
            fill="#fff"
          />
          <text
            fill="#000"
            stroke="none"
            fontSize={fontSize}
            fontWeight="600"
            x={numberSize / 2}
            y={numberSize / 2 + Math.floor(fontSize / 2)}
            textAnchor="middle"
          >
            {defaultText.length > 4
              ? `${defaultText.slice(0, 4).toUpperCase()}...`
              : defaultText.toUpperCase()}
          </text>
        </svg>
      </Inline>
    );
  }

  return (
    <Inline>
      <Image
        {...rest}
        alt={defaultText}
        src={source}
        size={size}
        onError={(event) => {
          updateBadImageUrls(source);
          event.preventDefault();
        }}
      />
    </Inline>
  );
}
