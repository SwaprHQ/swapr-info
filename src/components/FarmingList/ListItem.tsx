import React from 'react';
import { useMedia } from 'react-use';
import { Flex } from 'rebass';
import styled from 'styled-components';

import { useNativeCurrencySymbol, useNativeCurrencyWrapper } from '../../contexts/Network';
import { formattedNum } from '../../utils';
import DoubleTokenLogo from '../DoubleLogo';
import FormattedName from '../FormattedName';
import { CustomLink } from '../Link';
import { AutoRow } from '../Row';
import TokenLogo from '../TokenLogo';

export const DashGrid = styled.div`
  display: grid;
  grid-gap: 1em;
  grid-template-columns: 80px 1fr 1.2fr 0.4fr;
  grid-template-areas: 'name stake underlyingTokens apy';
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
    grid-template-areas: 'name stake underlyingTokens apy';

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
    grid-template-columns: 1fr 0.8fr 1fr 0.8fr 0.8fr 0.8fr;
    grid-template-areas: 'name stake underlyingTokens staked yield apy';
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

export default function ListItem({ pairData, index }) {
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
      <DashGrid style={{ margin: '5px 0px' }}>
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
        <DataText alignItems={'flex-end'} flexDirection={'column'} area="underlyingTokens">
          <AutoRow justifyContent={'end'} marginBottom={'2px'} flexDirection={'row'} style={{ margin: 'auto' }}>
            {/* <TokenLogo
              address={pairData.stakablePair.token0.id}
              size={'13px'}
              defaultText={pairData.stakablePair.token0.symbol}
              flexBasis={'30%'}
              justifyContent="flex-end"
            /> */}
            <DataText flexBasis={'30%'} textAlign="right" justifyContent="flex-end">
              {formattedNum(pairData.stakablePair.reserve0)}
            </DataText>
            <CustomLink
              style={{ marginLeft: '10px', whiteSpace: 'nowrap', minWidth: '50px' }}
              to={'/token/' + pairData.stakablePair.token0.id}
            >
              <FormattedName
                text={
                  nativeCurrencyWrapper.symbol === pairData.stakablePair.token0.symbol
                    ? nativeCurrency
                    : pairData.stakablePair.token0.symbol
                }
                maxCharacters={below600 ? 8 : 16}
                adjustSize={true}
                link={true}
                flexBasis={'30%'}
                textAlign={'left'}
              />
            </CustomLink>
          </AutoRow>
          <AutoRow justifyContent={'end'} flexDirection={'row'} style={{ margin: 'auto' }}>
            {/* <TokenLogo
              address={pairData.stakablePair.token1.id}
              size={'13px'}
              defaultText={pairData.stakablePair.token1.symbol}
              flexBasis={'30%'}
              justifyContent="flex-end"
            /> */}
            <DataText flexBasis={'30%'} textAlign="right" justifyContent="flex-end">
              {formattedNum(pairData.stakablePair.reserve1)}
            </DataText>
            <CustomLink
              style={{ marginLeft: '10px', whiteSpace: 'nowrap', minWidth: '50px' }}
              to={'/token/' + pairData.stakablePair.token1.id}
            >
              <FormattedName
                text={
                  nativeCurrencyWrapper.symbol === pairData.stakablePair.token1.symbol
                    ? nativeCurrency
                    : pairData.stakablePair.token1.symbol
                }
                maxCharacters={below600 ? 8 : 16}
                adjustSize={true}
                link={true}
                flexBasis={'30%'}
                textAlign={'left'}
              />
            </CustomLink>
          </AutoRow>
        </DataText>
        {/* {!below680 && <DataText area="tvl">{formattedNum(pairData.stakablePair.reserveUSD, true)}</DataText>} */}
        {!below1080 && <DataText area="someOther">${formattedNum(pairData.stakedPriceInUsd)}</DataText>}
        {!below1080 && <DataText area="yield1k">${formattedNum(yieldPer1k.toFixed(2))}/day</DataText>}
        <DataText area="apy">{pairData.miningCampaignObject.apy.toFixed(2)}%</DataText>
      </DashGrid>
    );
  } else {
    return null;
  }
}
