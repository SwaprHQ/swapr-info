import React, { useState, useEffect } from 'react';
import 'feather-icons';
import { useMedia } from 'react-use';

import { TYPE } from '../Theme';
import { PageWrapper, FullWrapper } from '../components';
import DropdownSelect from '../components/DropdownSelect';
import FarmingList from '../components/FarmingList';
import Panel from '../components/Panel';
import { RowBetween } from '../components/Row';
import Search from '../components/Search';
import { STATUS, useLiquidityMiningCampaignData } from '../contexts/PairData';

function FarmingPage() {
  const miningData = useLiquidityMiningCampaignData();
  const [campaigns, setCampaigns] = useState({});
  const [campaignStatus, setCampaignStatus] = useState('active');

  useEffect(() => {
    setCampaigns(miningData[campaignStatus]);
  }, [campaignStatus, miningData]);

  const handleUpdateCampaignStatus = (selected) => {
    const key = Object.keys(STATUS).find((k) => selected.toLowerCase().includes(STATUS[k]));
    setCampaignStatus(STATUS[key]);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const below800 = useMedia('(max-width: 800px)');

  return (
    <PageWrapper>
      <FullWrapper>
        <RowBetween>
          <TYPE.largeHeader>Farming</TYPE.largeHeader>
          {!below800 && <Search small={true} />}
        </RowBetween>
        <DropdownSelect
          options={['Active Campaigns', 'Expired Campaigns']}
          active={campaignStatus === STATUS.ACTIVE ? 'Active Campaigns' : 'Expired Campaigns'}
          setActive={handleUpdateCampaignStatus}
          color={'#4526A2'}
          width={'180px'}
        />
        <Panel style={{ padding: below800 && '1rem 0 0 0 ' }}>
          <FarmingList campaigns={campaigns} disbaleLinks={true} maxItems={50} />
        </Panel>
      </FullWrapper>
    </PageWrapper>
  );
}

export default FarmingPage;
