import React from 'react';
import { ExternalLink } from 'react-feather';
import { useMedia } from 'react-use';
import { Flex } from 'rebass';
import styled from 'styled-components';

import carrotListLogoUrl from '../../assets/images/carrot.png';
import { useNativeCurrencySymbol, useNativeCurrencyWrapper } from '../../contexts/Network';
import { formattedNum } from '../../utils';
import DoubleTokenLogo from '../DoubleLogo';
import FormattedName from '../FormattedName';
import Link, { CustomLink } from '../Link';
import { AutoRow } from '../Row';
import TokenLogo from '../TokenLogo';

const carrotTokenRegex = new RegExp(/g([a-zA-z]*)-\d{4}$/gm);

export const DashGrid = styled.div`
  display: grid;
  grid-gap: 1em;
  grid-template-columns: 80px 0.6fr 0.4fr 0.5fr 40px;
  grid-template-areas: 'name stake apy rewardTokens swaprLink';
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
    grid-template-columns: 1fr 0.8fr 0.8fr 0.8fr 0.8fr 1fr 50px;
    grid-template-areas: 'name stake staked yield apy rewardTokens swaprLink';
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
  id: string;
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
    address: string;
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

  const carrotLogo = `${window.location.origin}${
    carrotListLogoUrl.startsWith('.') ? carrotListLogoUrl.substring(1) : carrotListLogoUrl
  }`;
  const hasCarrotToken = pairData.miningCampaignObject.rewards.some((reward) =>
    carrotTokenRegex.test(reward.token.symbol),
  );

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

        {!below1080 && (
          <DataText area="staked" flexDirection="column" justifyContent="center">
            <AutoRow justifyContent="end" flexDirection="row" marginBottom="8px">
              ${formattedNum(pairData.stakedPriceInUsd)}
            </AutoRow>
            <AutoRow justifyContent="end" flexDirection="row" fontSize="0.8rem!important" color="#7e7e7e">
              {((pairData.stakedPriceInUsd / pairData.stakablePair.reserveUSD) * 100).toFixed(2)}% of TVL
            </AutoRow>
          </DataText>
        )}
        {!below1080 && <DataText area="yield">${formattedNum(yieldPer1k.toFixed(2))}/day</DataText>}
        <DataText area="apy" flexDirection="row" flexWrap="wrap">
          <AutoRow width="auto!important">
            {pairData.miningCampaignObject.apy.toFixed(2)}%{`${hasCarrotToken ? ' + ' : ''}`}
          </AutoRow>
          {hasCarrotToken && (
            <AutoRow width="auto!important">
              <TokenLogo
                address={''}
                source={carrotLogo}
                size="16px"
                defaultText={'CARROT'}
                flexBasis="auto"
                justifyContent="flex-end"
                style={{ marginLeft: '5px' }}
              />
            </AutoRow>
          )}
        </DataText>
        <DataText alignItems="center" flexDirection="column" justifyContent="flex-end" area="rewardTokens">
          {pairData.miningCampaignObject.rewards.map((reward, index) => {
            const isCarrotToken = carrotTokenRegex.test(reward.token.symbol);
            return (
              <AutoRow
                width="100%"
                justifyContent="end"
                marginTop="5px"
                marginBottom="5px"
                marginLeft={below1080 ? '5px' : '10px'}
                flexDirection="row"
                key={`${reward.address}${index}`}
              >
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
              </AutoRow>
            );
          })}
        </DataText>
        <DataText area="swaprLink">
          <Link
            style={{ whiteSpace: 'nowrap' }}
            external={true}
            href={`https://swapr.eth.link/#/rewards/${pairData.stakablePair.token0.id}/${pairData.stakablePair.token1.id}/${pairData.id}`}
          >
            <ExternalLink size={20} />
          </Link>
        </DataText>
      </DashGrid>
    );
  } else {
    return null;
  }
}
