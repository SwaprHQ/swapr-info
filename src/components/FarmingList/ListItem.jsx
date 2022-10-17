import React from 'react';
import { ExternalLink } from 'react-feather';
import { Flex } from 'rebass';
import styled from 'styled-components';

import { USD } from '@swapr/sdk';

import { Typography } from '../../Theme';
import carrotListLogoUrl from '../../assets/images/carrot.png';
import { CARROT_REWARD_TOKEN_REGEX, ChainId } from '../../constants';
import { useNativeCurrencySymbol, useNativeCurrencyWrapper, useSelectedNetwork } from '../../contexts/Network';
import { useIsBelowPx } from '../../hooks/useIsBelowPx';
import { formatDollarAmount, formattedNum, getSwaprLink, isDxDaoCampaignOwner } from '../../utils';
import DoubleTokenLogo from '../DoubleLogo';
import FormattedName from '../FormattedName';
import Link, { InternalListLink } from '../Link';
import TokenLogo from '../TokenLogo';

export const DashGrid = styled.div`
  display: grid;
  grid-gap: 1em;
  grid-template-columns: 0.5fr 0.9fr 0.5fr 0.4fr 0.2fr;
  grid-template-areas: 'pair tvl apy rewardTokens link';
  padding: 10px 36px;
  height: 100px;

  > * {
    justify-content: flex-end;

    :first-child {
      justify-content: flex-start;
      text-align: left;
    }
  }

  @media screen and (min-width: 680px) {
    display: grid;
    grid-gap: 1em;
    grid-template-columns: 0.6fr 0.6fr 0.6fr 0.6fr 0.4fr 0.2fr;
    grid-template-areas: 'pair tvl yield apy rewardTokens link';

    > * {
      justify-content: flex-end;
      width: 100%;

      &:first-child {
        justify-content: flex-start;
      }
    }
  }

  @media screen and (min-width: 1081px) {
    display: grid;
    grid-gap: 0.5em;
    grid-template-columns: 0.2fr 1fr 1fr 1fr 1fr 1fr 0.5fr 0.5fr;
    grid-template-areas: 'index pair tvl yield apy rewardTokens owner link';
  }
`;

const FlexText = ({ area, justifyContent, flexDirection, color, children }) => (
  <Flex area={area} justifyContent={justifyContent} flexDirection={flexDirection || 'row'}>
    <Typography.LargeText color={color || 'text1'} sx={{ display: 'flex', alignItems: 'center' }}>
      {children}
    </Typography.LargeText>
  </Flex>
);

