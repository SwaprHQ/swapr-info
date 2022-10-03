import PropTypes from 'prop-types';
import Skeleton from 'react-loading-skeleton';
import { useMedia } from 'react-use';

import { Typography } from '../../Theme';
import { useUserLiquidityPositionForPair } from '../../contexts/User';
import { formatDollarAmount } from '../../utils';

const LiquidityPositionValue = ({ user, pair }) => {
  const usdValue = useUserLiquidityPositionForPair(user, pair);

  const isBelow600px = useMedia('(max-width: 600px)');

  return usdValue ? (
    <Typography.LargeText color={'text8'}>{formatDollarAmount(usdValue, 2, isBelow600px)}</Typography.LargeText>
  ) : (
    <Skeleton width={80} />
  );
};

LiquidityPositionValue.propTypes = {
  user: PropTypes.string.isRequired,
  pair: PropTypes.string.isRequired,
};

export default LiquidityPositionValue;
