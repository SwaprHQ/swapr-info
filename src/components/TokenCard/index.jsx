import PropTypes from 'prop-types';

import { Typography } from '../../Theme';
import { formattedNum, formattedPercent } from '../../utils';
import { InternalListLink } from '../Link';
import TokenLogo from '../TokenLogo';
import { PercentageChange, Wrapper } from './styled';

const TokenCard = ({ address, symbol, price, priceChange, margin }) => {
  return (
    <InternalListLink to={'/token/' + address}>
      <Wrapper isNegative={priceChange < 0} margin={margin}>
        <TokenLogo address={address} />
        <div>
          <Typography.Text color={'text8'}>{symbol}</Typography.Text>
          <Typography.BoldText color={'text9'}>{formattedNum(price, true)}</Typography.BoldText>
        </div>
        <PercentageChange>{formattedPercent(priceChange)}</PercentageChange>
      </Wrapper>
    </InternalListLink>
  );
};

TokenCard.propTypes = {
  address: PropTypes.string,
  symbol: PropTypes.string,
  price: PropTypes.number,
  priceChange: PropTypes.number,
  margin: PropTypes.string,
};

export default TokenCard;
