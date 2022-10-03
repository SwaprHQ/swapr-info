import { useMemo } from 'react';
import { Trash2 } from 'react-feather';
import { useMedia } from 'react-use';
import { Flex } from 'rebass';

import { Divider } from '..';
import { Typography } from '../../Theme';
import { ChainId, SAVED_ACCOUNTS_LIMIT } from '../../constants';
import { useSavedAccounts } from '../../contexts/LocalStorage';
import { useSelectedNetwork } from '../../contexts/Network';
import { shortenAddress } from '../../utils';
import DoubleTokenLogo from '../DoubleLogo';
import Icon from '../Icon';
import { InternalListLink } from '../Link';
import LiquidityPositionValue from '../LiquidityPositionValue';
import { Wrapper, Header, Account, GridArea, TrashIcon, CounterBox } from './styled';

const SavedAccounts = () => {
  const selectedNetwork = useSelectedNetwork();
  const [savedAccounts, , removeAccount] = useSavedAccounts();

  const isBelow450px = useMedia('(max-width: 450px)');
  const isBelow600px = useMedia('(max-width: 600px)');
  const isBelow800px = useMedia('(max-width: 800px)');

  const filteredSavedAccounts = useMemo(
    () => savedAccounts.filter((savedAccount) => savedAccount.network === ChainId[selectedNetwork]),
    [savedAccounts, selectedNetwork],
  );

  const savedAccountsCount = filteredSavedAccounts.length;

  return (
    <>
      <Wrapper isBelow600px={isBelow600px}>
        <Header isBelow600px={isBelow600px}>
          <GridArea area={'account'}>
            <Typography.SmallBoldText color={'text8'} sx={{ textTransform: 'uppercase' }}>
              Saved acounts
            </Typography.SmallBoldText>
          </GridArea>
          {!isBelow450px && (
            <GridArea area={'pair'}>
              <Typography.SmallBoldText color={'text8'} sx={{ textTransform: 'uppercase' }}>
                Pair
              </Typography.SmallBoldText>
            </GridArea>
          )}
          <GridArea area={'value'} justify={'end'}>
            <Typography.SmallBoldText color={'text8'} sx={{ textTransform: 'uppercase' }}>
              Value
            </Typography.SmallBoldText>
          </GridArea>
        </Header>
        <Divider />
        {filteredSavedAccounts.length > 0 ? (
          filteredSavedAccounts.map((account) => (
            <div key={account.id}>
              <Account isBelow600px={isBelow600px}>
                <GridArea area={'account'}>
                  <InternalListLink to={'/account/' + account.id}>
                    <Typography.LargeText color={'text8'}>
                      {isBelow800px ? shortenAddress(account.id) : account.id}
                    </Typography.LargeText>
                  </InternalListLink>
                </GridArea>
                <GridArea area={'pair'}>
                  <Flex alignItems={'center'} style={{ gap: '8px' }}>
                    {!isBelow450px && (
                      <>
                        <DoubleTokenLogo a0={account.pair.token0.id} a1={account.pair.token1.id} size={20} />
                        <InternalListLink to={'/pair/' + account.pair.id}>
                          <Typography.LargeText>
                            {account.pair.token0.symbol}-{account.pair.token1.symbol}
                          </Typography.LargeText>
                        </InternalListLink>
                      </>
                    )}
                  </Flex>
                </GridArea>
                <GridArea area={'value'} justify={'end'}>
                  <LiquidityPositionValue user={account.id} pair={account.pair.id} />
                </GridArea>
                <GridArea area={'action'} justify={'end'}>
                  <TrashIcon onClick={() => removeAccount(account.id)}>
                    <Icon icon={<Trash2 size={16} />} marginRight={0} color={'text6'} />
                  </TrashIcon>
                </GridArea>
              </Account>
              <Divider />
            </div>
          ))
        ) : (
          <>
            <Account isBelow600px={isBelow600px}>
              <Typography.LargeText color={'text8'}>No saved accounts</Typography.LargeText>
              <Divider />
            </Account>
          </>
        )}
      </Wrapper>
      <Flex justifyContent={isBelow600px ? 'center' : 'flex-start'}>
        <CounterBox>
          <Typography.Custom
            color={'text1'}
            sx={{ fontSize: '12px', lineHeight: '15px', fontWeight: 600, marginRight: '6px', userSelect: 'none' }}
          >
            {savedAccountsCount}
          </Typography.Custom>
          <Typography.Custom
            color={'text1'}
            sx={{ fontSize: '12px', lineHeight: '15px', fontWeight: 600, marginRight: '6px', userSelect: 'none' }}
          >
            /
          </Typography.Custom>
          <Typography.Custom
            color={'text10'}
            sx={{ fontSize: '12px', lineHeight: '15px', fontWeight: 600, userSelect: 'none' }}
          >
            {SAVED_ACCOUNTS_LIMIT}
          </Typography.Custom>
        </CounterBox>
      </Flex>
    </>
  );
};

export default SavedAccounts;
