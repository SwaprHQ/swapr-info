import React from "react";
import ReactDOM from "react-dom";
import ThemeProvider, { GlobalStyle } from "./Theme";
import LocalStorageContextProvider, {
  Updater as LocalStorageContextUpdater,
} from "./contexts/LocalStorage";
import TokenDataContextProvider, {
  Updater as TokenDataContextUpdater,
} from "./contexts/TokenData";
import GlobalDataContextProvider from "./contexts/GlobalData";
import DashboardContextProvider from "./contexts/Dashboard";
import PairDataContextProvider, {
  Updater as PairDataContextUpdater,
} from "./contexts/PairData";
import ApplicationContextProvider from "./contexts/Application";
import NetworkContextProvider, {
  Updater as NetworkContextUpdater,
} from "./contexts/Network";
import UserContextProvider from "./contexts/User";
import App from "./App";
import { HashRouter } from "react-router-dom";

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
  <ContextProviders>
    <HashRouter>
      <Updaters />
      <ThemeProvider>
        <GlobalStyle />
        <App />
      </ThemeProvider>
    </HashRouter>
  </ContextProviders>,
  document.getElementById("root")
);
