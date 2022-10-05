import { useState, useMemo, useEffect } from 'react';
import Skeleton from 'react-loading-skeleton';
import { useMedia } from 'react-use';
import { Flex } from 'rebass';
import styled from 'styled-components';

import { Typography } from '../Theme';
import { PageWrapper, ContentWrapper } from '../components';
import { ButtonDark } from '../components/ButtonStyled';
import CopyHelper from '../components/Copy';
import LabeledValue from '../components/LabeledValue';
import { BasicLink, ExternalListLink } from '../components/Link';
import LiquidityMiningPositionChart from '../components/LiquidityMiningPositionChart';
import LiquidityPositionsDropdown from '../components/LiquidityPositionsDropdown';
import Panel from '../components/Panel';
import PositionList from '../components/PositionList';
import Search from '../components/Search';
import TxnList from '../components/TxnList';
import UserLiquidityChart from '../components/UserLiquidityChart';
import { ChainId, FEE_WARNING_TOKENS } from '../constants';
import { useSavedAccounts } from '../contexts/LocalStorage';
import { useSelectedNetwork } from '../contexts/Network';
import { useUserTransactions, useUserPositions } from '../contexts/User';
import { formattedNum, getExplorerLink, shortenAddress } from '../utils';

const DashboardWrapper = styled.div`
  width: 100%;
`;

const PanelWrapper = styled.div`
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: max-content;
  gap: 20px;
  display: inline-grid;
  width: 100%;
  align-items: start;

  @media screen and (max-width: 1100px) {
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
`;

const Warning = styled.div`
  background-color: ${({ theme }) => theme.bg2};
  color: ${({ theme }) => theme.text1};
  padding: 1rem;
  font-weight: 600;
  border-radius: 10px;
  margin-bottom: 1rem;
  width: calc(100% - 2rem);
`;

