import React, { useMemo } from 'react';
import styled from 'styled-components';

import { getAddress } from '@ethersproject/address';

import EthereumLogo from '../../assets/images/eth.png';
import SWPRLogo from '../../assets/images/swpr-logo.png';
import xDAILogo from '../../assets/images/xdai-logo.png';
import DXDLogo from '../../assets/svg/dxd-logo.svg';
import { DXD_ADDRESS, SWPR_ADDRESS, SupportedNetwork } from '../../constants/index.js';
import { useBadImageUrls, useBadImageUrlsUpdater } from '../../contexts/Application';
import { useNativeCurrencyWrapper, useSelectedNetwork } from '../../contexts/Network.js';
import { useTokenIcon } from '../../hooks/useTokenIcon.js';

const Inline = styled.div`
  display: flex;
  align-items: center;
  align-self: center;
  flex-basis: ${({ flexBasis }) => flexBasis};
  justify-content: ${({ justifyContent }) => justifyContent};
`;

const Image = styled.img`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  background-color: white;
  border-radius: 50%;
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
`;

export default function TokenLogo({ address, defaultText = '?', size = '24px', flexBasis, justifyContent, ...rest }) {
  const updateBadImageUrls = useBadImageUrlsUpdater();
  const badImages = useBadImageUrls();
  const selectedNetwork = useSelectedNetwork();
  const nativeCurrencyWrapper = useNativeCurrencyWrapper();
  const tokenIcon = useTokenIcon(address);

  const source = useMemo(() => {
    if (!address) return [];

    const lowercaseAddress = address.toLowerCase();

    if (lowercaseAddress === nativeCurrencyWrapper.address.toLowerCase()) {
      return selectedNetwork === SupportedNetwork.XDAI ? xDAILogo : EthereumLogo;
    }
    if (lowercaseAddress === DXD_ADDRESS[selectedNetwork].toLowerCase()) {
      return DXDLogo;
    }
    if (SWPR_ADDRESS[selectedNetwork] && lowercaseAddress === SWPR_ADDRESS[selectedNetwork].toLowerCase()) {
      return SWPRLogo;
    }

    if (tokenIcon && !badImages[tokenIcon]) {
      return tokenIcon;
    }

    const trustWalletIcon = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${getAddress(
      address,
    )}/logo.png`;

    if (!badImages[trustWalletIcon]) {
      return trustWalletIcon;
    }

    return null;
  }, [address, tokenIcon, nativeCurrencyWrapper, selectedNetwork, badImages]);

  if (!source) {
    const numberSize = size ? parseInt(size.replace('px', '')) : 24;
    const fontSize = Math.ceil(numberSize / 4.5);
    return (
      <Inline flexBasis={flexBasis} justifyContent={justifyContent}>
        <svg height={numberSize} width={numberSize} {...rest} fill="none">
          <circle cx={numberSize / 2} cy={numberSize / 2} r={numberSize / 2} fill="#fff" />
          <text
            fill="#000"
            stroke="none"
            fontSize={fontSize}
            fontWeight="600"
            x={numberSize / 2}
            y={numberSize / 2 + Math.floor(fontSize / 2)}
            textAnchor="middle"
          >
            {defaultText.length > 4 ? `${defaultText.slice(0, 4).toUpperCase()}...` : defaultText.toUpperCase()}
          </text>
        </svg>
      </Inline>
    );
  }

  return (
    <Inline flexBasis={flexBasis} justifyContent={justifyContent}>
      <Image
        {...rest}
        alt=""
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
