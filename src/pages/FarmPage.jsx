import PropTypes from 'prop-types';
import Skeleton from 'react-loading-skeleton';
import { useHistory } from 'react-router-dom';
import { useMedia } from 'react-use';
import { Flex } from 'rebass';
import styled from 'styled-components';

import { USD } from '@swapr/sdk';

import { Typography } from '../Theme';
import { ContentWrapper, PageWrapper } from '../components';
import { ButtonDark } from '../components/ButtonStyled';
import DoubleTokenLogo from '../components/DoubleLogo';
import LabeledValue from '../components/LabeledValue';
import Link, { BasicLink, ExternalListLink } from '../components/Link';
import LiquidityMiningCampaignCardList from '../components/LiquidityMiningCampaignCardList';
import Panel from '../components/Panel';
import Search from '../components/Search';
import { useNativeCurrencyPrice } from '../contexts/GlobalData';
import { useNativeCurrencySymbol, useNativeCurrencyWrapper, useSelectedNetwork } from '../contexts/Network';
import { useLiquidityMiningCampaignData, useLiquidityMiningCampaignsForPair, usePairData } from '../contexts/PairData';
import { formattedNum, getExplorerLink, getSwapLink } from '../utils';

const DashboardWrapper = styled.div`
  width: 100%;
`;

const PanelWrapper = styled.div`
  grid-template-columns: 2.5fr 1fr;
  grid-template-rows: max-content;
  gap: 20px;
  display: inline-grid;
  width: 100%;
  align-items: start;

  @media screen and (max-width: 600px) {
    grid-template-columns: 1fr;
    align-items: stretch;
    > * {
      grid-column: 1 / 4;
    }

    > * {
      &:first-child {
        width: 100%;
      }
    }
  }
`;

const FixedPanel = styled(Panel)`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: fit-content;
  padding: 8px 12px;
  border-radius: 10px;

  :hover {
    cursor: pointer;
    opacity: 0.6;
  }

  @media screen and (max-width: 600px) {
    width: 100%;
  }
`;

const FarmPage = ({ campaignAddress, pairAddress }) => {
  const selectedNetwork = useSelectedNetwork();
  const [nativeCurrencyPrice] = useNativeCurrencyPrice();
  const nativeCurrency = useNativeCurrencySymbol();
  const nativeCurrencyWrapper = useNativeCurrencyWrapper();
  const history = useHistory();
  const { token0, token1, oneDayVolumeUSD, swapFee } = usePairData(pairAddress);
  const campaign = useLiquidityMiningCampaignData(campaignAddress);

  // get the last 20 campaings
  const liquidityMiningCampaigns = useLiquidityMiningCampaignsForPair(pairAddress, 0);

  const below600 = useMedia('(max-width: 600px)');

  const isPairLoading = !token0 || !token1;

  const liquidity =
    campaign &&
    campaign.staked &&
    formattedNum(parseFloat(campaign.staked.nativeCurrencyAmount.toFixed(USD.decimals)) * nativeCurrencyPrice, true);
  const volume = (oneDayVolumeUSD || oneDayVolumeUSD === 0) && formattedNum(oneDayVolumeUSD, true);
  const apy = campaign && campaign.apy && `${campaign.apy.toFixed(2)}%`;
  const fee = swapFee && `${swapFee / 100}%`;

  return (
    <PageWrapper>
      <ContentWrapper>
        <Flex alignItems={'end'} justifyContent={'space-between'}>
          <Typography.LargeText color={'text10'} sx={{ marginRight: '4px' }}>
            <BasicLink to="/farming">{'Farms '}</BasicLink>
            {!isPairLoading ? (
              <ExternalListLink external={true} href={getExplorerLink(selectedNetwork, campaignAddress, 'address')}>
                {`→  ${token0.symbol}-${token1.symbol}`}
              </ExternalListLink>
            ) : (
              <Skeleton style={{ width: '60px' }} />
            )}
          </Typography.LargeText>
          {!below600 && <Search small={true} />}
        </Flex>
        <DashboardWrapper>
          <Flex justifyContent={'space-between'} style={{ gap: '16px', marginBottom: '20px' }}>
            <Flex flexDirection={'row'} alignItems={'center'} style={{ gap: '16px' }}>
              {!isPairLoading ? (
                <FixedPanel onClick={() => history.push(`/pair/${pairAddress}`)}>
                  <DoubleTokenLogo
                    size={16}
                    a0={token0.id}
                    a1={token1.id}
                    defaultText0={token0.symbol}
                    defaultText1={token1.symbol}
                    margin={true}
                  />
                  <Typography.LargeBoldText>{`${token0.symbol}/${token1.symbol}`}</Typography.LargeBoldText>
                </FixedPanel>
              ) : (
                <Skeleton height={'34px'} borderRadius={'8px'} width={'160px'} />
              )}
            </Flex>
            <Flex style={{ gap: '16px' }}>
              <Link
                external
                href={getSwapLink(selectedNetwork, nativeCurrency, nativeCurrencyWrapper, token0?.id, token1?.id)}
              >
                <ButtonDark style={{ minWidth: '148px' }}>
                  <Typography.SmallBoldText color={'text8'} sx={{ letterSpacing: '0.08em' }}>
                    TRADE
                  </Typography.SmallBoldText>
                </ButtonDark>
              </Link>
            </Flex>
          </Flex>
          <PanelWrapper>
            <Panel style={{ height: '100%' }}>
              <Flex flexDirection={'column'} style={{ gap: '28px' }}>
                <Typography.Custom sx={{ fontWeight: 500, fontSize: '16px', lineHeight: '19px' }}>
                  Pool stats
                </Typography.Custom>
                <Flex justifyContent={'space-between'}>
                  <LabeledValue label={'TVL'} value={liquidity} />
                  <LabeledValue label={'24H VOLUME'} value={volume} />
                  <LabeledValue label={'APY'} value={apy} />
                </Flex>
              </Flex>
            </Panel>
            <Panel style={{ height: '100%', justifyContent: 'center' }}>
              <Flex flexDirection={'column'} style={{ gap: '28px' }} alignItems={'center'} justifyContent={'center'}>
                <Typography.Custom color={'text7'} sx={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.15em' }}>
                  SWAP FEE
                </Typography.Custom>
                {fee ? (
                  <Typography.Custom
                    color={'text9'}
                    sx={{ fontSize: '18px', fontWeight: 500, letterSpacing: '0.02em' }}
                  >
                    {fee}
                  </Typography.Custom>
                ) : (
                  <Skeleton style={{ width: '40px', height: '18px' }} />
                )}
              </Flex>
            </Panel>
          </PanelWrapper>
          <LiquidityMiningCampaignCardList
            campaigns={liquidityMiningCampaigns}
            nativeCurrencyPrice={nativeCurrencyPrice && parseFloat(nativeCurrencyPrice)}
          />
        </DashboardWrapper>
      </ContentWrapper>
    </PageWrapper>
  );
};

FarmPage.propTypes = {
  campaignAddress: PropTypes.string,
  pairAddress: PropTypes.string,
};

export default FarmPage;
