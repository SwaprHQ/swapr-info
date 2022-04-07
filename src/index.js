import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter } from 'react-router-dom';

import App from './App';
import ThemeProvider, { GlobalStyle } from './Theme';
import ApplicationContextProvider from './contexts/Application';
import DashboardContextProvider from './contexts/Dashboard';
import GlobalDataContextProvider from './contexts/GlobalData';
import LocalStorageContextProvider, {
  Updater as LocalStorageContextUpdater,
  Updater as LocalStorageContextUpdater,
} from './contexts/LocalStorage';
import NetworkContextProvider, { Updater as NetworkContextUpdater } from './contexts/Network';
import PairDataContextProvider, {
  Updater as PairDataContextUpdater,
  Updater as PairDataContextUpdater,
} from './contexts/PairData';
import TokenDataContextProvider, {
  Updater as TokenDataContextUpdater,
  Updater as TokenDataContextUpdater,
} from './contexts/TokenData';
import UserContextProvider from './contexts/User';

function ContextProviders({ children }) {
  return (
    <LocalStorageContextProvider>
      <ApplicationContextProvider>
        <NetworkContextProvider>
          <TokenDataContextProvider>
            <GlobalDataContextProvider>
              <DashboardContextProvider>
                <PairDataContextProvider>
                  <UserContextProvider>{children}</UserContextProvider>
                </PairDataContextProvider>
              </DashboardContextProvider>
            </GlobalDataContextProvider>
          </TokenDataContextProvider>
        </NetworkContextProvider>
      </ApplicationContextProvider>
    </LocalStorageContextProvider>
  );
}

function Updaters() {
  return (
    <>
      <LocalStorageContextUpdater />
      <PairDataContextUpdater />
      <TokenDataContextUpdater />
      <NetworkContextUpdater />
    </>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <ContextProviders>
      <HashRouter>
        <Updaters />
        <ThemeProvider>
          <GlobalStyle />
          <App />
        </ThemeProvider>
      </HashRouter>
    </ContextProviders>
  </React.StrictMode>,
  document.getElementById('root'),
);
