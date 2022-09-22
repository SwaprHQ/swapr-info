import { useState, useEffect } from 'react';
import 'feather-icons';
import { useMedia } from 'react-use';
import { Box, Flex } from 'rebass';

import { Typography } from '../Theme';
import { PageWrapper, FullWrapper } from '../components';
import DropdownBasicSelect from '../components/DropdownBasicSelect';
import FarmingList from '../components/FarmingList';
import Search from '../components/Search';
import { STATUS, useLiquidityMiningCampaigns } from '../contexts/PairData';

const AllFarmsPage = () => {
  const campaigns = useLiquidityMiningCampaigns();
  const [statusFilter, setStatusFilter] = useState('active');

  const handleStatusFilterChange = (selected) => {
    setStatusFilter(selected === 'Active Campaigns' ? 'active' : 'expired');
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const below600 = useMedia('(max-width: 600px)');

  return (
    <PageWrapper>
      <FullWrapper gap={0}>
        <Flex
          alignItems={'center'}
          justifyContent={'space-between'}
          flexDirection={below600 ? 'column' : 'row'}
          marginBottom={'20px'}
        >
          <Typography.MediumHeader
            color={'text10'}
            sx={{ textAlign: below600 ? 'center' : 'left', marginTop: '40px', marginBottom: '20px' }}
          >
            Farming
          </Typography.MediumHeader>
          <Search />
        </Flex>
        <Box marginBottom={'20px'}>
          <DropdownBasicSelect
            options={{ active: 'Active Campaigns', expired: 'Expired Campaigns' }}
            active={statusFilter === STATUS.ACTIVE ? 'Active Campaigns' : 'Expired Campaigns'}
            setActive={handleStatusFilterChange}
            width={below600 ? 'auto' : '224px'}
          />
        </Box>
        <FarmingList campaigns={campaigns && campaigns[statusFilter]} disbaleLinks={true} maxItems={10} />
      </FullWrapper>
    </PageWrapper>
  );
};

export default AllFarmsPage;
