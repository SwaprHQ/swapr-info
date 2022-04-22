import React, { useMemo, useState } from 'react';
import styled from 'styled-components';

import EthereumLogo from '../../assets/images/eth.png';
import SWPRLogo from '../../assets/images/swpr-logo.png';
import xDAILogo from '../../assets/images/xdai-logo.png';
import DXDLogo from '../../assets/svg/dxd-logo.svg';
import { DXD_ADDRESS, SWPR_ADDRESS, SupportedNetwork } from '../../constants/index.js';
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
  padding: 1px;
`;

const BAD_URLS = {};

export default function TokenLogo({ address, defaultText = '?', size = '24px', flexBasis, justifyContent, ...rest }) {
  const selectedNetwork = useSelectedNetwork();
  const nativeCurrencyWrapper = useNativeCurrencyWrapper();
  const tokenIcons = useTokenIcon(address);
  const [, refresh] = useState(0);

  const sources = useMemo(() => {
    if (!address) return [];

    const lowercaseAddress = address.toLowerCase();

    if (lowercaseAddress === nativeCurrencyWrapper.address.toLowerCase()) {
      return selectedNetwork === SupportedNetwork.XDAI ? [xDAILogo] : [EthereumLogo];
    }

    if (lowercaseAddress === DXD_ADDRESS[selectedNetwork].toLowerCase()) {
      return [DXDLogo];
    }

    if (SWPR_ADDRESS[selectedNetwork] && lowercaseAddress === SWPR_ADDRESS[selectedNetwork].toLowerCase()) {
      return [SWPRLogo];
    }

    if (tokenIcons) {
      return tokenIcons;
    }

    return [];
  }, [address, tokenIcons, nativeCurrencyWrapper, selectedNetwork]);

  const src = sources.find((url) => !BAD_URLS[url]);

  if (src) {
    return (
      <Inline flexBasis={flexBasis} justifyContent={justifyContent}>
        <Image
          {...rest}
          alt={defaultText}
          src={src}
          size={size}
          onError={() => {
            BAD_URLS[src] = true;
            refresh((i) => i + 1);
          }}
        />
      </Inline>
    );
  }

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
