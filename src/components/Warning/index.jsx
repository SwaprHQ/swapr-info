import PropTypes from 'prop-types';
import { Text } from 'rebass';

import { Hover } from '..';
import { useSelectedNetwork } from '../../contexts/Network';
import { useIsBelowPx } from '../../hooks/useIsBelowPx';
import { getExplorerLink } from '../../utils';
import { ButtonDark } from '../ButtonStyled';
import { AutoColumn } from '../Column';
import Link from '../Link';
import { RowBetween, RowFixed } from '../Row';
import { WarningWrapper, StyledWarningIcon } from './styled';

const Warning = ({ type, show, setShow, address }) => {
  const isBelow800px = useIsBelowPx(800);
  const selectedNetwork = useSelectedNetwork();

  const textContent = isBelow800px ? (
    <div>
      <Text fontWeight={500} lineHeight={'145.23%'} mt={'10px'}>
        Anyone can create and name any ERC20 token on Ethereum, including creating fake versions of existing tokens and
        tokens that claim to represent projects that do not have a token.
      </Text>
      <Text fontWeight={500} lineHeight={'145.23%'} mt={'10px'}>
        Similar to Etherscan, this site automatically tracks analytics for all ERC20 tokens independent of token
        integrity. Please do your own research before interacting with any ERC20 token.
      </Text>
    </div>
  ) : (
    <Text fontWeight={500} lineHeight={'145.23%'} mt={'10px'}>
      Anyone can create and name any ERC20 token on Ethereum, including creating fake versions of existing tokens and
      tokens that claim to represent projects that do not have a token. Similar to Etherscan, this site automatically
      tracks analytics for all ERC20 tokens independent of token integrity. Please do your own research before
      interacting with any ERC20 token.
    </Text>
  );

  return (
    <WarningWrapper show={show}>
      <AutoColumn gap="4px">
        <RowFixed>
          <StyledWarningIcon />
          <Text fontWeight={600} lineHeight={'145.23%'} ml={'10px'}>
            Token Safety Alert
          </Text>
        </RowFixed>
        {textContent}
        {isBelow800px ? (
          <div>
            <Hover style={{ marginTop: '10px' }}>
              <Link
                fontWeight={500}
                lineHeight={'145.23%'}
                color={'#2172E5'}
                href={getExplorerLink(selectedNetwork, address, 'address')}
                target="_blank"
              >
                View {type === 'token' ? 'token' : 'pair'} contract on block explorer
              </Link>
            </Hover>
            <RowBetween style={{ marginTop: '20px' }}>
              <div />
              <ButtonDark color={'#f82d3a'} style={{ minWidth: '140px' }} onClick={() => setShow(false)}>
                I understand
              </ButtonDark>
            </RowBetween>
          </div>
        ) : (
          <RowBetween style={{ marginTop: '10px' }}>
            <Hover>
              <Link
                fontWeight={500}
                lineHeight={'145.23%'}
                color={'#2172E5'}
                href={getExplorerLink(selectedNetwork, address, 'address')}
                target="_blank"
              >
                View {type === 'token' ? 'token' : 'pair'} contract on block explorer
              </Link>
            </Hover>
            <ButtonDark color={'#f82d3a'} style={{ minWidth: '140px' }} onClick={() => setShow(false)}>
              I understand
            </ButtonDark>
          </RowBetween>
        )}
      </AutoColumn>
    </WarningWrapper>
  );
};

Warning.propTypes = {
  type: PropTypes.string,
  show: PropTypes.bool,
  setShow: PropTypes.func,
  address: PropTypes.string,
};

export default Warning;
