import PropTypes from 'prop-types';
import { Flex } from 'rebass';

import { Typography } from '../../Theme';
import { ReactComponent as ClockSvg } from '../../assets/svg/clock.svg';
import { formatCountDownString } from '../../utils';
import DoubleTokenLogo from '../DoubleLogo';
import Icon from '../Icon';
import StatusBadge from './StausBadge';
import { Wrapper } from './styled';

const LiquidityFarmingCampaignCard = ({ token0, token1, expiration, apy }) => {
  const isCampaingActive = new Date(expiration).getTime() > new Date().getTime();
  const expiringIn = new Date(expiration).getTime() - new Date().getTime();

  return (
    <Wrapper isActive={isCampaingActive}>
      <Flex justifyContent={'space-between'} alignItems={'end'}>
        <DoubleTokenLogo
          a0={token0.id}
          a1={token1.id}
          defaultText0={token0.symbol}
          defaultText1={token1.symbol}
          size={36}
        />
        <Flex flexDirection={'column'} alignItems={'end'} style={{ gap: '12px' }}>
          <Flex alignItems={'center'} justifyContent={'end'} style={{ height: '15px' }}>
            <Icon icon={<ClockSvg height={16} width={14} />} />
            <Typography.SmallBoldText color={'text7'}>{formatCountDownString(expiringIn)}</Typography.SmallBoldText>
          </Flex>
          <StatusBadge isActive={isCampaingActive} />
        </Flex>
      </Flex>
      <Typography.LargeBoldText color={'text6'} sx={{ letterSpacing: '0.02em' }}>
        {`${token0.symbol}/${token1.symbol}`}
      </Typography.LargeBoldText>
      <Typography.Custom
        color={'text9'}
        sx={{ fontWeight: 600, fontSize: '18px', lineHeight: '22px', letterSpacing: '0.02em' }}
      >
        {`${apy}% APY`}
      </Typography.Custom>
    </Wrapper>
  );
};

LiquidityFarmingCampaignCard.propTypes = {
  token0: PropTypes.shape({ id: PropTypes.string.isRequired, symbol: PropTypes.string.isRequired }).isRequired,
  token1: PropTypes.shape({ id: PropTypes.string.isRequired, symbol: PropTypes.string.isRequired }).isRequired,
  expiration: PropTypes.number.isRequired,
  apy: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  stakeAmount: PropTypes.number.isRequired,
  stakeCap: PropTypes.number.isRequired,
};

export default LiquidityFarmingCampaignCard;