export default function ListItem({ campaign, index, nativeCurrencyPrice }) {
  const below600 = useIsBelowPx(600);
  const below680 = useIsBelowPx(680);
  const below740 = useIsBelowPx(740);
  const below1080 = useIsBelowPx(1080);

  const nativeCurrency = useNativeCurrencySymbol();
  const nativeCurrencyWrapper = useNativeCurrencyWrapper();
  const selectedNetwork = useSelectedNetwork();

  if (campaign) {
    const apy = campaign.apy.toFixed(2);
    const kpiApy = campaign.ended ? 0 : campaign.kpiApy.toFixed(2);
    const yieldPer1k = (parseFloat(apy) / 365) * 10;
    const stakedPriceUsd = parseFloat(campaign.staked.nativeCurrencyAmount.toFixed(USD.decimals)) * nativeCurrencyPrice;

    return (
      <DashGrid style={{ padding: below680 ? '10px 20px' : '10px 36px' }}>
        {!below1080 && (
          <FlexText area={'index'} sx={{ marginRight: '1rem', minWidth: '16px' }}>
            {index}
          </FlexText>
        )}
        <FlexText area={'pair'} justifyContent={'flex-start'}>
          {!below600 && (
            <DoubleTokenLogo
              size={below740 ? 16 : 24}
              a0={campaign.targetedPair.token0.address}
              a1={campaign.targetedPair.token1.address}
              defaultText0={campaign.targetedPair.token0.symbol}
              defaultText1={campaign.targetedPair.token1.symbol}
              margin={true}
            />
          )}
          <InternalListLink
            style={{ whiteSpace: 'nowrap' }}
            to={'/farming/' + campaign.address + '/' + campaign.targetedPair.liquidityToken.address}
          >
            <FormattedName
              text={
                (nativeCurrencyWrapper.symbol === campaign.targetedPair.token0.symbol
                  ? nativeCurrency
                  : campaign.targetedPair.token0.symbol) +
                '-' +
                (nativeCurrencyWrapper.symbol === campaign.targetedPair.token1.symbol
                  ? nativeCurrency
                  : campaign.targetedPair.token1.symbol)
              }
              maxCharacters={below680 ? 8 : 16}
              adjustSize={true}
              link={true}
            />
          </InternalListLink>
        </FlexText>
        <FlexText area={'tvl'} justifyContent={'center'}>
          <Flex flexDirection={'column'} alignItems={'center'} style={{ gap: '8px' }}>
            {formatDollarAmount(stakedPriceUsd, 2, below680)}
            <Typography.SmallText color={'text2'}>
              {((stakedPriceUsd / campaign.targetedPair.reserveUSD) * 100).toFixed(2)}% of TVL
            </Typography.SmallText>
          </Flex>
        </FlexText>
        {!below680 && (
          <FlexText area={'yield'} justifyContent={'center'}>
            {formattedNum(yieldPer1k, true)} / DAY
          </FlexText>
        )}
        <Flex area={'apy'} justifyContent={'center'}>
          <FlexText>{`${apy}% ${!below600 && Number(kpiApy) !== 0 ? `+ ${kpiApy}%` : ''}`}</FlexText>
          {!below740 && Number(kpiApy) !== 0 && (
            <TokenLogo source={carrotListLogoUrl} size={'16px'} defaultText={'CARROT'} style={{ marginLeft: '6px' }} />
          )}
        </Flex>
        <Flex area={'rewardTokens'} justifyContent={'center'} flexDirection={'column'} style={{ gap: '8px' }}>
          {campaign.rewards.map((reward, index) => {
            const isCarrotToken = CARROT_REWARD_TOKEN_REGEX.test(reward.token.symbol);

            return (
              <Flex justifyContent={'center'} key={`${reward.address}${index}`}>
                <TokenLogo
                  address={reward.token.address.toLowerCase()}
                  source={isCarrotToken ? carrotListLogoUrl : undefined}
                  size="16px"
                  defaultText={isCarrotToken ? 'CARROT' : reward.token.symbol}
                  flexBasis="auto"
                  justifyContent="flex-end"
                />
                {!below600 && (
                  <FormattedName
                    text={
                      isCarrotToken
                        ? 'CARROT'
                        : nativeCurrencyWrapper.symbol === reward.token.symbol
                        ? nativeCurrency
                        : reward.token.symbol
                    }
                    maxCharacters={below600 ? 8 : 16}
                    adjustSize={true}
                    link={false}
                    style={{ marginLeft: '10px', whiteSpace: 'nowrap', minWidth: '60px' }}
                    textAlign="left"
                  />
                )}
              </Flex>
            );
          })}
        </Flex>
        {!below1080 && (
          <Flex area={'owner'} justifyContent={'center'}>
            <FlexText>{isDxDaoCampaignOwner(campaign.owner) ? 'DXdao' : 'Other'}</FlexText>
          </Flex>
        )}
        <FlexText area="link">
          <Link
            color={'text8'}
            external={true}
            href={getSwaprLink(
              `/rewards/campaign/${campaign.targetedPair.token0.address}/${campaign.targetedPair.token1.address}/${campaign.address}`,
              ChainId[selectedNetwork],
            )}
          >
            <ExternalLink size={20} />
          </Link>
        </FlexText>
      </DashGrid>
    );
  } else {
    return null;
  }
}
