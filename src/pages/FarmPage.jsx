import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import Skeleton from 'react-loading-skeleton';
import { useHistory } from 'react-router-dom';
import { useMedia } from 'react-use';
import { Flex } from 'rebass';
import styled from 'styled-components';

import { USD } from '@swapr/sdk';

import { Typography } from '../Theme';
import carrotListLogoUrl from '../assets/images/carrot.png';
import { ReactComponent as DxdLogoSvg } from '../assets/svg/dxd-logo.svg';
import { ContentWrapper, PageWrapper } from '../components';
import { ButtonDark, ButtonLight } from '../components/ButtonStyled';
import DoubleTokenLogo from '../components/DoubleLogo';
import GoToCampaignLink from '../components/GoToCampaignLink';
import { Grid } from '../components/Grid';
import Icon from '../components/Icon';
import LabeledValue from '../components/LabeledValue';
import Link, { BasicLink, ExternalListLink } from '../components/Link';
import LiquidityMiningCampaignCardList from '../components/LiquidityMiningCampaignCardList';
import Panel from '../components/Panel';
import Search from '../components/Search';
import TokenLogo from '../components/TokenLogo';
import { CARROT_REWARD_TOKEN_REGEX, ChainId } from '../constants';
import { useNativeCurrencyPrice } from '../contexts/GlobalData';
import { useNativeCurrencySymbol, useNativeCurrencyWrapper, useSelectedNetwork } from '../contexts/Network';
import { useLiquidityMiningCampaignData, useLiquidityMiningCampaignsForPair, usePairData } from '../contexts/PairData';
import { formatDollarAmount, getExplorerLink, getSwapLink, getSwaprLink, isDxDaoCampaignOwner } from '../utils';

const DashboardWrapper = styled.div`
  width: 100%;
`;

const PanelWrapper = styled.div`
  grid-template-columns: 1.3fr 1fr;
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

  @media screen and (max-width: 1000px) {
    grid-template-columns: 1fr;
    align-items: stretch;
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
`;

