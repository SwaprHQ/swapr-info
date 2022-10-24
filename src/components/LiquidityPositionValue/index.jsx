import PropTypes from 'prop-types';
import Skeleton from 'react-loading-skeleton';

import { Typography } from '../../Theme';
import { useUserLiquidityPositionForPair } from '../../contexts/User';
import { useIsBelowPx } from '../../hooks/useIsBelowPx';
import { formatDollarAmount } from '../../utils';

const LiquidityPositionValue = ({ user, pair }) => {
  const usdValue = useUserLiquidityPositionForPair(user, pair);

  const isBelow600px = useIsBelowPx(600);

  return usdValue || usdValue === 0 ? (
    <Typography.LargeText color={'text1'}>{formatDollarAmount(usdValue, 2, isBelow600px)}</Typography.LargeText>
  ) : (
    <Skeleton width={80} />
  );
};

LiquidityPositionValue.propTypes = {
  user: PropTypes.string.isRequired,
  pair: PropTypes.string.isRequired,
};

export default LiquidityPositionValue;
