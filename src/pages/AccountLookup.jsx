import { useEffect } from 'react';
import 'feather-icons';
import { withRouter } from 'react-router-dom';
import { Flex } from 'rebass';

import { Typography } from '../Theme';
import { PageWrapper, FullWrapper } from '../components';
import AccountSearch from '../components/AccountSearch';
import LiquidityPositionsList from '../components/LiquidityPositionsList';
import SavedAccounts from '../components/SavedAccounts';
import { useTopLps } from '../contexts/GlobalData';
import { useSwaprSubgraphClient } from '../contexts/Network';
import { useIsBelowPx } from '../hooks/useIsBelowPx';

function AccountLookup() {
  const client = useSwaprSubgraphClient();
  const topLps = useTopLps(client);

  const isBelow600px = useIsBelowPx(600);

  // scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <PageWrapper>
      <FullWrapper gap={0}>
        <Flex
          alignItems={'center'}
          justifyContent={'space-between'}
          flexDirection={isBelow600px ? 'column' : 'row'}
          marginBottom={'20px'}
        >
          <Typography.MediumHeader
            color={'text10'}
            sx={{ textAlign: isBelow600px ? 'center' : 'left', marginTop: '26px' }}
          >
            Wallet analytics
          </Typography.MediumHeader>
        </Flex>
        <Flex flexDirection={'column'} style={{ gap: '20px' }}>
          <AccountSearch isSmall={isBelow600px} />
          <SavedAccounts />
        </Flex>
        <Typography.MediumHeader
          color={'text10'}
          sx={{ textAlign: isBelow600px ? 'center' : 'left', marginTop: '40px', marginBottom: '20px' }}
        >
          Top Liquidity Positions
        </Typography.MediumHeader>
        <LiquidityPositionsList lps={topLps} maxItems={20} />
      </FullWrapper>
    </PageWrapper>
  );
}

export default withRouter(AccountLookup);
