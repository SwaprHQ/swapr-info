import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { Flex } from 'rebass';

import { Typography } from '../../Theme';
import { CARROT_REWARD_TOKEN_REGEX } from '../../constants';
import { formattedNum } from '../../utils';
import CarrotBadge from '../CarrotBadge';
import DoubleTokenLogo from '../DoubleLogo';
import FarmBadge from '../FarmBadge';
import { InternalListLink } from '../Link';
import { Wrapper } from './styled';

const PairCard = ({ pairAddress, token0, token1, tvl, liquidityMiningCampaigns }) => {
  const isFarming = liquidityMiningCampaigns.find((campaign) => campaign.endsAt >= dayjs.utc().unix());
  const hasCarrotRewards = liquidityMiningCampaigns.find((campaign) =>
    campaign.rewards.find((reward) => CARROT_REWARD_TOKEN_REGEX.test(reward.token.symbol)),
  );

  return (
    <InternalListLink to={'/pair/' + pairAddress}>
      <Wrapper>
        <Flex justifyContent={'space-between'} style={{ width: '100%' }}>
          <Flex flexDirection={'column'} style={{ gap: '10px' }}>
            <DoubleTokenLogo
              size={36}
              a0={token0?.address}
              a1={token1?.address}
              defaultText0={token0?.symbol}
              defaultText1={token1?.symbol}
            />
            <div>
              <Typography.Custom
                color={'text1'}
                sx={{
                  fontWeight: 700,
                  fontSize: '16px',
                  lineHeight: '19px',
                  letterSpacing: '0.02em',
                }}
              >
                {token0?.symbol}/{token1?.symbol}
              </Typography.Custom>
              <Typography.Custom
                color={'text7'}
                sx={{
                  fontWeight: 500,
                  fontSize: '13px',
                  lineHeight: '14px',
                  letterSpacing: '0.02em',
                  marginTop: '4px',
                }}
              >
                {formattedNum(tvl, true)} TVL
              </Typography.Custom>
            </div>
          </Flex>
          <Flex flexDirection={'column'} style={{ gap: '8px' }}>
            {isFarming && <FarmBadge />}
            {hasCarrotRewards && <CarrotBadge />}
          </Flex>
        </Flex>
      </Wrapper>
    </InternalListLink>
  );
};

PairCard.propTypes = {
  pairAddress: PropTypes.string.isRequired,
  token0: PropTypes.shape({ address: PropTypes.string.isRequired, symbol: PropTypes.string.isRequired }),
  token1: PropTypes.shape({ address: PropTypes.string.isRequired, symbol: PropTypes.string.isRequired }),
  tvl: PropTypes.any,
  liquidityMiningCampaigns: PropTypes.array,
};

export default PairCard;
