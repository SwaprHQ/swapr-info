import React, { useState, useEffect } from "react";
import "feather-icons";

import { TYPE } from "../Theme";
import Panel from "../components/Panel";
import {
  useLiquidityMiningCampaignData,
} from "../contexts/PairData";

import { PageWrapper, FullWrapper } from "../components";
import { RowBetween } from "../components/Row";
import Search from "../components/Search";
import DropdownSelect from "../components/DropdownSelect";
import { useMedia } from "react-use";
import FarmingList from "../components/FarmingList";

function FarmingPage() {

  const activeCampaigns = useLiquidityMiningCampaignData("active");
  const expiredCampaigns = useLiquidityMiningCampaignData("expired");
  const [campaigns, setCampaigns] = useState({});
  const [campaignStatus, setCampaignStatus] = useState("active");

  useEffect(() => {
    if (campaignStatus === "active") {
      setCampaigns(activeCampaigns);
    } else if (campaignStatus === "expired") {
      setCampaigns(expiredCampaigns);
    }
  }, [campaignStatus, activeCampaigns, expiredCampaigns]);

  const options = {
    "expired": "Expired Campaigns",
    "active": "Active Campaigns"
  }

  const handleUpdateCampaignStatus = (selected) => {
    const status = Object.keys(options).find(key => options[key] === selected);
    setCampaignStatus(status);
  }

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
        <DropdownSelect
          options={options}
          active={options[campaignStatus]}
          setActive={handleUpdateCampaignStatus}
          color={"#4526A2"}
          width={"180px"}
        />
        <Panel style={{ padding: below800 && "1rem 0 0 0 " }}>
          <FarmingList
            campaigns={campaigns}
            disbaleLinks={true}
            maxItems={50}
          />
        </Panel>
      </FullWrapper>
    </PageWrapper>
  );
}

export default FarmingPage;
