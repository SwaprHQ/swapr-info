import { useEffect } from 'react';
import 'feather-icons';
import { useMedia } from 'react-use';
import { Flex } from 'rebass';

import { Typography } from '../Theme';
import { PageWrapper, FullWrapper } from '../components';
import PairList from '../components/PairList';
import Search from '../components/Search';
import { useAllPairData } from '../contexts/PairData';

function AllPairsPage() {
  const allPairs = useAllPairData();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const below800 = useMedia('(max-width: 800px)');

  return (
    <PageWrapper>
      <FullWrapper>
        <Flex alignItems={'flex-end'} justifyContent={'space-between'}>
          <Typography.MediumHeader>Top Pairs</Typography.MediumHeader>
          {!below800 && <Search small={true} />}
        </Flex>
        <PairList pairs={allPairs} disbaleLinks={true} maxItems={20} />
      </FullWrapper>
    </PageWrapper>
  );
}

export default AllPairsPage;
