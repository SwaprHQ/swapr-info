import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';

import EthereumLogo from '../../assets/images/eth.png';
import SWPRLogo from '../../assets/images/swpr-logo.png';
import xDAILogo from '../../assets/images/xdai-logo.png';
import DXDLogo from '../../assets/svg/dxd-logo.svg';
import { DXD_ADDRESS, SWPR_ADDRESS, SupportedNetwork } from '../../constants';
import { useNativeCurrencyWrapper, useSelectedNetwork } from '../../contexts/Network';
import { useTokenIcon } from '../../hooks/useTokenIcon';
import { Inline, Image } from './styled';

const BAD_URLS = {};

const TokenLogo = ({ address, defaultText = '?', size = '24px', flexBasis, justifyContent, source, ...rest }) => {
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

  const src = source ? source : sources.find((url) => !BAD_URLS[url]);

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
};

TokenLogo.propTypes = {
  address: PropTypes.string,
  defaultText: PropTypes.string,
  size: PropTypes.string,
  flexBasis: PropTypes.string,
  justifyContent: PropTypes.string,
  source: PropTypes.string,
};

export default TokenLogo;