const FarmPage = ({ campaignAddress, pairAddress }) => {
  const selectedNetwork = useSelectedNetwork();
  const [nativeCurrencyPrice] = useNativeCurrencyPrice();
  const nativeCurrency = useNativeCurrencySymbol();
  const nativeCurrencyWrapper = useNativeCurrencyWrapper();
  const history = useHistory();
  const { token0, token1, oneDayVolumeUSD } = usePairData(pairAddress);
  const campaign = useLiquidityMiningCampaignData(campaignAddress);

  // get the last 20 campaings
  const liquidityMiningCampaigns = useLiquidityMiningCampaignsForPair(pairAddress, 0);

  const isBelow600px = useMedia('(max-width: 600px)');

  useEffect(() => {
    document.querySelector('body').scrollTo(0, 0);
  }, []);

  const swaprButtonsWidth = isBelow600px ? '100%' : 'initial';
  const isPairLoading = !token0 || !token1;

  const liquidity =
    campaign &&
    campaign.staked &&
    formatDollarAmount(
      parseFloat(campaign.staked.nativeCurrencyAmount.toFixed(USD.decimals)) * nativeCurrencyPrice,
      isBelow600px ? 2 : 0,
      isBelow600px,
    );
  const volume =
    (oneDayVolumeUSD || oneDayVolumeUSD === 0) &&
    formatDollarAmount(oneDayVolumeUSD, isBelow600px ? 2 : 0, isBelow600px);
  const apy = campaign && campaign.apy && `${campaign.apy.toFixed(2)}%`;
  const campaignType = campaign && campaign.locked ? 'LOCKED STAKING' : 'UNLOCKED STAKING';

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
          {!isBelow600px && <Search small={true} />}
        </Flex>
        <DashboardWrapper>
          <Flex
            flexDirection={isBelow600px ? 'column' : 'row'}
            justifyContent={'space-between'}
            style={{ gap: '16px', marginBottom: '20px' }}
          >
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
            <Flex style={{ gap: '16px' }}>
              <Link
                external
                href={getSwaprLink(
                  `/rewards/campaign/${token0?.id}/${token1?.id}/${campaignAddress}`,
                  ChainId[selectedNetwork],
                )}
                style={{ width: swaprButtonsWidth }}
              >
                <ButtonLight style={{ minWidth: '148px', width: swaprButtonsWidth }}>
                  <Typography.SmallBoldText color={'bd1'} sx={{ letterSpacing: '0.08em' }}>
                    + ADD LIQUIDITY
                  </Typography.SmallBoldText>
                </ButtonLight>
              </Link>
              <Link
                external
                href={getSwapLink(selectedNetwork, nativeCurrency, nativeCurrencyWrapper, token0?.id, token1?.id)}
                style={{ width: swaprButtonsWidth }}
              >
                <ButtonDark style={{ minWidth: '148px', width: swaprButtonsWidth }}>
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
                <Grid gridTemplateColumns={'repeat(3, 1fr)'} gridGap={'20px'}>
                  <LabeledValue label={'TVL'} value={liquidity} />
                  <LabeledValue label={isBelow600px ? 'VOLUME' : '24H VOLUME'} value={volume} />
                  <LabeledValue label={'APY'} value={apy} />
                  <LabeledValue label={isBelow600px ? 'TYPE' : 'FARM TYPE'} value={campaign && campaignType} />
                  <LabeledValue
                    label={'START'}
                    value={campaign && dayjs.unix(campaign.startsAt).format('MMMM DD YYYY HH:mm')}
                  />
                  <LabeledValue
                    label={'END'}
                    value={campaign && dayjs.unix(campaign.endsAt).format('MMMM DD YYYY HH:mm')}
                  />
                </Grid>
              </Flex>
            </Panel>
            <Panel style={{ height: '100%' }}>
              <Flex flexDirection={'column'} style={{ gap: '28px' }}>
                <Typography.Custom sx={{ fontWeight: 500, fontSize: '16px', lineHeight: '19px' }}>
                  Rewards
                </Typography.Custom>
                <Flex justifyContent={'space-between'}>
                  <Flex
                    flexDirection={'column'}
                    style={{ gap: '8px' }}
                    alignItems={isBelow600px ? 'center' : 'flex-start'}
                  >
                    <Typography.Custom
                      color={'text7'}
                      sx={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.15em' }}
                    >
                      TOKENS
                    </Typography.Custom>
                    {campaign ? (
                      campaign.rewards.map((reward, index) => {
                        const isCarrotToken = CARROT_REWARD_TOKEN_REGEX.test(reward.token.symbol);

                        return (
                          <Flex key={`${reward.address}${index}`}>
                            <TokenLogo
                              address={reward.token.address.toLowerCase()}
                              source={isCarrotToken ? carrotListLogoUrl : undefined}
                              size="16px"
                              defaultText={isCarrotToken ? 'CARROT' : reward.token.symbol}
                              flexBasis="auto"
                              justifyContent="flex-end"
                            />
                            {!isBelow600px && (
                              <Typography.LargeBoldText
                                color={'text6'}
                                sx={{ letterSpacing: '0.02em', marginLeft: '16px' }}
                              >
                                {isCarrotToken
                                  ? 'CARROT'
                                  : nativeCurrencyWrapper.symbol === reward.token.symbol
                                  ? nativeCurrency
                                  : reward.token.symbol}
                              </Typography.LargeBoldText>
                            )}
                          </Flex>
                        );
                      })
                    ) : (
                      <>
                        <Skeleton height={'16px'} width={'70px'} />
                        <Skeleton height={'16px'} width={'70px'} />
                        <Skeleton height={'16px'} width={'70px'} />
                      </>
                    )}
                  </Flex>
                  <Flex flexDirection={'column'} style={{ gap: '8px' }}>
                    <Typography.Custom
                      color={'text7'}
                      sx={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.15em' }}
                    >
                      TOTAL
                    </Typography.Custom>
                    {campaign ? (
                      campaign.rewards.map((reward) => {
                        const isCarrotToken = CARROT_REWARD_TOKEN_REGEX.test(reward.token.symbol);

                        return (
                          <Flex key={reward.token.address} style={{ gap: '16px' }}>
                            <Typography.LargeBoldText color={'text6'} sx={{ letterSpacing: '0.02em' }}>
                              {reward.toSignificant(4)}
                            </Typography.LargeBoldText>
                            {!isBelow600px && (
                              <TokenLogo
                                address={reward.token.address.toLowerCase()}
                                source={isCarrotToken ? carrotListLogoUrl : undefined}
                                size="16px"
                                defaultText={isCarrotToken ? 'CARROT' : reward.token.symbol}
                                flexBasis="auto"
                                justifyContent="flex-end"
                              />
                            )}
                          </Flex>
                        );
                      })
                    ) : (
                      <>
                        <Skeleton height={'16px'} width={'70px'} />
                        <Skeleton height={'16px'} width={'70px'} />
                        <Skeleton height={'16px'} width={'70px'} />
                      </>
                    )}
                  </Flex>
                  <Flex flexDirection={'column'} alignItems={'flex-end'} style={{ gap: '8px' }}>
                    <Typography.Custom
                      color={'text7'}
                      sx={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.15em' }}
                    >
                      REMAINING
                    </Typography.Custom>
                    {campaign ? (
                      campaign.remainingRewards.map((reward) => {
                        const isCarrotToken = CARROT_REWARD_TOKEN_REGEX.test(reward.token.symbol);

                        return (
                          <Flex key={reward.token.address} style={{ gap: '16px' }}>
                            <Typography.LargeBoldText color={'text6'} sx={{ letterSpacing: '0.02em' }}>
                              {reward.toSignificant(4)}
                            </Typography.LargeBoldText>
                            {!isBelow600px && (
                              <TokenLogo
                                address={reward.token.address.toLowerCase()}
                                source={isCarrotToken ? carrotListLogoUrl : undefined}
                                size="16px"
                                defaultText={isCarrotToken ? 'CARROT' : reward.token.symbol}
                                flexBasis="auto"
                                justifyContent="flex-end"
                              />
                            )}
                          </Flex>
                        );
                      })
                    ) : (
                      <>
                        <Skeleton height={'16px'} width={'70px'} />
                        <Skeleton height={'16px'} width={'70px'} />
                        <Skeleton height={'16px'} width={'70px'} />
                      </>
                    )}
                  </Flex>
                </Flex>
              </Flex>
            </Panel>
            <Panel style={{ height: '100%' }}>
              <Flex flexDirection={'column'} style={{ gap: '28px' }}>
                <Typography.Custom sx={{ fontWeight: 500, fontSize: '16px', lineHeight: '19px' }}>
                  Carrot campaigns
                </Typography.Custom>
                <Flex flexDirection={'column'} style={{ gap: '16px' }}>
                  <Typography.Text color={'text6'} sx={{ letterSpacing: '0.02em' }}>
                    Learn how to use KPI tokens through Carrot by clicking{' '}
                    <Link
                      color={'text7'}
                      external={true}
                      href={'https://medium.com/carrot-eth/how-to-use-carrot-374e0e1abbe2'}
                    >
                      here
                    </Link>
                    .
                  </Typography.Text>
                  {campaign && campaign.kpiRewards.length > 0 && (
                    <>
                      <Typography.Text color={'text6'} sx={{ letterSpacing: '0.02em' }}>
                        This campaign contains Carrot KPI tokens that are redeemable for collateral upon reaching the
                        goals expressed in the KPI.
                      </Typography.Text>
                      {campaign.kpiRewards.map((kpiReward) => (
                        <Flex key={kpiReward.currency.kpiId} justifyContent={'space-between'}>
                          <Flex alignItems={'center'} style={{ gap: '16px' }}>
                            <TokenLogo source={carrotListLogoUrl} size={'20px'} />
                            {!isBelow600px && (
                              <Typography.LargeBoldText color={'text6'} sx={{ letterSpacing: '0.02em' }}>
                                {kpiReward.currency.symbol}
                              </Typography.LargeBoldText>
                            )}
                          </Flex>
                          <GoToCampaignLink campaignId={kpiReward.currency.kpiId} />
                        </Flex>
                      ))}
                    </>
                  )}
                </Flex>
                {!campaign && <Skeleton height={'32px'} witdh={'120px'} />}
                {campaign && campaign.kpiRewards.length === 0 && (
                  <Typography.Text color={'text6'} sx={{ letterSpacing: '0.02em' }}>
                    There are no active Carrot campaings linked to this farm.
                  </Typography.Text>
                )}
              </Flex>
            </Panel>
            {campaign && isDxDaoCampaignOwner(campaign.owner) && (
              <Panel height={'fit-content'} width={isBelow600px ? '100%' : 'fit-content'}>
                <Flex flexDirection={'column'} style={{ gap: '28px' }}>
                  <Typography.Custom sx={{ fontWeight: 500, fontSize: '16px', lineHeight: '19px' }}>
                    Owner
                  </Typography.Custom>
                  <Flex alignItems={'center'} style={{ gap: '16px' }}>
                    <Icon marginRight={'0'} icon={<DxdLogoSvg height={24} width={24} />} />
                    <Typography.LargeBoldText color={'text6'} sx={{ letterSpacing: '0.02em' }}>
                      Campaign created by DXdao
                    </Typography.LargeBoldText>
                  </Flex>
                </Flex>
              </Panel>
            )}
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
