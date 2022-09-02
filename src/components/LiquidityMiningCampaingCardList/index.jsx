import PropTypes from 'prop-types';
import Skeleton from 'react-loading-skeleton';
import { Flex } from 'rebass';

import { USD } from '@swapr/sdk';

import { Typography } from '../../Theme';
import LiquidityFarmingCampaignCard from '../LiquidityFarmingCampaignCard';
import { SkeletonWrapper } from '../LiquidityFarmingCampaignCard/styled';
import { ActiveBadge, CardsWrapper, EndBadge, Header } from './styled';

const LiquidityMiningCampaingCardList = ({ campaings, nativeCurrencyPrice }) => {
  const active = campaings?.filter(({ endsAt }) => new Date(endsAt * 1000).getTime() > new Date().getTime()).length;
  const ended = campaings?.filter(({ endsAt }) => new Date(endsAt * 1000).getTime() < new Date().getTime()).length;

  return (
    <Flex flexDirection={'column'}>
      <Flex justifyContent={'space-between'} style={{ gap: '8px' }}>
        <Header>
          <Typography.SmallBoldText color={'text8'} sx={{ letterSpacing: '0.08em' }}>
            CAMPAIGNS
          </Typography.SmallBoldText>
          {campaings ? (
            <>
              <ActiveBadge>{active}</ActiveBadge>
              <EndBadge>{ended}</EndBadge>
            </>
          ) : (
            <Skeleton style={{ width: '36px' }} />
          )}
        </Header>
      </Flex>
      <CardsWrapper>
        {campaings && nativeCurrencyPrice ? (
          campaings
            .sort((a, b) => b.endsAt - a.endsAt)
            .map(({ address, targetedPair, endsAt, apy, staked, stakingCap, locked }) => (
              <LiquidityFarmingCampaignCard
                key={address}
                token0={{ id: targetedPair.token0.address, symbol: targetedPair.token0.symbol }}
                token1={{ id: targetedPair.token1.address, symbol: targetedPair.token1.symbol }}
                expiration={endsAt * 1000}
                apy={apy.toFixed(2)}
                stakeAmount={staked}
                stakeCap={stakingCap}
                usdLiquidity={parseFloat(staked.nativeCurrencyAmount.toFixed(USD.decimals)) * nativeCurrencyPrice}
                isLocked={locked}
                isLimited={!stakingCap.equalTo('0')}
              />
            ))
        ) : (
          <>
            <SkeletonWrapper />
            <SkeletonWrapper />
          </>
        )}
      </CardsWrapper>
    </Flex>
  );
};

LiquidityMiningCampaingCardList.propTypes = {
  campaings: PropTypes.array,
  nativeCurrencyPrice: PropTypes.number,
};

LiquidityMiningCampaingCardList.defaultProps = {
  campaings: [],
};

export default LiquidityMiningCampaingCardList;
