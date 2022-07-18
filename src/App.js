import React, { useState, useContext } from 'react';
import { SkeletonTheme } from 'react-loading-skeleton';
import { Route, Switch, Redirect } from 'react-router-dom';
import styled, { ThemeContext } from 'styled-components';
import 'react-loading-skeleton/dist/skeleton.css';

import LocalLoader from './components/LocalLoader';
import SideNav from './components/SideNav';
import {
  DEFAULT_BLOCK_DIFFERENCE_THRESHOLD,
  BLOCK_DIFFERENCE_THRESHOLD,
  OVERVIEW_TOKEN_BLACKLIST,
  PAIR_BLACKLIST,
} from './constants';
import { useLatestBlocks, useTokensLists } from './contexts/Application';
import { useSelectedNetwork } from './contexts/Network';
import AccountLookup from './pages/AccountLookup';
import AccountPage from './pages/AccountPage';
import AllPairsPage from './pages/AllPairsPage';
import AllTokensPage from './pages/AllTokensPage';
import DashboardPage from './pages/DashboardPage';
import FarmingPage from './pages/FarmingPage';
import GlobalPage from './pages/GlobalPage';
import PairPage from './pages/PairPage';
import TokenPage from './pages/TokenPage';
import { isAddress } from './utils';

const AppWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const ContentWrapper = styled.div`
  display: grid;
  grid-template-columns: ${({ open }) => (open ? '220px 1fr' : '220px 1fr')};

  @media screen and (max-width: 1400px) {
    grid-template-columns: 220px 1fr;
  }

  @media screen and (max-width: 1080px) {
    grid-template-columns: 1fr;
    max-width: 100vw;
    overflow: hidden;
    grid-gap: 0;
  }
`;

const Center = styled.div`
  height: 100%;
  transition: width 0.25s ease;
  background-color: ${({ theme }) => theme.bg1};
`;

const WarningWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

const WarningBanner = styled.div`
  background-color: #ff6871;
  padding: 1.5rem;
  color: white;
  width: 100%;
  text-align: center;
  font-weight: 500;
`;

/**
 * Wrap the component with the header and sidebar pinned tab
 */
const LayoutWrapper = ({ children, savedOpen }) => {
  return (
    <>
      <ContentWrapper open={savedOpen}>
        <SideNav />
        <Center id="center">{children}</Center>
        {/* TODO: uncomment once per-network pinning is a thing */}
        {/* <Right open={savedOpen}>
          <PinnedData open={savedOpen} setSavedOpen={setSavedOpen} />
        </Right> */}
      </ContentWrapper>
    </>
  );
};

function App() {
  const [savedOpen, setSavedOpen] = useState(false);

  const [latestBlock, headBlock] = useLatestBlocks();
  const selectedNetwork = useSelectedNetwork();
  const tokensLists = useTokensLists();
  const theme = useContext(ThemeContext);

  // show warning
  const showWarning =
    headBlock && latestBlock
      ? headBlock - latestBlock >
        (selectedNetwork
          ? BLOCK_DIFFERENCE_THRESHOLD[selectedNetwork] || DEFAULT_BLOCK_DIFFERENCE_THRESHOLD
          : DEFAULT_BLOCK_DIFFERENCE_THRESHOLD)
      : false;

  return tokensLists?.size > 0 ? (
    <SkeletonTheme baseColor={theme.loaderBase} highlightColor={theme.loaderHighlight}>
      <AppWrapper>
        {showWarning && (
          <WarningWrapper>
            <WarningBanner>
              {`Warning: The data on this site has only synced to block ${latestBlock} (out of ${headBlock}). Please check back soon.`}
            </WarningBanner>
          </WarningWrapper>
        )}
        <Switch>
          <Route
            exacts
            strict
            path="/token/:tokenAddress"
            render={({ match }) => {
              if (OVERVIEW_TOKEN_BLACKLIST.includes(match.params.tokenAddress.toLowerCase())) {
                return <Redirect to="/home" />;
              }
              if (isAddress(match.params.tokenAddress.toLowerCase())) {
                return (
                  <LayoutWrapper savedOpen={savedOpen} setSavedOpen={setSavedOpen}>
                    <TokenPage address={match.params.tokenAddress.toLowerCase()} />
                  </LayoutWrapper>
                );
              } else {
                return <Redirect to="/home" />;
              }
            }}
          />
          <Route
            exacts
            strict
            path="/pair/:pairAddress"
            render={({ match }) => {
              if (PAIR_BLACKLIST.includes(match.params.pairAddress.toLowerCase())) {
                return <Redirect to="/home" />;
              }
              if (isAddress(match.params.pairAddress.toLowerCase())) {
                return (
                  <LayoutWrapper savedOpen={savedOpen} setSavedOpen={setSavedOpen}>
                    <PairPage pairAddress={match.params.pairAddress.toLowerCase()} />
                  </LayoutWrapper>
                );
              } else {
                return <Redirect to="/home" />;
              }
            }}
          />
          <Route
            exacts
            strict
            path="/account/:accountAddress"
            render={({ match }) => {
              if (isAddress(match.params.accountAddress.toLowerCase())) {
                return (
                  <LayoutWrapper savedOpen={savedOpen} setSavedOpen={setSavedOpen}>
                    <AccountPage account={match.params.accountAddress.toLowerCase()} />
                  </LayoutWrapper>
                );
              } else {
                return <Redirect to="/home" />;
              }
            }}
          />
          <Route path="/dashboard">
            <LayoutWrapper savedOpen={savedOpen} setSavedOpen={setSavedOpen}>
              <DashboardPage />
            </LayoutWrapper>
          </Route>

          <Route path="/home">
            <LayoutWrapper savedOpen={savedOpen} setSavedOpen={setSavedOpen}>
              <GlobalPage />
            </LayoutWrapper>
          </Route>

          <Route path="/tokens">
            <LayoutWrapper savedOpen={savedOpen} setSavedOpen={setSavedOpen}>
              <AllTokensPage />
            </LayoutWrapper>
          </Route>

          <Route path="/pairs">
            <LayoutWrapper savedOpen={savedOpen} setSavedOpen={setSavedOpen}>
              <AllPairsPage />
            </LayoutWrapper>
          </Route>

          <Route path="/accounts">
            <LayoutWrapper savedOpen={savedOpen} setSavedOpen={setSavedOpen}>
              <AccountLookup />
            </LayoutWrapper>
          </Route>

          <Route path="/farming">
            <LayoutWrapper savedOpen={savedOpen} setSavedOpen={setSavedOpen}>
              <FarmingPage />
            </LayoutWrapper>
          </Route>

          <Redirect to="/home" />
        </Switch>
      </AppWrapper>
    </SkeletonTheme>
  ) : (
    <LocalLoader fill="true" />
  );
}

export default App;
