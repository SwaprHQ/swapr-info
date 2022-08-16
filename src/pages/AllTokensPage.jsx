import { useEffect, useRef, useMemo } from 'react';
import 'feather-icons';
import { useMedia } from 'react-use';
import { Box, Flex } from 'rebass';
import styled from 'styled-components';

import { Typography } from '../Theme';
import { PageWrapper, FullWrapper } from '../components';
import LocalLoader from '../components/LocalLoader';
import Search from '../components/Search';
import TokenCard from '../components/TokenCard';
import TopTokenList from '../components/TokenList';
import { useAllTokenData } from '../contexts/TokenData';

export const ScrollableRow = styled.div`
  display: flex;
  flex-direction: row;
  overflow-x: auto;
  white-space: nowrap;
  gap: 14px;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.bd1};
  background-color: ${({ theme }) => theme.bg7};

  -ms-overflow-style: none;
  scrollbar-width: none;
`;

function AllTokensPage() {
  const allTokens = useAllTokenData();
  const increaseRef = useRef(null);
  const below800 = useMedia('(max-width: 800px)');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    let interval;

    if (Object.values(allTokens).length > 0 && increaseRef && increaseRef.current) {
      setTimeout(() => {
        interval = setInterval(() => {
          if (
            increaseRef.current &&
            increaseRef.current.scrollLeft + increaseRef.current.offsetWidth < increaseRef.current.scrollWidth
          ) {
            increaseRef.current.scrollTo(increaseRef.current.scrollLeft + 1, 0);
          }
        }, 50);
      }, 3000);
    }

    return () => clearInterval(interval);
  }, [increaseRef, allTokens]);

  const topMovers = useMemo(
    () =>
      Object.values(allTokens)
        .sort((a, b) => Math.abs(b.priceChangeUSD) - Math.abs(a.priceChangeUSD))
        .slice(0, 20)
        .filter((token) => Number(Math.abs(token.priceChangeUSD)).toFixed(2) !== '0.00'),
    [allTokens],
  );

  return (
    <PageWrapper>
      <FullWrapper gap={'0'}>
        <Flex alignItems={'center'} justifyContent={below800 ? 'center' : 'space-between'} marginBottom={'16px'}>
          <Typography.MediumHeader color={'text10'}>Top Movers</Typography.MediumHeader>
          {!below800 && <Search small={true} />}
        </Flex>
        <ScrollableRow ref={increaseRef}>
          {topMovers.length > 0 ? (
            topMovers.map((token) => (
              <TokenCard
                key={token.id}
                address={token.id}
                symbol={token.symbol}
                price={token.priceUSD}
                priceChange={token.priceChangeUSD}
              />
            ))
          ) : (
            <LocalLoader height={'26px'} />
          )}
        </ScrollableRow>
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
