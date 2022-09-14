import { useEffect } from 'react';
import 'feather-icons';
import Marquee from 'react-fast-marquee';
import { useMedia } from 'react-use';
import { Box, Flex } from 'rebass';

import { Typography } from '../Theme';
import { PageWrapper, FullWrapper } from '../components';
import LocalLoader from '../components/LocalLoader';
import PairCard from '../components/PairCard';
import PairList from '../components/PairList';
import Search from '../components/Search';
import { useAllPairData, useTopTVLPairs } from '../contexts/PairData';

function AllPairsPage() {
  const allPairs = useAllPairData();
  const topTVLPairs = useTopTVLPairs();

  const below600 = useMedia('(max-width: 600px)');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const isTopTVLTokenEmpty = !topTVLPairs || topTVLPairs.length === 0;

  return (
    <PageWrapper>
      <FullWrapper gap={'0'}>
        <Flex alignItems={'center'} justifyContent={below600 ? 'center' : 'space-between'}>
          <Typography.MediumHeader
            color={'text10'}
            sx={{ textAlign: below600 ? 'center' : 'left', marginTop: '40px', marginBottom: '20px' }}
          >
            Top Pairs
          </Typography.MediumHeader>
          {!below600 && <Search />}
        </Flex>
        <Flex height={'125px'}>
          {!isTopTVLTokenEmpty ? (
            <Marquee
              delay={0}
              gradient
              gradientWidth={below600 ? 10 : 30}
              gradientColor={[11, 11, 17]}
              speed={40}
              style={{ margin: '5px 0px', height: 'fit-content' }}
              pauseOnHover
            >
              {topTVLPairs.map((pair) => (
                <PairCard
                  key={pair.id}
                  pairAddress={pair.id}
                  token0={{ address: pair.token0.id, symbol: pair.token0.symbol }}
                  token1={{ address: pair.token1.id, symbol: pair.token1.symbol }}
                  tvl={pair.reserveUSD}
                  liquidityMiningCampaigns={pair.liquidityMiningCampaigns}
                />
              ))}
            </Marquee>
          ) : (
            <LocalLoader height={'125'} style={{ margin: '5px 0' }} />
          )}
        </Flex>
        {below600 && (
          <Box marginTop={'20px'}>
            <Search small={true} />
          </Box>
        )}
        <Flex alignItems={'flex-end'} justifyContent={below600 ? 'center' : 'space-between'}>
          <Typography.MediumHeader color={'text10'} sx={{ marginTop: '40px', marginBottom: '20px' }}>
            Top Pairs
          </Typography.MediumHeader>
        </Flex>
        <PairList pairs={allPairs} disbaleLinks={true} maxItems={20} />
      </FullWrapper>
    </PageWrapper>
  );
}

export default AllPairsPage;
