import PropTypes from 'prop-types';
import Skeleton from 'react-loading-skeleton';
import { useMedia } from 'react-use';
import { Flex } from 'rebass';

import { USD } from '@swapr/sdk';

import { Typography } from '../../Theme';
import LiquidityFarmingCampaignCard from '../LiquidityFarmingCampaignCard';
import { ActiveBadge, CardsWrapper, EndBadge, Header } from './styled';

const LiquidityMiningCampaignCardList = ({ campaigns, nativeCurrencyPrice }) => {
  const below600 = useMedia('(max-width: 600px)');

  const active = campaigns?.filter(({ endsAt }) => new Date(endsAt * 1000).getTime() > new Date().getTime()).length;
  const ended = campaigns?.filter(({ endsAt }) => new Date(endsAt * 1000).getTime() < new Date().getTime()).length;

  return (
    <Flex flexDirection={'column'}>
      <Flex justifyContent={'space-between'} style={{ gap: '8px' }}>
        <Header>
          <Typography.SmallBoldText color={'text8'} sx={{ letterSpacing: '0.08em' }}>
            CAMPAIGNS
          </Typography.SmallBoldText>
          {campaigns ? (
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
        {campaigns && nativeCurrencyPrice ? (
          campaigns
            .sort((a, b) => b.endsAt - a.endsAt)
            .map(({ address, targetedPair, endsAt, apy, staked, stakingCap, locked }) => (
              <LiquidityFarmingCampaignCard
                key={address}
                address={address}
                liquidityTokenAddress={targetedPair.liquidityToken.address}
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
            <Skeleton width={below600 ? '100%' : '344px'} height={'178px'} borderRadius={'12px'} />
            <Skeleton width={below600 ? '100%' : '344px'} height={'178px'} borderRadius={'12px'} />
          </>
        )}
      </CardsWrapper>
    </Flex>
  );
};

LiquidityMiningCampaignCardList.propTypes = {
  campaigns: PropTypes.array,
  nativeCurrencyPrice: PropTypes.number,
};

LiquidityMiningCampaignCardList.defaultProps = {
  campaigns: [],
};

export default LiquidityMiningCampaignCardList;
