import dayjs from 'dayjs';
import { transparentize } from 'polished';
import { useEffect, useMemo } from 'react';
import { withRouter } from 'react-router-dom';
import { Box, Flex } from 'rebass';
import styled from 'styled-components';

import { ThemedBackground, Typography } from '../Theme';
import { PageWrapper, ContentWrapper } from '../components';
import Chart from '../components/Chart';
import { AutoColumn } from '../components/Column';
import GlobalStats from '../components/GlobalStats';
import LocalLoader from '../components/LocalLoader';
import PairList from '../components/PairList';
import Panel from '../components/Panel';
import { AutoRow } from '../components/Row';
import Search from '../components/Search';
import TopTokenList from '../components/TokenList';
import TxnList from '../components/TxnList';
import { useGlobalChartData, useGlobalTransactions } from '../contexts/GlobalData';
import { useAllPairData } from '../contexts/PairData';
import { useAllTokenData } from '../contexts/TokenData';
import { useIsBelowPx } from '../hooks/useIsBelowPx';

const ListOptions = styled(AutoRow)`
  height: 40px;
  width: 100%;
  font-size: 1.25rem;
  font-weight: 600;

  @media screen and (max-width: 640px) {
    font-size: 1rem;
  }
`;

const GridRow = styled.div`
  display: grid;
  width: 100%;
  grid-template-columns: 1fr 1fr;
  column-gap: 20px;
  align-items: start;
  justify-content: space-between;
`;

const PanelLoaderWrapper = ({ minHeight, maxHeight, isLoading, children }) => (
  <Panel minHeight={minHeight || '360px'} maxHeight={maxHeight || '380px'}>
    {isLoading ? <LocalLoader /> : children}
  </Panel>
);

const GlobalPage = () => {
  // get data for lists and totals
  const allPairs = useAllPairData();
  const allTokens = useAllTokenData();
  const transactions = useGlobalTransactions();
  // global historical data
  const [dailyData] = useGlobalChartData();

  // breakpoints
  const below800 = useIsBelowPx(800);

  // scrolling refs
  useEffect(() => {
    document.querySelector('body').scrollTo({
      behavior: 'smooth',
      top: 0,
    });
  }, []);

  const { formattedLiquidityData, formattedVolumeData } = useMemo(() => {
    return {
      formattedLiquidityData: dailyData?.map((data) => ({
        time: dayjs(data.date * 1000).format('YYYY-MM-DD'),
        value: parseFloat(data.totalLiquidityUSD),
      })),
      formattedVolumeData: dailyData?.map((data) => ({
        time: dayjs(data.date * 1000).format('YYYY-MM-DD'),
        value: parseFloat(data.dailyVolumeUSD),
      })),
    };
  }, [dailyData]);

  const isLoadingLiquidity = !formattedLiquidityData || formattedLiquidityData.length === 0;
  const isLoadingVolume = !formattedVolumeData || formattedVolumeData.length === 0;

  return (
    <PageWrapper>
      <ThemedBackground backgroundColor={transparentize(0.8, '#4526A2')} />
      <ContentWrapper>
        <div>
          <AutoColumn gap={'24px'} style={{ marginBottom: '20px' }}>
            <Flex
              flexDirection={below800 ? 'column' : 'row'}
              alignItems={below800 ? 'center' : 'flex-end'}
              style={{ gap: '20px' }}
            >
              <Box flex={'1'}>
                <Typography.MediumHeader color={'text10'} sx={{ textAlign: below800 ? 'center' : 'left' }}>
                  {below800 ? 'Swapr Protocol Overview' : 'Swapr Protocol Overview'}
                </Typography.MediumHeader>
              </Box>
              <Search />
            </Flex>
          </AutoColumn>
          {!below800 && (
            <GridRow>
              <PanelLoaderWrapper maxHeight={'360px'} isLoading={isLoadingLiquidity}>
                <Chart title={'TVL'} data={formattedLiquidityData} type={'AREA'} />
              </PanelLoaderWrapper>
              <PanelLoaderWrapper maxHeight={'360px'} isLoading={isLoadingVolume}>
                <Chart title={'Volume 24h'} tooltipTitle={'Volume'} data={formattedVolumeData} type={'BAR'} />
              </PanelLoaderWrapper>
            </GridRow>
          )}
          {below800 && (
            <AutoColumn style={{ marginTop: '6px' }} gap="24px">
              <PanelLoaderWrapper minHeight={'360px'} isLoading={isLoadingLiquidity}>
                <Chart title={'TVL'} data={formattedLiquidityData} type={'AREA'} />
              </PanelLoaderWrapper>
              <PanelLoaderWrapper minHeight={'360px'} isLoading={isLoadingVolume}>
                <Chart title={'Volume 24h'} tooltipTitle={'Volume'} data={formattedVolumeData} type={'BAR'} />
              </PanelLoaderWrapper>
            </AutoColumn>
          )}
          <GlobalStats />
          <ListOptions gap="10px" style={{ marginTop: '40px', marginBottom: '20px' }}>
            <Typography.MediumHeader color={'text10'}>Top Tokens</Typography.MediumHeader>
          </ListOptions>
          <TopTokenList tokens={allTokens} />
          <ListOptions gap="10px" style={{ marginTop: '40px', marginBottom: '20px' }}>
            <Typography.MediumHeader color={'text10'}>Top Pairs</Typography.MediumHeader>
          </ListOptions>
          <PairList pairs={allPairs} />
          <ListOptions gap="10px" style={{ marginTop: '40px', marginBottom: '20px' }}>
            <Typography.MediumHeader color={'text10'}>Transactions</Typography.MediumHeader>
          </ListOptions>
          <TxnList transactions={transactions} />
        </div>
      </ContentWrapper>
    </PageWrapper>
  );
};

export default withRouter(GlobalPage);
