import React from 'react';
import { ExternalLink } from 'react-feather';
import { useMedia } from 'react-use';
import { Flex } from 'rebass';
import styled from 'styled-components';

import { USD } from '@swapr/sdk';

import { Typography } from '../../Theme';
import carrotListLogoUrl from '../../assets/images/carrot.png';
import { ChainId } from '../../constants';
import { useNativeCurrencySymbol, useNativeCurrencyWrapper, useSelectedNetwork } from '../../contexts/Network';
import { formatDollarAmount, formattedNum, getSwaprLink } from '../../utils';
import DoubleTokenLogo from '../DoubleLogo';
import FormattedName from '../FormattedName';
import Link, { InternalListLink } from '../Link';
import { AutoRow } from '../Row';
import TokenLogo from '../TokenLogo';

const carrotTokenRegex = new RegExp(/g([a-zA-z]*)-\d{4}$/);

export const DashGrid = styled.div`
  display: grid;
  grid-gap: 1em;
  grid-template-columns: 1fr 0.6fr 0.6fr 1fr 0.2fr;
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
    grid-template-columns: 150px 0.6fr 0.6fr 0.6fr 24px;
    grid-template-areas: 'name stake apy rewardTokens swaprLink';

    > * {
      justify-content: flex-end;
      width: 100%;

      &:first-child {
        justify-content: flex-start;
      }
    }
  }

  @media screen and (min-width: 1080px) {
    display: grid;
    grid-gap: 0.5em;
    grid-template-columns: 0.1fr 1fr 1fr 1fr 1fr 1fr 1fr;
    grid-template-areas: 'index pair tvl yield apy rewardTokens link';
  }
`;

/** TODO: Need to add proper typings */
// type Pair = {
//   id: string;
//   stakedAmount: number;
//   stakedPriceInUsd: number;
//   stakablePair: {
//     token0: any;
//     token1: any;
//     reserveUSD: number;
//   };
//   miningCampaignObject: {
//     apy: any;
//     targetedPair: any;
//     rewards: any;
//     address: string;
//   };
// };

// interface ListItemProps {
//   campaign: Pair;
//   index: string;
// }

const FlexText = ({ area, justifyContent, flexDirection, color, children }) => (
  <Flex area={area} justifyContent={justifyContent} flexDirection={flexDirection || 'row'}>
    <Typography.LargeText color={color || 'text1'} sx={{ display: 'flex', alignItems: 'center' }}>
      {children}
    </Typography.LargeText>
  </Flex>
);

export default function ListItem({ campaign, index, nativeCurrencyPrice }) {
  const below740 = useMedia('(max-width: 740px)');
  const below600 = useMedia('(max-width: 600px)');
  const below680 = useMedia('(max-width: 680px)');
  const below1080 = useMedia('(max-width: 1080px)');

  const nativeCurrency = useNativeCurrencySymbol();
  const nativeCurrencyWrapper = useNativeCurrencyWrapper();
  const selectedNetwork = useSelectedNetwork();

  const carrotLogo = `${window.location.origin}${
    carrotListLogoUrl.startsWith('.') ? carrotListLogoUrl.substring(1) : carrotListLogoUrl
  }`;

  if (campaign) {
    const apy = campaign.apy.toFixed(2);
    const yieldPer1k = (parseFloat(apy) / 365) * 10;

    return (
      <DashGrid style={{ padding: below680 ? '0 20px' : '0 36px' }}>
        {!below1080 && (
          <FlexText area={'index'} sx={{ marginRight: '1rem', minWidth: '16px' }}>
            {index}
          </FlexText>
        )}
        <FlexText area="pair" justifyContent={'flex-start'}>
          <DoubleTokenLogo
            size={below740 ? 16 : 36}
            a0={campaign.targetedPair.token0.address}
            a1={campaign.targetedPair.token1.address}
            defaultText0={campaign.targetedPair.token0.symbol}
            defaultText1={campaign.targetedPair.token1.symbol}
            margin={true}
          />
          <InternalListLink
            style={{ whiteSpace: 'nowrap' }}
            to={'/pair/' + campaign.targetedPair.liquidityToken.address}
          >
            {!below680 ? (
              <>
                <Typography.Custom
                  color={'text1'}
                  sx={{ fontWeight: 600, fontSize: '16px', lineHeight: '19px', letterSpacing: '0.02em' }}
                >
                  {nativeCurrencyWrapper.symbol === campaign.targetedPair.token0.symbol
                    ? nativeCurrency
                    : campaign.targetedPair.token0.symbol}
                </Typography.Custom>
                <Typography.Custom
                  color={'text1'}
                  sx={{ fontWeight: 600, fontSize: '16px', lineHeight: '19px', letterSpacing: '0.02em' }}
                >
                  {nativeCurrencyWrapper.symbol === campaign.targetedPair.token1.symbol
                    ? nativeCurrency
                    : campaign.targetedPair.token1.symbol}
                </Typography.Custom>
              </>
            ) : (
              <>
                <Typography.SmallBoldText color={'text1'}>
                  {nativeCurrencyWrapper.symbol === campaign.targetedPair.token0.symbol
                    ? nativeCurrency
                    : campaign.targetedPair.token0.symbol}
                </Typography.SmallBoldText>
                <Typography.SmallBoldText color={'text1'}>
                  {nativeCurrencyWrapper.symbol === campaign.targetedPair.token1.symbol
                    ? nativeCurrency
                    : campaign.targetedPair.token1.symbol}
                </Typography.SmallBoldText>
              </>
            )}
          </InternalListLink>
        </FlexText>
        <FlexText area="tvl">
          {formatDollarAmount(
            parseFloat(campaign.staked.nativeCurrencyAmount.toFixed(USD.decimals)) * nativeCurrencyPrice,
            2,
            'short',
          )}
        </FlexText>
        {!below680 && <FlexText area="yield">{formattedNum(yieldPer1k, true)} / DAY</FlexText>}
        <FlexText area="apy">
          <AutoRow width="auto!important">{apy}%</AutoRow>
        </FlexText>
        <Flex area={'rewardTokens'} justifyContent={'center'} flexDirection={'column'} style={{ gap: '8px' }}>
          {campaign.rewards.map((reward, index) => {
            const isCarrotToken = carrotTokenRegex.test(reward.token.symbol);

            return (
              <Flex justifyContent={'end'} key={`${reward.address}${index}`}>
                <TokenLogo
                  address={reward.token.address.toLowerCase()}
                  source={isCarrotToken ? carrotLogo : undefined}
                  size="16px"
                  defaultText={isCarrotToken ? 'CARROT' : reward.token.symbol}
                  flexBasis="auto"
                  justifyContent="flex-end"
                />
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
              </Flex>
            );
          })}
        </Flex>
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