function AccountPage({ account }) {
  // if any position has token from fee warning list, show warning
  const [showWarning, setShowWarning] = useState(false);
  const [activePosition, setActivePosition] = useState({ key: 'all', label: 'All positions' });

  // get data for this account
  const transactions = useUserTransactions(account);
  const { positions } = useUserPositions(account);
  const selectedNetwork = useSelectedNetwork();
  const [savedAccounts, addAccountToStorage, removeAccountFromStorage] = useSavedAccounts();

  const isBelow600px = useMedia('(max-width: 600px)');

  useEffect(() => {
    window.scrollTo({
      behavior: 'smooth',
      top: 0,
    });
  }, []);

  useEffect(() => {
    if (positions) {
      for (let i = 0; i < positions.length; i++) {
        if (
          FEE_WARNING_TOKENS.includes(positions[i].pair.token0.id) ||
          FEE_WARNING_TOKENS.includes(positions[i].pair.token1.id)
        ) {
          setShowWarning(true);
        }
      }
    }
  }, [positions, addAccountToStorage, account]);

  // get derived totals
  let totalSwappedUSD = useMemo(
    () =>
      transactions && transactions.swaps
        ? transactions.swaps.reduce((total, swap) => total + parseFloat(swap.amountUSD), 0)
        : null,
    [transactions],
  );

  const mostValuablePosition = useMemo(
    () => positions && positions.sort((a, b) => b.principal.usd - a.principal.usd)[0],
    [positions],
  );

  const { formattedLiquidityMiningPositions, cleanFormattedLiquidityMiningPositions } = useMemo(() => {
    if (positions) {
      const formattedPositions = positions.map((position) => ({
        ...position,
        key: position.pair.id,
        label: `${position.pair.token0.symbol}-${position.pair.token1.symbol} position`,
      }));

      return {
        formattedLiquidityMiningPositions: [...formattedPositions, { key: 'all', label: 'All positions' }],
        cleanFormattedLiquidityMiningPositions: formattedPositions,
      };
    }

    return {
      formattedLiquidityMiningPositions: null,
      cleanFormattedLiquidityMiningPositions: null,
    };
  }, [positions]);

  const { aggregatedValues, aggregatedFees } = useMemo(() => {
    if (cleanFormattedLiquidityMiningPositions) {
      const actualPositions = activePosition.key === 'all' ? cleanFormattedLiquidityMiningPositions : [activePosition];

      // aggregate fees of all positions
      const aggregatedFees = actualPositions.reduce((total, position) => total + parseFloat(position.fees.sum), 0);

      // aggregate values of all positions
      const aggregatedValues = actualPositions.reduce(
        (total, position) =>
          total +
          (parseFloat(position.liquidityTokenBalance) / parseFloat(position.pair.totalSupply)) *
            parseFloat(position.pair.reserveUSD),
        0,
      );

      return {
        aggregatedValues,
        aggregatedFees,
      };
    }

    return {
      aggregatedValues: null,
      aggregatedFees: null,
    };
  }, [activePosition, cleanFormattedLiquidityMiningPositions]);

  const isAccountAlreadySaved = useMemo(
    () => savedAccounts && savedAccounts.findIndex((savedAccount) => savedAccount.id === account) !== -1,
    [savedAccounts, account],
  );

  const isAccountsLimitReached = useMemo(() => savedAccounts && savedAccounts.length >= 5, [savedAccounts]);

  const saveAccount = () => {
    const accontToBeSaved = {
      id: account,
      network: ChainId[selectedNetwork],
      pair: {
        id: mostValuablePosition.pair.id,
        token0: { id: mostValuablePosition.pair.token0.id, symbol: mostValuablePosition.pair.token0.symbol },
        token1: { id: mostValuablePosition.pair.token1.id, symbol: mostValuablePosition.pair.token1.symbol },
      },
    };

    addAccountToStorage(accontToBeSaved);
  };

  // get data for user stats
  const transactionCount = transactions?.swaps?.length + transactions?.burns?.length + transactions?.mints?.length;

  return (
    <PageWrapper>
      <ContentWrapper>
        <Flex alignItems={'end'} justifyContent={'space-between'}>
          <Typography.LargeText color={'text10'} sx={{ marginRight: '4px' }}>
            <BasicLink to="/accounts">{'Accounts '}</BasicLink>
            <ExternalListLink external={true} href={getExplorerLink(selectedNetwork, account, 'address')}>
              {`→  ${account}`}
            </ExternalListLink>
          </Typography.LargeText>
          {!isBelow600px && <Search />}
        </Flex>
        <Flex style={{ gap: '20px' }} flexDirection={'column'}>
          {formattedLiquidityMiningPositions ? (
            <Flex>
              {isAccountAlreadySaved ? (
                <ButtonDark onClick={() => removeAccountFromStorage(account)}>
                  <Typography.SmallBoldText color={'text8'} sx={{ letterSpacing: '0.08em' }}>
                    REMOVE ACCOUNT
                  </Typography.SmallBoldText>
                </ButtonDark>
              ) : !isAccountsLimitReached ? (
                <ButtonDark onClick={saveAccount}>
                  <Typography.SmallBoldText color={'text8'} sx={{ letterSpacing: '0.08em' }}>
                    SAVE ACCOUNT
                  </Typography.SmallBoldText>
                </ButtonDark>
              ) : null}
            </Flex>
          ) : (
            <Skeleton width={148} height={34} borderRadius={12} />
          )}
          {formattedLiquidityMiningPositions ? (
            <LiquidityPositionsDropdown
              liquidityMiningPositions={formattedLiquidityMiningPositions}
              active={activePosition}
              setActive={setActivePosition}
            />
          ) : (
            <Skeleton width={291} height={50} borderRadius={12} />
          )}
        </Flex>
        <DashboardWrapper>
          {showWarning && <Warning>Fees cannot currently be calculated for pairs that include AMPL.</Warning>}
          <PanelWrapper>
            <Panel>
              <Flex flexDirection={'column'} style={{ gap: '20px' }}>
                <Flex justifyContent={'space-between'}>
                  <LabeledValue
                    label={'LIQUIDITY (INC. FEES)'}
                    value={
                      aggregatedValues || aggregatedValues === 0 ? (
                        formattedNum(aggregatedValues, true, true)
                      ) : (
                        <Skeleton width={90} />
                      )
                    }
                  />
                  <ExternalListLink external={true} href={getExplorerLink(selectedNetwork, account, 'address')}>
                    <ButtonDark>
                      <Typography.SmallBoldText color={'text8'} sx={{ letterSpacing: '0.08em' }}>
                        VIEW ON EXPLORER ↗
                      </Typography.SmallBoldText>
                    </ButtonDark>
                  </ExternalListLink>
                </Flex>
                <LabeledValue
                  label={'FEES EARNED (COMULATIVE)'}
                  value={
                    aggregatedFees || aggregatedFees === 0 ? (
                      formattedNum(aggregatedFees, true, true)
                    ) : (
                      <Skeleton width={90} />
                    )
                  }
                />
                <Flex flexDirection={'column'} style={{ gap: '8px' }}>
                  <Typography.Custom
                    color={'text7'}
                    sx={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.15em' }}
                  >
                    {'ADDRESS'}
                  </Typography.Custom>
                  <Flex>
                    {account ? (
                      <>
                        <Typography.LargeBoldText color={'text6'} sx={{ letterSpacing: '0.02em' }}>
                          {shortenAddress(account)}
                        </Typography.LargeBoldText>
                        <CopyHelper toCopy={account} />{' '}
                      </>
                    ) : (
                      <Skeleton width={90} />
                    )}
                  </Flex>
                </Flex>
              </Flex>
            </Panel>
            <Panel>
              <Flex flexDirection={'column'} style={{ gap: '20px' }}>
                <LabeledValue
                  label={'TOTAL VALUE SWAPPED'}
                  value={
                    totalSwappedUSD || totalSwappedUSD === 0 ? (
                      formattedNum(totalSwappedUSD, true)
                    ) : (
                      <Skeleton width={90} />
                    )
                  }
                />
                <LabeledValue
                  label={'TOTAL FEES PAID'}
                  value={
                    totalSwappedUSD || totalSwappedUSD === 0 ? (
                      // FIXME: keep in mind this is a potentially rough estimation, since pairs can have different swap fees
                      formattedNum(totalSwappedUSD * 0.0025, true)
                    ) : (
                      <Skeleton width={90} />
                    )
                  }
                />
                <LabeledValue
                  label={'TOTAL TRANSACTIONS'}
                  value={transactionCount || transactionCount === 0 ? transactionCount : <Skeleton width={90} />}
                />
              </Flex>
            </Panel>
            <Panel
              style={{
                gridColumn: '2/4',
                gridRow: '1/3',
              }}
            >
              {activePosition.key !== 'all' ? (
                <LiquidityMiningPositionChart account={account} position={activePosition} />
              ) : (
                <UserLiquidityChart account={account} />
                // <UserChart account={account} position={null} />
              )}
            </Panel>
          </PanelWrapper>
          <Typography.Custom
            color={'text10'}
            sx={{
              fontSize: '20px',
              lineHeight: '24px',
              fontWeight: 400,
              marginTop: '40px',
              marginBottom: '20px',
              textAlign: isBelow600px ? 'center' : 'left',
            }}
          >
            Positions
          </Typography.Custom>
          <Panel
            style={{
              marginTop: '1.5rem',
            }}
          >
            <PositionList positions={cleanFormattedLiquidityMiningPositions} />
          </Panel>
          <Typography.Custom
            color={'text10'}
            sx={{
              fontSize: '20px',
              lineHeight: '24px',
              fontWeight: 400,
              marginTop: '40px',
              marginBottom: '20px',
              textAlign: isBelow600px ? 'center' : 'left',
            }}
          >
            Transactions
          </Typography.Custom>
          <TxnList transactions={transactions} />
        </DashboardWrapper>
      </ContentWrapper>
    </PageWrapper>
  );
}

export default AccountPage;
