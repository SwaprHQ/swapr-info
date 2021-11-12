import React, { useState, useEffect } from "react";
import "feather-icons";

import { TYPE } from "../Theme";
import Panel from "../components/Panel";
import {
  useLiqudityMiningCampaignData,
} from "../contexts/PairData";
import { PageWrapper, FullWrapper } from "../components";
import { RowBetween } from "../components/Row";
import Search from "../components/Search";
import DropdownSelect from "../components/DropdownSelect";
import { useMedia } from "react-use";
import FarmingList from "../components/FarmingList";
import memoize from "../utils/memoize";

function FarmingPage() {
  // UNIX time
  const timeNow = Math.floor(Date.now() / 1000);

  const campaignData = useLiqudityMiningCampaignData();
  const [campaigns, setCampaigns] = useState(campaignData);
  const [campaignStatus, setCampaignStatus] = useState("active");

  useEffect(() => {
    if (campaignData) {
      filterCampaigns("active");
    }
  }, [campaignData]);

  const filterCampaigns = (status) => {
    if (!campaignData) { return };
    if (status === "active") {
      const filtered = memoizedActiveCampaigns();
      setCampaigns(filtered);
    } else if (status === "expired") {
      const filtered = memoizedExpiredCampaigns();
      setCampaigns(filtered);
    }
    setCampaignStatus(status);
  }

  const activeCampaigns = () => {
    return Object.keys(campaignData)
      .filter(key => campaignData[key].startsAt < timeNow && campaignData[key].endsAt > timeNow)
      .reduce((obj, key) => {
        return {
          ...obj,
          [key]: campaignData[key]
        };
      }, {});
  }

  const expiredCampaigns = () => {
    return Object.keys(campaignData)
      .filter(key => campaignData[key].endsAt < timeNow)
      .reduce((obj, key) => {
        return {
          ...obj,
          [key]: campaignData[key]
        };
      }, {});
  }

  const options = {
    "expired": "Expired Campaigns",
    "active": "Active Campaigns"
  }

  const handleFilterCampaigns = (selected) => {
    const status = Object.keys(options).find(key => options[key] === selected);
    filterCampaigns(status);
  }

  const memoizedActiveCampaigns = memoize(activeCampaigns);
  const memoizedExpiredCampaigns = memoize(expiredCampaigns);

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
          setActive={handleFilterCampaigns}
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
