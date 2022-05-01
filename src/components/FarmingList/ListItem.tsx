import React from 'react';
import { useMedia } from 'react-use';
import { Flex } from 'rebass';
import styled from 'styled-components';

import carrotListLogoUrl from '../../assets/images/carrot.png';
import { useNativeCurrencySymbol, useNativeCurrencyWrapper } from '../../contexts/Network';
import { formattedNum } from '../../utils';
import DoubleTokenLogo from '../DoubleLogo';
import FormattedName from '../FormattedName';
import { CustomLink } from '../Link';
import { AutoRow } from '../Row';
import TokenLogo from '../TokenLogo';

const carrotTokenRegex = new RegExp(/g([a-zA-z]*)-\d{4}$/gm);

export const DashGrid = styled.div`
  display: grid;
  grid-gap: 1em;
  grid-template-columns: 80px 1fr 1.2fr 0.4fr;
  grid-template-areas: 'name stake rewardTokens apy';
  padding: 0 1.125rem;

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
    grid-template-columns: 150px 1fr 1.2fr 0.6fr;
    grid-template-areas: 'name stake rewardTokens apy';

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
    grid-template-columns: 1fr 0.8fr 1fr 0.8fr 0.8fr 0.6fr;
    grid-template-areas: 'name stake rewardTokens staked yield apy';
  }
`;

const DataText = styled(Flex)`
  align-items: center;
  text-align: center;
  color: ${({ theme }) => theme.text1};
  font-weight: 500;

  & > * {
    font-size: 14px;
  }

  @media screen and (max-width: 600px) {
    font-size: 12px;
  }
`;
/** TODO: Need to add proper typings */
type Pair = {
  stakedAmount: number;
  stakedPriceInUsd: number;
  stakablePair: {
    token0: any;
    token1: any;
    reserveUSD: number;
  };
  miningCampaignObject: {
    apy: any;
    targetedPair: any;
    rewards: any;
  };
};

interface ListItemProps {
  pairData: Pair;
  index: string;
}

export default function ListItem({ pairData, index }: ListItemProps) {
  const below740 = useMedia('(max-width: 740px)');
  const below600 = useMedia('(max-width: 600px)');
  const below680 = useMedia('(max-width: 680px)');
  const below1080 = useMedia('(max-width: 1080px)');

  const nativeCurrency = useNativeCurrencySymbol();
  const nativeCurrencyWrapper = useNativeCurrencyWrapper();

  if (pairData) {
    const apy = pairData.miningCampaignObject.apy.toFixed(2);
    const yieldPer1k = (parseFloat(apy) / 365) * 10;
    return (
      <DashGrid style={{ margin: '10px 0px' }}>
        <DataText area="name">
          {!below680 && <div style={{ marginRight: '20px', width: '10px' }}>{index}</div>}
          <DoubleTokenLogo
            size={below600 ? 16 : 24}
            a0={pairData.stakablePair.token0.id}
            a1={pairData.stakablePair.token1.id}
            defaultText0={pairData.stakablePair.token0.symbol}
            defaultText1={pairData.stakablePair.token1.symbol}
            margin={!below740}
          />
          <CustomLink
            style={{ whiteSpace: 'nowrap' }}
            to={'/pair/' + pairData.miningCampaignObject.targetedPair.liquidityToken.address}
          >
            <FormattedName
              text={
                (nativeCurrencyWrapper.symbol === pairData.stakablePair.token0.symbol
                  ? nativeCurrency
                  : pairData.stakablePair.token0.symbol) +
                '-' +
                (nativeCurrencyWrapper.symbol === pairData.stakablePair.token1.symbol
                  ? nativeCurrency
                  : pairData.stakablePair.token1.symbol)
              }
              maxCharacters={below600 ? 8 : 16}
              adjustSize={true}
              link={true}
            />
          </CustomLink>
        </DataText>
        <DataText area="stake">{formattedNum(pairData.stakedAmount)} LP</DataText>
        <DataText
          alignItems={'center'}
          flexDirection={'row'}
          flexWrap={'wrap'}
          justifyContent={'flex-end'}
          area="rewardTokens"
        >
          {pairData.miningCampaignObject.rewards.map((reward, index) => {
            const carrotLogo = `${window.location.origin}${
              carrotListLogoUrl.startsWith('.') ? carrotListLogoUrl.substring(1) : carrotListLogoUrl
            }`;
            const isCarrotToken = carrotTokenRegex.test(reward.token.symbol);
            return (
              <AutoRow
                width="auto!important"
                justifyContent={'end'}
                marginTop={'5px'}
                marginBottom={'5px'}
                marginLeft={below1080 ? '5px' : '10px'}
                flexDirection={'row'}
                key={`${reward.address}${index}`}
              >
                <TokenLogo
                  address={reward.token.address.toLowerCase()}
                  source={isCarrotToken ? carrotLogo : undefined}
                  size={'16px'}
                  defaultText={isCarrotToken ? 'CARROT' : reward.token.symbol}
                  flexBasis={'auto'}
                  justifyContent="flex-end"
                />
                {isCarrotToken ? (
                  <FormattedName
                    style={{ marginLeft: '10px', whiteSpace: 'nowrap', minWidth: '52px', marginRight: '5px' }}
                    text="CARROT"
                    maxCharacters={below600 ? 8 : 16}
                    adjustSize={true}
                    link={false}
                    textAlign={'left'}
                  />
                ) : (
                  // <CustomLink
                  //   style={{ marginLeft: '10px', whiteSpace: 'nowrap', minWidth: '50px' }}
                  //   to={'/token/' + reward.token.address.toLowerCase()}
                  // >
                  <FormattedName
                    text={nativeCurrencyWrapper.symbol === reward.token.symbol ? nativeCurrency : reward.token.symbol}
                    maxCharacters={below600 ? 8 : 16}
                    adjustSize={true}
                    link={false}
                    style={{ marginLeft: '10px', whiteSpace: 'nowrap', minWidth: '52px', marginRight: '5px' }}
                    textAlign={'left'}
                  />
                  // </CustomLink>
                )}
              </AutoRow>
            );
          })}
        </DataText>
        {!below1080 && (
          <DataText area="staked" flexDirection={'column'}>
            <AutoRow justifyContent={'end'} flexDirection={'row'} marginBottom={'5px'}>
              ${formattedNum(pairData.stakedPriceInUsd)}
            </AutoRow>
            <AutoRow justifyContent={'end'} flexDirection={'row'}>
              {((pairData.stakedPriceInUsd / pairData.stakablePair.reserveUSD) * 100).toFixed(2)}% of TVL
            </AutoRow>
          </DataText>
        )}
        {!below1080 && <DataText area="yield">${formattedNum(yieldPer1k.toFixed(2))}/day</DataText>}
        <DataText area="apy">{pairData.miningCampaignObject.apy.toFixed(2)}%</DataText>
      </DashGrid>
    );
  } else {
    return null;
  }
}
