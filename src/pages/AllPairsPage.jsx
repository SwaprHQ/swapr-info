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

  const below600 = useMedia('(max-width: 600px)');

  return (
    <PageWrapper>
      <FullWrapper gap={'0'}>
        <Flex alignItems={'center'} justifyContent={below600 ? 'center' : 'space-between'}>
          <Typography.MediumHeader
            color={'text10'}
            sx={{ textAlign: below600 ? 'center' : 'left', marginTop: '40px', marginBottom: '20px' }}
          >
            Top Pairs
          </Typography.MediumHeader>
          {!below600 && <Search />}
        </Flex>
        <PairList pairs={allPairs} disbaleLinks={true} maxItems={20} />
      </FullWrapper>
    </PageWrapper>
  );
}

export default AllPairsPage;
