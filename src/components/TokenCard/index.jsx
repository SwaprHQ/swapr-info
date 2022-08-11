import PropTypes from 'prop-types';

import { Typography } from '../../Theme';
import { formattedNum, formattedPercent } from '../../utils';
import TokenLogo from '../TokenLogo';
import { PercentageChange, Wrapper } from './styled';

const TokenCard = ({ address, symbol, price, priceChange }) => {
  return (
    <Wrapper isNegative={priceChange < 0}>
      <TokenLogo address={address} />
      <div>
        <Typography.Text color={'text8'}>{symbol}</Typography.Text>
        <Typography.BoldText color={'text9'}>{formattedNum(price, true)}</Typography.BoldText>
      </div>
      <PercentageChange>{formattedPercent(priceChange)}</PercentageChange>
    </Wrapper>
  );
};

TokenCard.propTypes = {
  address: PropTypes.string,
  symbol: PropTypes.string,
  price: PropTypes.number,
  priceChange: PropTypes.number,
};

export default TokenCard;
