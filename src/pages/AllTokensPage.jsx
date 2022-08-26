import { useEffect, useMemo } from 'react';
import 'feather-icons';
import Marquee from 'react-fast-marquee';
import { useMedia } from 'react-use';
import { Box, Flex } from 'rebass';

import { Typography } from '../Theme';
import { PageWrapper, FullWrapper } from '../components';
import LocalLoader from '../components/LocalLoader';
import Search from '../components/Search';
import TokenCard from '../components/TokenCard';
import TopTokenList from '../components/TokenList';
import { useAllTokenData } from '../contexts/TokenData';

function AllTokensPage() {
  const allTokens = useAllTokenData();

  const below800 = useMedia('(max-width: 800px)');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const topMovers = useMemo(
    () =>
      Object.values(allTokens)
        .sort((a, b) => Math.abs(b.priceChangeUSD) - Math.abs(a.priceChangeUSD))
        .slice(0, 20)
        .filter((token) => Number(Math.abs(token.priceChangeUSD)).toFixed(2) !== '0.00'),
    [allTokens],
  );

  const isTopMoversEmpty = Object.keys(allTokens).length > 0 && topMovers.length === 0;

  return (
    <PageWrapper>
      <FullWrapper gap={'0'}>
        <Flex alignItems={'center'} justifyContent={below800 ? 'center' : 'space-between'} marginBottom={'16px'}>
          {!isTopMoversEmpty ? <Typography.MediumHeader color={'text10'}>Top Movers</Typography.MediumHeader> : <div />}
          {!below800 && <Search small={true} />}
        </Flex>
        {!isTopMoversEmpty && (
          <>
            {topMovers.length > 0 ? (
              <Marquee
                gradient
                gradientWidth={below800 ? 10 : 30}
                gradientColor={[11, 11, 17]}
                speed={40}
                style={{ margin: '5px 0px', height: 'fit-content' }}
                pauseOnHover
              >
                {topMovers.map((token) => (
                  <TokenCard
                    key={token.id}
                    address={token.id}
                    symbol={token.symbol}
                    price={token.priceUSD}
                    priceChange={token.priceChangeUSD}
                    margin="0px 5px"
                  />
                ))}
              </Marquee>
            ) : (
              <LocalLoader height={'26px'} />
            )}
          </>
        )}
        {below800 && (
          <Box marginTop={'20px'}>
            <Search small={true} />
          </Box>
        )}
        <Typography.MediumHeader
          color={'text10'}
          sx={{ textAlign: below800 ? 'center' : 'left', marginTop: '40px', marginBottom: '20px' }}
        >
          Top Tokens
        </Typography.MediumHeader>
        <TopTokenList tokens={allTokens} itemMax={20} />
      </FullWrapper>
    </PageWrapper>
  );
}

export default AllTokensPage;
