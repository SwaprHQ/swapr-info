import React, { useEffect } from "react";
import "feather-icons";

import { TYPE } from "../Theme";
import Panel from "../components/Panel";
import {
  useLiqudityMiningCampaignData,
} from "../contexts/PairData";
import { PageWrapper, FullWrapper } from "../components";
import { RowBetween } from "../components/Row";
import Search from "../components/Search";
import { useMedia } from "react-use";
import FarmingList from "../components/FarmingList";

function FarmingPage() {
  const campaignData = useLiqudityMiningCampaignData();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const below800 = useMedia("(max-width: 800px)");

  return (
    <PageWrapper>
      <FullWrapper>
        <RowBetween>
          <TYPE.largeHeader>Farming</TYPE.largeHeader>
          {!below800 && <Search small={true} />}
        </RowBetween>
        <Panel style={{ padding: below800 && "1rem 0 0 0 " }}>
          <FarmingList
            campaigns={campaignData}
            disbaleLinks={true}
            maxItems={50}
          />
        </Panel>
      </FullWrapper>
    </PageWrapper>
  );
}

export default FarmingPage;
