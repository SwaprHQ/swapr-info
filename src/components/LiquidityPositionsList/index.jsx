import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useState, useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import { useMedia } from 'react-use';
import { Flex } from 'rebass';

import { Divider } from '..';
import { Typography } from '../../Theme';
import { formattedNum, shortenAddress } from '../../utils';
import DoubleTokenLogo from '../DoubleLogo';
import { InternalListLink } from '../Link';
import LocalLoader from '../LocalLoader';
import PageButtons from '../PageButtons';
import Panel from '../Panel';
import { DashGrid } from './styled';

dayjs.extend(utc);

const FlexText = ({ area, color, justifyContent, children }) => (
  <Flex area={area} justifyContent={justifyContent}>
    <Typography.LargeText color={color || 'text1'} sx={{ display: 'flex', alignItems: 'center' }}>
      {children}
    </Typography.LargeText>
  </Flex>
);

function LiquidityPositionsList({ lps, disbaleLinks, maxItems = 10 }) {
  const isBelow450px = useMedia('(max-width: 450px)');
  const isBelow600px = useMedia('(max-width: 600px)');
  const isBelow800px = useMedia('(max-width: 800px)');

  // pagination
  const [page, setPage] = useState(1);
  const [maxPage, setMaxPage] = useState(1);
  const ITEMS_PER_PAGE = maxItems;

  useEffect(() => {
    setMaxPage(1); // edit this to do modular
    setPage(1);
  }, [lps]);

  useEffect(() => {
    if (lps) {
      let extraPages = 1;
      if (Object.keys(lps).length % ITEMS_PER_PAGE === 0) {
        extraPages = 0;
      }
      setMaxPage(Math.floor(Object.keys(lps).length / ITEMS_PER_PAGE) + extraPages);
    }
  }, [ITEMS_PER_PAGE, lps]);

  const ListItem = ({ lp, index }) => {
    return (
      <DashGrid style={{ height: '48px' }}>
        {!isBelow600px && <FlexText area={'number'}>{index}</FlexText>}
        <FlexText area={'name'} justifyContent={'flex-start'}>
          <InternalListLink to={'/account/' + lp.user.id}>
            <Typography.LargeText color={'text8'}>
              {isBelow800px ? shortenAddress(lp.user.id) : lp.user.id}
            </Typography.LargeText>
          </InternalListLink>
        </FlexText>
        {!isBelow450px && (
          <Flex alignItems={'center'} justifyContent={'flex-start'} style={{ gap: '8px' }}>
            <>
              <DoubleTokenLogo a0={lp.token0} a1={lp.token1} size={20} />
              <InternalListLink to={'/pair/' + lp.pairAddress}>
                <Typography.LargeText color={'text8'}>{lp.pairName}</Typography.LargeText>
              </InternalListLink>
            </>
          </Flex>
        )}
        <FlexText area={'value'}>
          <Typography.LargeText color={'text8'}>{formattedNum(lp.usd, true)}</Typography.LargeText>
        </FlexText>
      </DashGrid>
    );
  };

  const liquidityProvidersList =
    lps &&
    lps.slice(ITEMS_PER_PAGE * (page - 1), page * ITEMS_PER_PAGE).map((lp, index) => {
      return (
        <div key={index}>
          <ListItem key={index} index={(page - 1) * ITEMS_PER_PAGE + index + 1} lp={lp} />
          <Divider />
        </div>
      );
    });

  return (
    <>
      <Panel style={{ padding: isBelow600px ? '20px 0' : '32px 0' }}>
        <DashGrid
          center={true}
          disbaleLinks={disbaleLinks}
          style={{ height: 'fit-content', padding: '0 36px 24px 36px' }}
        >
          {!isBelow600px && <FlexText area={'number'}>#</FlexText>}
          <Flex alignItems={'center'} sx={{ justifyContent: 'flex-start' }}>
            <Typography.SmallBoldText color={'text8'} sx={{ display: 'flex', alignItems: 'center' }}>
              ACCOUNT
            </Typography.SmallBoldText>
          </Flex>
          {!isBelow450px && (
            <Flex alignItems={'center'} sx={{ justifyContent: 'flex-start' }}>
              <Typography.SmallBoldText color={'text8'} sx={{ display: 'flex', alignItems: 'center' }}>
                PAIR
              </Typography.SmallBoldText>
            </Flex>
          )}
          <Typography.SmallBoldText color={'text8'} sx={{ display: 'flex', alignItems: 'center' }}>
            VALUE
          </Typography.SmallBoldText>
        </DashGrid>
        <Divider />
        {!liquidityProvidersList ? <LocalLoader /> : liquidityProvidersList}
      </Panel>
      <PageButtons
        activePage={page}
        maxPages={maxPage}
        onPreviousClick={() => setPage(page === 1 ? page : page - 1)}
        onNextClick={() => setPage(page === maxPage ? page : page + 1)}
      />
    </>
  );
}

export default withRouter(LiquidityPositionsList);
