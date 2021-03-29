import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { isAddress } from "../../utils/index.js";
import EthereumLogo from "../../assets/eth.png";
import xDAILogo from "../../assets/xdai-logo.png";
import {
  useNativeCurrencyWrapper,
  useSelectedNetwork,
} from "../../contexts/Network.js";
import { SupportedNetwork } from "../../constants/index.js";

const BAD_IMAGES = {};

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

const StyledNativeCurrencyLogo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  > img {
    width: ${({ size }) => size};
    height: ${({ size }) => size};
  }
`;

export default function TokenLogo({
  address,
  defaultText = "?",
  header = false,
  size = "24px",
  ...rest
}) {
  const selectedNetwork = useSelectedNetwork();
  const nativeCurrencyWrapper = useNativeCurrencyWrapper();
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [address]);

  if (error || BAD_IMAGES[address]) {
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

  // hard coded fixes for trust wallet api issues
  if (address?.toLowerCase() === "0x5e74c9036fb86bd7ecdcb084a0673efc32ea31cb") {
    address = "0x42456d7084eacf4083f1140d3229471bba2949a8";
  }

  if (address?.toLowerCase() === "0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f") {
    address = "0xc011a72400e58ecd99ee497cf89e3775d4bd732f";
  }

  if (address?.toLowerCase() === nativeCurrencyWrapper.address) {
    return (
      <StyledNativeCurrencyLogo size={size} {...rest}>
        <img
          src={
            selectedNetwork === SupportedNetwork.XDAI ? xDAILogo : EthereumLogo
          }
          style={{
            boxShadow: "0px 6px 10px rgba(0, 0, 0, 0.075)",
            borderRadius: "24px",
          }}
          alt=""
        />
      </StyledNativeCurrencyLogo>
    );
  }

  const path = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${isAddress(
    address
  )}/logo.png`;

  return (
    <Inline>
      <Image
        {...rest}
        alt={""}
        src={path}
        size={size}
        onError={(event) => {
          BAD_IMAGES[address] = true;
          setError(true);
          event.preventDefault();
        }}
      />
    </Inline>
  );
}
