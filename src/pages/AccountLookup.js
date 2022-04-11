import React, { useEffect } from 'react';
import 'feather-icons';
import { withRouter } from 'react-router-dom';
import { useMedia } from 'react-use';
import styled from 'styled-components';

import { TYPE } from '../Theme';
import { PageWrapper, FullWrapper } from '../components';
import AccountSearch from '../components/AccountSearch';
import LPList from '../components/LPList';
import LocalLoader from '../components/LocalLoader';
import Panel from '../components/Panel';
import { RowBetween } from '../components/Row';
import Search from '../components/Search';
import { useTopLps } from '../contexts/GlobalData';
import { useSwaprSubgraphClient } from '../contexts/Network';

const AccountWrapper = styled.div`
  @media screen and (max-width: 600px) {
    width: 100%;
  }
`;

function AccountLookup() {
  // scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const client = useSwaprSubgraphClient();
  const topLps = useTopLps(client);

  const below600 = useMedia('(max-width: 600px)');

  return (
    <PageWrapper>
      <FullWrapper>
        <RowBetween>
          <TYPE.largeHeader>Wallet analytics</TYPE.largeHeader>
          {!below600 && <Search small={true} />}
        </RowBetween>
        <AccountWrapper>
          <AccountSearch />
        </AccountWrapper>
        <TYPE.main fontSize={'1.125rem'} style={{ marginTop: '2rem' }}>
          Top Liquidity Positions
        </TYPE.main>
        <Panel>{topLps && topLps.length > 0 ? <LPList lps={topLps} maxItems={200} /> : <LocalLoader />}</Panel>
      </FullWrapper>
    </PageWrapper>
  );
}

export default withRouter(AccountLookup);
