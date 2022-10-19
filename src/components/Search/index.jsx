import PropTypes from 'prop-types';
import { useState, useEffect, useMemo, useRef } from 'react';

import { Typography } from '../../Theme';
import { PAIR_SEARCH, TOKEN_SEARCH } from '../../apollo/queries';
import { OVERVIEW_TOKEN_BLACKLIST, PAIR_BLACKLIST } from '../../constants';
import { useAllPairsInSwapr, useAllTokensInSwapr } from '../../contexts/GlobalData';
import { useSwaprSubgraphClient } from '../../contexts/Network';
import { useAllPairData, usePairData } from '../../contexts/PairData';
import { useAllTokenData, useTokenData } from '../../contexts/TokenData';
import { updateNameData } from '../../utils/data';
import DoubleTokenLogo from '../DoubleLogo';
import FormattedName from '../FormattedName';
import { BasicLink } from '../Link';
import { RowFixed } from '../Row';
import TokenLogo from '../TokenLogo';
import { Container, Wrapper, Input, SearchIconLarge, CloseIcon, Menu, MenuItem, Heading } from './styled';

const Search = ({ small = false }) => {
  const client = useSwaprSubgraphClient();
  let allTokens = useAllTokensInSwapr();
  const allTokenData = useAllTokenData();

  let allPairs = useAllPairsInSwapr();
  const allPairData = useAllPairData();

  const [showMenu, toggleMenu] = useState(false);
  const [value, setValue] = useState('');
  const [, toggleShadow] = useState(false);
  const [, toggleBottomShadow] = useState(false);

  // fetch new data on tokens and pairs if needed
  useTokenData(value);
  usePairData(value);

  useEffect(() => {
    if (value !== '') {
      toggleMenu(true);
    } else {
      toggleMenu(false);
    }
  }, [value]);

  const [searchedTokens, setSearchedTokens] = useState([]);
  const [searchedPairs, setSearchedPairs] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        if (value?.length > 0) {
          let tokens = await client.query({
            query: TOKEN_SEARCH,
            variables: {
              value: value ? value.toUpperCase() : '',
              id: value,
            },
          });

          let pairs = await client.query({
            query: PAIR_SEARCH,
            variables: {
              tokens: tokens.data.asSymbol?.map((t) => t.id),
              id: value,
            },
          });

          setSearchedPairs(
            updateNameData(pairs.data.as0)
              .concat(updateNameData(pairs.data.as1))
              .concat(updateNameData(pairs.data.asAddress)),
          );
          const foundTokens = tokens.data.asSymbol.concat(tokens.data.asAddress).concat(tokens.data.asName);
          setSearchedTokens(foundTokens);
        }
      } catch (e) {
        console.log(e);
      }
    }
    fetchData();
  }, [value, client]);

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  }

  // add the searched tokens to the list if not found yet
  allTokens = allTokens.concat(
    searchedTokens.filter((searchedToken) => {
      let included = false;
      updateNameData();
      allTokens.map((token) => {
        if (token.id === searchedToken.id) {
          included = true;
        }
        return true;
      });
      return !included;
    }),
  );

  const uniqueTokens = useMemo(() => {
    return [...new Map(allTokens?.map((token) => [token.id, token])).values()];
  }, [allTokens]);

  allPairs = allPairs.concat(
    searchedPairs.filter((searchedPair) => {
      let included = false;
      allPairs.map((pair) => {
        if (pair.id === searchedPair.id) {
          included = true;
        }
        return true;
      });
      return !included;
    }),
  );

  const uniquePairs = useMemo(() => {
    return [...new Map(allPairs?.map((pair) => [pair.id, pair])).values()];
  }, [allPairs]);

  const filteredTokenList = useMemo(() => {
    return uniqueTokens
      ? uniqueTokens
          .sort((a, b) => {
            if (OVERVIEW_TOKEN_BLACKLIST.includes(a.id)) {
              return 1;
            }
            if (OVERVIEW_TOKEN_BLACKLIST.includes(b.id)) {
              return -1;
            }
            const tokenA = allTokenData[a.id];
            const tokenB = allTokenData[b.id];
            if (tokenA?.oneDayVolumeUSD && tokenB?.oneDayVolumeUSD) {
              return tokenA.oneDayVolumeUSD > tokenB.oneDayVolumeUSD ? -1 : 1;
            }
            if (tokenA?.oneDayVolumeUSD && !tokenB?.oneDayVolumeUSD) {
              return -1;
            }
            if (!tokenA?.oneDayVolumeUSD && tokenB?.oneDayVolumeUSD) {
              return tokenA?.totalLiquidity > tokenB?.totalLiquidity ? -1 : 1;
            }
            return 1;
          })
          .filter((token) => {
            if (OVERVIEW_TOKEN_BLACKLIST.includes(token.id)) {
              return false;
            }
            const regexMatches = Object.keys(token).map((tokenEntryKey) => {
              const isAddress = value.slice(0, 2) === '0x';
              if (tokenEntryKey === 'id' && isAddress) {
                return token[tokenEntryKey].match(new RegExp(escapeRegExp(value), 'i'));
              }
              if (tokenEntryKey === 'symbol' && !isAddress) {
                return token[tokenEntryKey].match(new RegExp(escapeRegExp(value), 'i'));
              }
              if (tokenEntryKey === 'name' && !isAddress) {
                return token[tokenEntryKey].match(new RegExp(escapeRegExp(value), 'i'));
              }
              return false;
            });
            return regexMatches.some((m) => m);
          })
      : [];
  }, [allTokenData, uniqueTokens, value]);

  const filteredPairList = useMemo(() => {
    return uniquePairs
      ? uniquePairs
          .sort((a, b) => {
            const pairA = allPairData[a.id];
            const pairB = allPairData[b.id];
            if (pairA?.trackedReserveNativeCurrency && pairB?.trackedReserveNativeCurrency) {
              return parseFloat(pairA.trackedReserveNativeCurrency) > parseFloat(pairB.trackedReserveNativeCurrency)
                ? -1
                : 1;
            }
            if (pairA?.trackedReserveNativeCurrency && !pairB?.trackedReserveNativeCurrency) {
              return -1;
            }
            if (!pairA?.trackedReserveNativeCurrency && pairB?.trackedReserveNativeCurrency) {
              return 1;
            }
            return 0;
          })
          .filter((pair) => {
            if (PAIR_BLACKLIST.includes(pair.id)) {
              return false;
            }
            if (value && value.includes(' ')) {
              const pairA = value.split(' ')[0]?.toUpperCase();
              const pairB = value.split(' ')[1]?.toUpperCase();
              return (
                (pair.token0.symbol.includes(pairA) || pair.token0.symbol.includes(pairB)) &&
                (pair.token1.symbol.includes(pairA) || pair.token1.symbol.includes(pairB))
              );
            }
            if (value && value.includes('-')) {
              const pairA = value.split('-')[0]?.toUpperCase();
              const pairB = value.split('-')[1]?.toUpperCase();
              return (
                (pair.token0.symbol.includes(pairA) || pair.token0.symbol.includes(pairB)) &&
                (pair.token1.symbol.includes(pairA) || pair.token1.symbol.includes(pairB))
              );
            }
            const regexMatches = Object.keys(pair).map((field) => {
              const isAddress = value.slice(0, 2) === '0x';
              if (field === 'id' && isAddress) {
                return pair[field].match(new RegExp(escapeRegExp(value), 'i'));
              }
              if (field === 'token0') {
                return (
                  pair[field].symbol.match(new RegExp(escapeRegExp(value), 'i')) ||
                  pair[field].name.match(new RegExp(escapeRegExp(value), 'i'))
                );
              }
              if (field === 'token1') {
                return (
                  pair[field].symbol.match(new RegExp(escapeRegExp(value), 'i')) ||
                  pair[field].name.match(new RegExp(escapeRegExp(value), 'i'))
                );
              }
              return false;
            });
            return regexMatches.some((m) => m);
          })
      : [];
  }, [allPairData, uniquePairs, value]);

  useEffect(() => {
    if (Object.keys(filteredTokenList).length > 2) {
      toggleShadow(true);
    } else {
      toggleShadow(false);
    }
  }, [filteredTokenList]);

  useEffect(() => {
    if (Object.keys(filteredPairList).length > 2) {
      toggleBottomShadow(true);
    } else {
      toggleBottomShadow(false);
    }
  }, [filteredPairList]);

  const [tokensShown, setTokensShown] = useState(3);
  const [pairsShown, setPairsShown] = useState(3);

  function onDismiss() {
    setPairsShown(3);
    setTokensShown(3);
    toggleMenu(false);
    setValue('');
  }

  // refs to detect clicks outside modal
  const wrapperRef = useRef();
  const menuRef = useRef();

  const handleClick = (e) => {
    if (
      !(menuRef.current && menuRef.current.contains(e.target)) &&
      !(wrapperRef.current && wrapperRef.current.contains(e.target))
    ) {
      setPairsShown(3);
      setTokensShown(3);
      toggleMenu(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  });

  return (
    <Container>
      <Wrapper open={showMenu} shadow={true}>
        <Input
          large={!small}
          type={'text'}
          ref={wrapperRef}
          placeholder={'Search'}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
          }}
          onFocus={() => {
            if (!showMenu) {
              toggleMenu(true);
            }
          }}
        />
        {!showMenu ? (
          <SearchIconLarge
            onClick={() => {
              toggleMenu(true);
            }}
          />
        ) : (
          <CloseIcon
            onClick={() => {
              toggleMenu(false);
            }}
          />
        )}
      </Wrapper>
      <Menu hide={!showMenu} ref={menuRef}>
        <Heading>
          <Typography.LargeText color={'text2'}>Pairs</Typography.LargeText>
        </Heading>
        <div>
          {filteredPairList && Object.keys(filteredPairList).length === 0 && (
            <MenuItem>
              <Typography.Text>No results</Typography.Text>
            </MenuItem>
          )}
          {filteredPairList &&
            filteredPairList.slice(0, pairsShown).map((pair) => {
              //format incorrect names
              updateNameData(pair);
              return (
                <BasicLink to={'/pair/' + pair.id} key={pair.id} onClick={onDismiss}>
                  <MenuItem>
                    <DoubleTokenLogo
                      a0={pair?.token0?.id}
                      a1={pair?.token1?.id}
                      defaultText0={pair?.token0?.symbol}
                      defaultText1={pair?.token1?.symbol}
                      margin={true}
                    />
                    <Typography.LargeText color={'text1'} sx={{ marginLeft: '20px' }}>
                      {pair.token0.symbol + '-' + pair.token1.symbol} Pair
                    </Typography.LargeText>
                  </MenuItem>
                </BasicLink>
              );
            })}
          <Heading
            hide={!(Object.keys(filteredPairList).length > 3 && Object.keys(filteredPairList).length >= pairsShown)}
          >
            <span
              onClick={() => {
                setPairsShown(pairsShown + 5);
              }}
            >
              <Typography.Text sx={{ ':hover': { cursor: 'pointer' } }} color={'text2'}>
                See more...
              </Typography.Text>
            </span>
          </Heading>
        </div>
        <Heading>
          <Typography.LargeText color={'text2'}>Tokens</Typography.LargeText>
        </Heading>
        <div>
          {Object.keys(filteredTokenList).length === 0 && (
            <MenuItem>
              <Typography.Text>No results</Typography.Text>
            </MenuItem>
          )}
          {filteredTokenList.slice(0, tokensShown).map((token) => {
            // update displayed names
            updateNameData({ token0: token });
            return (
              <BasicLink to={'/token/' + token.id} key={token.id} onClick={onDismiss}>
                <MenuItem>
                  <RowFixed>
                    <TokenLogo address={token.id} defaultText={token.symbol} style={{ marginRight: '10px' }} />
                    <FormattedName text={token.name} maxCharacters={20} style={{ marginRight: '6px' }} />
                    (<FormattedName text={token.symbol} maxCharacters={6} />)
                  </RowFixed>
                </MenuItem>
              </BasicLink>
            );
          })}
          <Heading
            hide={!(Object.keys(filteredTokenList).length > 3 && Object.keys(filteredTokenList).length >= tokensShown)}
          >
            <span
              onClick={() => {
                setTokensShown(tokensShown + 5);
              }}
            >
              <Typography.Text sx={{ ':hover': { cursor: 'pointer' } }} color={'text2'}>
                See more...
              </Typography.Text>
            </span>
          </Heading>
        </div>
      </Menu>
    </Container>
  );
};

Search.propTypes = {
  small: PropTypes.bool,
};

export default Search;
